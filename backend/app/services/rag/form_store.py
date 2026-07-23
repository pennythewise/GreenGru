"""Embed loan/grant application-form JSON with Qwen, store in upload_chunks.

Deterministic flatten → LangChain chunk → Qwen3-Embedding-8B → Supabase/local.
No regulated numbers are computed here — field text only.
"""

from __future__ import annotations

import hashlib
import json
import logging
from typing import Any, Literal

from app.config import get_settings
from app.services.pdf_embedding import embed_texts
from app.services.rag.chunking import chunk_markdown
from app.services.rag.upload_store import store_upload_chunks

logger = logging.getLogger(__name__)
settings = get_settings()

Channel = Literal["loan", "grant"]

CHECKLIST_ITEM = "application_form"
SOURCE_FILE = {
    "loan": "loan-application-form",
    "grant": "grant-application-form",
}


def _flatten(value: Any, *, prefix: str = "") -> list[str]:
    """Turn nested form JSON into labeled markdown lines (skip empties)."""
    lines: list[str] = []
    if value is None:
        return lines
    if isinstance(value, bool):
        if value:
            lines.append(f"- **{prefix}**: true" if prefix else "- true")
        return lines
    if isinstance(value, (int, float)):
        lines.append(f"- **{prefix}**: {value}" if prefix else f"- {value}")
        return lines
    if isinstance(value, str):
        text = value.strip()
        if text:
            lines.append(f"- **{prefix}**: {text}" if prefix else f"- {text}")
        return lines
    if isinstance(value, list):
        for i, item in enumerate(value):
            key = f"{prefix}[{i}]" if prefix else f"item[{i}]"
            if isinstance(item, dict) and "name_cn" in item:
                # use_of_funds categories — only selected
                if item.get("selected"):
                    label = item.get("name_cn") or item.get("name_en") or key
                    num = item.get("number")
                    lines.append(f"- **selected_category**: {num}. {label}")
                continue
            lines.extend(_flatten(item, prefix=key))
        return lines
    if isinstance(value, dict):
        for k, v in value.items():
            next_prefix = f"{prefix}.{k}" if prefix else str(k)
            lines.extend(_flatten(v, prefix=next_prefix))
        return lines
    return lines


def application_form_to_markdown(route: Channel, form: dict[str, Any]) -> str:
    title = (
        "# Green loan application form"
        if route == "loan"
        else "# Zero-carbon factory grant application form"
    )
    body = "\n".join(_flatten(form))
    if not body.strip():
        return ""
    return f"{title}\n\n{body}\n"


def form_content_hash(form: dict[str, Any]) -> str:
    raw = json.dumps(form, sort_keys=True, ensure_ascii=False, default=str)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


async def ingest_application_form(
    *,
    route: Channel,
    upload_session_id: str,
    application_form: dict[str, Any],
    language: str = "zh",
) -> dict[str, Any]:
    """Flatten form → chunk → Qwen embed → upload_chunks (same session as Section A)."""
    session = (upload_session_id or "").strip()
    if not session:
        return {"stored": False, "reason": "missing_session", "chunk_count": 0}
    if not isinstance(application_form, dict) or not application_form:
        return {"stored": False, "reason": "empty_form", "chunk_count": 0}

    channel: Channel = route
    markdown = application_form_to_markdown(channel, application_form)
    if not markdown.strip():
        return {"stored": False, "reason": "no_text", "chunk_count": 0}

    chunks = chunk_markdown(markdown)
    if not chunks:
        return {"stored": False, "reason": "no_chunks", "chunk_count": 0}

    file_hash = form_content_hash(application_form)
    source_file = SOURCE_FILE[channel]
    vectors = embed_texts([c.text for c in chunks])
    storage = await store_upload_chunks(
        channel=channel,
        upload_session_id=session,
        checklist_item=CHECKLIST_ITEM,
        language=language or "zh",
        source_file=source_file,
        file_hash=file_hash,
        chunks=chunks,
        vectors=vectors,
        model=settings.model_embedding,
    )

    logger.info(
        "Application form embed · route=%s · session=%s · chunks=%s · storage=%s",
        channel,
        session[:8],
        len(chunks),
        storage,
    )
    return {
        "stored": storage != "none",
        "reason": None if storage != "none" else "store_failed",
        "chunk_count": len(chunks),
        "storage": storage,
        "file_hash": file_hash,
        "source_file": source_file,
        "checklist_item": CHECKLIST_ITEM,
        "channel": channel,
        "upload_session_id": session,
        "model": settings.model_embedding,
        "char_count": len(markdown),
    }
