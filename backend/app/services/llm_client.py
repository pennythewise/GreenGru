"""Thin wrapper around the OpenAI-compatible client pointed at DashScope
(Qwen via Alibaba Cloud Model Studio), Beijing region (PRD §4, §10).

Written against the OpenAI Python SDK interface rather than a
DashScope-specific SDK, per the PRD's explicit rule, so a future provider
swap only touches base_url/api_key/model strings.

Mock mode (default when no API key is configured) returns a deterministic,
clearly-labeled stub instead of a real completion — this is what lets the
whole pipeline, including PDF generation, run end-to-end with zero external
config. It is NOT a substitute for real output-quality review before launch.
"""

import json
from typing import Any

from openai import OpenAI

from app.config import get_settings

settings = get_settings()

_client: OpenAI | None = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=settings.dashscope_api_key or "mock-key-unused-in-mock-mode",
            base_url=settings.dashscope_base_url,
        )
    return _client


def is_mock_mode() -> bool:
    return settings.llm_mock_mode or not settings.dashscope_api_key


def call_structured(
    *,
    model: str,
    system_prompt: str,
    user_prompt: str,
    mock_response: dict[str, Any],
    temperature: float = 0.0,
) -> dict[str, Any]:
    """Forces JSON output via response_format, matching the
    forced-tool-use/JSON pattern used throughout PRD §8. `mock_response` is
    what's returned in mock mode — callers supply a plausible, schema-valid
    stub so the rest of the pipeline (validator, PDF rendering) can be
    exercised without a real API key.

    Every task in this pipeline runs with thinking disabled (PRD §4.1) —
    schema extraction and templated prose don't benefit from reasoning
    tokens, so DashScope's enable_thinking flag is left off by omission
    (OpenAI-compatible mode defaults to non-thinking variants).
    """
    if is_mock_mode():
        return {**mock_response, "_mock": True}

    client = get_client()
    response = client.chat.completions.create(
        model=model,
        temperature=temperature,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    content = response.choices[0].message.content or "{}"
    return json.loads(content)


def call_prose(
    *,
    model: str,
    system_prompt: str,
    user_prompt: str,
    mock_response: str,
    temperature: float = 0.3,
) -> str:
    """For the writing agents (§8.6, §8.8, §8.10) — free-text prose output,
    still constrained by a prompt that lists only pre-computed numbers the
    model is allowed to restate (never compute)."""
    if is_mock_mode():
        return mock_response

    client = get_client()
    response = client.chat.completions.create(
        model=model,
        temperature=temperature,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    return response.choices[0].message.content or ""
