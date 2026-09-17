"""Thin wrapper around an OpenAI-compatible client for Qwen chat models.

Written against the OpenAI Python SDK interface so base_url / api_key / model
strings can change without touching call sites.

Per-role keys (copilot / classifier / vision / embedding / writing) fall back
to ``LLM_API_KEY`` when unset.

Mock mode (default when no API key is configured) returns a deterministic,
clearly-labeled stub instead of a real completion — this is what lets the
whole pipeline, including PDF generation, run end-to-end with zero external
config. It is NOT a substitute for real output-quality review before launch.
"""

from __future__ import annotations

import json
import logging
from typing import Any, Literal

from openai import OpenAI, OpenAIError

from app.config import get_settings

settings = get_settings()
log = logging.getLogger("app.llm")


class LlmCallError(RuntimeError):
    """Raised when the model endpoint fails or returns unusable output.

    Callers must NOT fall back to inventing a value — this surfaces to the
    API layer as a 503 so the operator can retry the stage (PRD §18 resume
    policy) instead of silently persisting a partial pipeline state.
    """

    def __init__(self, role: str, model: str, reason: str):
        super().__init__(f"LLM call failed (role={role}, model={model}): {reason}")
        self.role, self.model, self.reason = role, model, reason


def _parse_json_object(content: str) -> dict[str, Any]:
    """Tolerate a ```json fence around an otherwise valid object; reject anything else."""
    text = content.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
        text = text.strip()
    parsed = json.loads(text)
    if not isinstance(parsed, dict):
        raise ValueError(f"expected a JSON object, got {type(parsed).__name__}")
    return parsed

LlmRole = Literal[
    "default",
    "copilot",
    "classifier",
    "classifier_escalation",
    "vision",
    "pdf_vision",
    "intake_vision",
    "embedding",
    "writing",
]

_clients: dict[str, OpenAI] = {}


def get_client(*, role: LlmRole | str = "default", timeout: float | None = None) -> OpenAI:
    """Return a cached OpenAI client for ``role`` (separate key ⇒ separate client)."""
    key = settings.api_key_for(role) or "mock-key-unused-in-mock-mode"
    to = 50.0 if timeout is None else float(timeout)
    cache_key = f"{role}|{key[:12]}|{to}"
    client = _clients.get(cache_key)
    if client is None:
        client = OpenAI(
            api_key=key,
            base_url=settings.llm_base_url,
            timeout=to,
        )
        _clients[cache_key] = client
    return client


def is_mock_mode(*, role: LlmRole | str = "default") -> bool:
    return settings.llm_mock_mode or not settings.api_key_for(role)


def call_structured(
    *,
    model: str,
    system_prompt: str,
    user_prompt: str,
    mock_response: dict[str, Any],
    temperature: float = 0.0,
    role: LlmRole | str = "default",
    timeout: float | None = None,
) -> dict[str, Any]:
    """Forces JSON output via response_format, matching the
    forced-tool-use/JSON pattern used throughout PRD §8. `mock_response` is
    what's returned in mock mode — callers supply a plausible, schema-valid
    stub so the rest of the pipeline (validator, PDF rendering) can be
    exercised without a real API key.

    Every task in this pipeline runs with thinking disabled (PRD §4.1) —
    schema extraction and templated prose don't benefit from reasoning tokens.
    """
    if is_mock_mode(role=role):
        return {**mock_response, "_mock": True}

    client = get_client(role=role, timeout=timeout)
    try:
        response = client.chat.completions.create(
            model=model,
            temperature=temperature,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
    except OpenAIError as exc:
        log.warning("structured call failed role=%s model=%s: %s", role, model, exc)
        raise LlmCallError(str(role), model, f"{type(exc).__name__}: {exc}") from exc
    content = response.choices[0].message.content or "{}"
    try:
        return _parse_json_object(content)
    except (json.JSONDecodeError, ValueError) as exc:
        log.warning("structured call returned non-JSON role=%s model=%s: %.200s", role, model, content)
        raise LlmCallError(str(role), model, f"non-JSON response: {exc}") from exc


def call_prose(
    *,
    model: str,
    system_prompt: str,
    user_prompt: str,
    mock_response: str,
    temperature: float = 0.3,
    role: LlmRole | str = "writing",
) -> str:
    """For the writing agents (§8.6, §8.8, §8.10) — free-text prose output,
    still constrained by a prompt that lists only pre-computed numbers the
    model is allowed to restate (never compute)."""
    if is_mock_mode(role=role):
        return mock_response

    client = get_client(role=role)
    try:
        response = client.chat.completions.create(
            model=model,
            temperature=temperature,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
    except OpenAIError as exc:
        log.warning("prose call failed role=%s model=%s: %s", role, model, exc)
        raise LlmCallError(str(role), model, f"{type(exc).__name__}: {exc}") from exc
    content = response.choices[0].message.content or ""
    if not content.strip():
        raise LlmCallError(str(role), model, "empty completion")
    return content
