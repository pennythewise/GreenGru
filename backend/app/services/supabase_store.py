"""Persist document embedding vectors to Supabase (pgvector) with a local
JSON fallback for zero-config dev."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Literal

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

StorageBackend = Literal["supabase", "local", "none"]

_client: Any | None = None


def _get_supabase_client() -> Any | None:
    global _client
    if _client is not None:
        return _client
    if not settings.supabase_url or not settings.supabase_service_role_key:
        return None
    try:
        from supabase import create_client

        _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
        return _client
    except Exception as exc:  # noqa: BLE001
        logger.warning("Supabase client init failed: %s", exc)
        return None


async def store_document_embeddings(
    *,
    file_name: str,
    file_hash: str,
    chunks: list[str],
    vectors: list[list[float]],
    model: str,
) -> StorageBackend:
    rows = [
        {
            "file_name": file_name,
            "file_hash": file_hash,
            "chunk_index": i,
            "chunk_text": chunk,
            "embedding": vector,
            "model": model,
        }
        for i, (chunk, vector) in enumerate(zip(chunks, vectors, strict=True))
    ]

    client = _get_supabase_client()
    if client is not None:
        try:
            client.table("document_embeddings").delete().eq("file_hash", file_hash).execute()
            client.table("document_embeddings").insert(rows).execute()
            return "supabase"
        except Exception as exc:  # noqa: BLE001
            logger.warning("Supabase embedding insert failed, using local fallback: %s", exc)

    out_dir = Path(settings.local_storage_dir) / "embeddings"
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"{file_hash}.json"
    path.write_text(
        json.dumps(
            {
                "file_name": file_name,
                "file_hash": file_hash,
                "model": model,
                "chunks": [
                    {"chunk_index": r["chunk_index"], "chunk_text": r["chunk_text"], "embedding": r["embedding"]}
                    for r in rows
                ],
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    return "local"
