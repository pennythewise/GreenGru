"""Content-hash lookup so identical PDF bytes reuse Supabase vectors."""

from __future__ import annotations

import logging
from typing import Any, Literal

from app.services.pdf_embedding import file_content_hash
from app.services.supabase_store import _get_supabase_client

logger = logging.getLogger(__name__)

Channel = Literal["cbam", "loan", "grant"]
Corpus = Literal["kb", "upload"]


def namespaced_kb_hash(channel: Channel, content_sha256: str) -> str:
    """Match ``ingest_markdown_to_kb`` storage key."""
    return file_content_hash(f"{channel}:{content_sha256}".encode("utf-8"))


def lookup_hashes(
    *,
    channel: Channel,
    corpus: Corpus,
    content_hashes: list[str],
) -> dict[str, dict[str, Any]]:
    """Map raw content SHA-256 → hit metadata (chunk_count, source_file, …)."""
    hits: dict[str, dict[str, Any]] = {}
    unique = [h.strip().lower() for h in content_hashes if (h or "").strip()]
    if not unique:
        return hits

    client = _get_supabase_client()
    if client is None:
        return hits

    try:
        if corpus == "kb":
            for content_hash in unique:
                stored = namespaced_kb_hash(channel, content_hash)
                resp = (
                    client.table("kb_chunks")
                    .select("source_file,file_hash,model,chunk_index")
                    .eq("channel", channel)
                    .eq("file_hash", stored)
                    .order("chunk_index")
                    .limit(500)
                    .execute()
                )
                rows = resp.data or []
                if not rows:
                    continue
                hits[content_hash] = {
                    "content_hash": content_hash,
                    "file_hash": stored,
                    "chunk_count": len(rows),
                    "source_file": rows[0].get("source_file") or "",
                    "model": rows[0].get("model") or "",
                    "channel": channel,
                    "corpus": "kb",
                }
        else:
            for content_hash in unique:
                resp = (
                    client.table("upload_chunks")
                    .select(
                        "source_file,file_hash,model,chunk_index,checklist_item,channel"
                    )
                    .eq("file_hash", content_hash)
                    .eq("channel", channel)
                    .order("chunk_index")
                    .limit(500)
                    .execute()
                )
                rows = resp.data or []
                if not rows:
                    resp = (
                        client.table("upload_chunks")
                        .select(
                            "source_file,file_hash,model,chunk_index,checklist_item,channel"
                        )
                        .eq("file_hash", content_hash)
                        .order("chunk_index")
                        .limit(500)
                        .execute()
                    )
                    rows = resp.data or []
                if not rows:
                    continue
                hits[content_hash] = {
                    "content_hash": content_hash,
                    "file_hash": content_hash,
                    "chunk_count": len(rows),
                    "source_file": rows[0].get("source_file") or "",
                    "model": rows[0].get("model") or "",
                    "channel": channel,
                    "corpus": "upload",
                    "checklist_item": rows[0].get("checklist_item") or "",
                }
    except Exception as exc:  # noqa: BLE001
        logger.warning("hash lookup failed · corpus=%s · %s", corpus, exc)

    return hits
