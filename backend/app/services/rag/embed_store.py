"""Embed KB chunks and upsert into Supabase ``kb_chunks`` (local JSON fallback)."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Literal

from app.config import get_settings
from app.services.pdf_embedding import EMBEDDING_DIM, embed_texts, file_content_hash
from app.services.rag.chunking import KbChunk
from app.services.supabase_store import _get_supabase_client

logger = logging.getLogger(__name__)
settings = get_settings()

StorageBackend = Literal["supabase", "local", "none"]
Channel = Literal["cbam", "loan", "grant"]


async def store_kb_chunks(
    *,
    channel: Channel,
    language: str,
    source_file: str,
    file_hash: str,
    chunks: list[KbChunk],
    vectors: list[list[float]],
    model: str,
) -> StorageBackend:
    if len(chunks) != len(vectors):
        raise ValueError("chunks/vectors length mismatch")

    rows = [
        {
            "channel": channel,
            "language": language,
            "source_file": source_file,
            "file_hash": file_hash,
            "heading_path": c.heading_path,
            "chunk_index": c.chunk_index,
            "chunk_text": c.text,
            "embedding": vec,
            "model": model,
        }
        for c, vec in zip(chunks, vectors, strict=True)
    ]

    client = _get_supabase_client()
    if client is not None:
        try:
            # Replace by channel + source_file so a new file_hash does not leave
            # stale mock/old vectors alongside the fresh ingest.
            client.table("kb_chunks").delete().eq("channel", channel).eq(
                "source_file", source_file
            ).execute()
            # batch insert to avoid payload limits
            batch = 50
            for i in range(0, len(rows), batch):
                client.table("kb_chunks").insert(rows[i : i + batch]).execute()
            return "supabase"
        except Exception as exc:  # noqa: BLE001
            logger.warning("Supabase kb_chunks insert failed, local fallback: %s", exc)

    out_dir = Path(settings.local_storage_dir) / "kb_embeddings" / channel
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"{file_hash}.json"
    path.write_text(
        json.dumps(
            {
                "channel": channel,
                "language": language,
                "source_file": source_file,
                "file_hash": file_hash,
                "model": model,
                "dim": EMBEDDING_DIM,
                "chunks": [
                    {
                        "chunk_index": r["chunk_index"],
                        "heading_path": r["heading_path"],
                        "chunk_text": r["chunk_text"],
                        "embedding": r["embedding"],
                    }
                    for r in rows
                ],
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    return "local"


async def ingest_markdown_to_kb(
    *,
    markdown: str,
    channel: Channel,
    language: str,
    source_file: str,
    content_for_hash: bytes | None = None,
) -> dict[str, Any]:
    from app.services.rag.chunking import chunk_markdown

    chunks = chunk_markdown(markdown)
    if not chunks:
        return {
            "stored": False,
            "reason": "no_chunks",
            "chunk_count": 0,
            "storage": "none",
        }

    vectors = embed_texts([c.text for c in chunks])
    # Namespace by channel so the same PDF can live in grant + loan without
    # colliding on unique(file_hash, chunk_index) or deleting sibling channels.
    raw_hash = file_content_hash(content_for_hash or markdown.encode("utf-8"))
    file_hash = file_content_hash(f"{channel}:{raw_hash}".encode("utf-8"))
    storage = await store_kb_chunks(
        channel=channel,
        language=language,
        source_file=source_file,
        file_hash=file_hash,
        chunks=chunks,
        vectors=vectors,
        model=settings.model_embedding,
    )
    return {
        "stored": True,
        "reason": None,
        "chunk_count": len(chunks),
        "storage": storage,
        "file_hash": file_hash,
        "channel": channel,
        "language": language,
        "model": settings.model_embedding,
    }
