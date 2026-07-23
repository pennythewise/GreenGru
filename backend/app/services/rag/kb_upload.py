"""Upload regulatory PDF → PyMuPDF/pypdf → chunk → Qwen embed → kb_chunks.

Used by Stage 1 KB upload for channel-scoped corpora (cbam / loan / grant).
No MinerU / VL — layout extractors only, then deterministic embedding.
"""

from __future__ import annotations

import logging
import re
import tempfile
from pathlib import Path
from typing import Any, Literal

from app.config import get_settings
from app.services.pdf_embedding import file_content_hash
from app.services.rag.embed_store import ingest_markdown_to_kb
from app.services.rag.mineru_convert import _layout_fallback

logger = logging.getLogger(__name__)
settings = get_settings()

Channel = Literal["cbam", "loan", "grant"]


def _display_pdf_name(filename: str) -> str:
    name = Path(filename or "kb.pdf").name.strip() or "kb.pdf"
    if not name.lower().endswith(".pdf"):
        name = f"{name}.pdf"
    return name


def _fs_pdf_name(file_hash: str) -> str:
    return f"{(file_hash or 'kb')[:16]}.pdf"


def _normalize_lang(language: str, channel: Channel) -> str:
    raw = (language or "").strip().lower()
    if raw in ("zh", "cn", "ch", "chinese", "zh-cn", "zh_cn"):
        return "zh"
    if raw in ("en", "english"):
        return "en"
    return "zh" if channel in ("loan", "grant") else "en"


async def ingest_kb_pdf(
    *,
    content: bytes,
    filename: str,
    channel: Channel,
    language: str = "",
) -> dict[str, Any]:
    """PyMuPDF → pypdf → markdown chunk → Qwen3-Embedding-8B → Supabase kb_chunks."""
    if not content:
        return {
            "stored": False,
            "reason": "empty_file",
            "chunk_count": 0,
            "channel": channel,
        }

    display = _display_pdf_name(filename)
    content_hash = file_content_hash(content)
    lang = _normalize_lang(language, channel)

    from app.services.rag.hash_lookup import lookup_hashes, namespaced_kb_hash

    existing = lookup_hashes(
        channel=channel, corpus="kb", content_hashes=[content_hash]
    ).get(content_hash)
    if existing:
        logger.info(
            "KB PDF cache hit · channel=%s · file=%s · chunks=%s",
            channel,
            display,
            existing.get("chunk_count"),
        )
        return {
            "stored": True,
            "reason": "cache_hit",
            "chunk_count": int(existing.get("chunk_count") or 0),
            "storage": "supabase",
            "file_hash": existing.get("file_hash")
            or namespaced_kb_hash(channel, content_hash),
            "source_file": existing.get("source_file") or display,
            "convert_method": "cache",
            "channel": channel,
            "language": lang,
            "model": existing.get("model") or settings.model_embedding,
            "cached": True,
            "char_count": 0,
        }

    fs_name = _fs_pdf_name(content_hash)

    with tempfile.TemporaryDirectory(
        prefix="rag_kb_", ignore_cleanup_errors=True
    ) as tmp:
        pdf_path = Path(tmp) / fs_name
        pdf_path.write_bytes(content)
        try:
            markdown, method = _layout_fallback(pdf_path)
        except Exception as exc:  # noqa: BLE001
            logger.exception("KB PDF extract failed · file=%s", display)
            return {
                "stored": False,
                "reason": f"extract_error: {exc}",
                "chunk_count": 0,
                "source_file": display,
                "channel": channel,
                "convert_method": None,
                "cached": False,
            }

    markdown = re.sub(r"\n{4,}", "\n\n\n", (markdown or "").strip())
    if not markdown:
        return {
            "stored": False,
            "reason": "no_text",
            "chunk_count": 0,
            "source_file": display,
            "channel": channel,
            "convert_method": method,
            "cached": False,
        }

    result = await ingest_markdown_to_kb(
        markdown=markdown + "\n",
        channel=channel,
        language=lang,
        source_file=display,
        content_for_hash=content,
    )
    result["convert_method"] = method
    result["source_file"] = display
    result["char_count"] = len(markdown)
    result["cached"] = False
    logger.info(
        "KB PDF ingest · channel=%s · file=%s · chunks=%s · method=%s · storage=%s",
        channel,
        display,
        result.get("chunk_count"),
        method,
        result.get("storage"),
    )
    return result


async def ingest_kb_pdfs_batch(
    *,
    items: list[dict[str, Any]],
    channel: Channel,
    language: str = "",
) -> dict[str, Any]:
    """Ingest multiple KB PDFs for one channel (sequential extract + embed)."""
    results: list[dict[str, Any]] = []
    total_chunks = 0
    for item in items:
        content = item.get("content") or b""
        filename = item.get("filename") or "kb.pdf"
        one = await ingest_kb_pdf(
            content=content,
            filename=filename,
            channel=channel,
            language=language,
        )
        results.append(one)
        if one.get("stored"):
            total_chunks += int(one.get("chunk_count") or 0)
    return {
        "results": results,
        "embedded_chunks": total_chunks,
        "file_count": len(results),
        "channel": channel,
        "stored_count": sum(1 for r in results if r.get("stored")),
    }
