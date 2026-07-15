"""PDF text extraction and Qwen text-embedding-v4 vectorisation."""

from __future__ import annotations

import hashlib
import io
import json
import logging
from pathlib import Path
from typing import Any

from openai import OpenAI
from pypdf import PdfReader

from app.config import get_settings
from app.services.llm_client import get_client, is_mock_mode
from app.services.supabase_store import store_document_embeddings

logger = logging.getLogger(__name__)
settings = get_settings()

EMBEDDING_DIM = 1024
CHUNK_SIZE = 800
CHUNK_OVERLAP = 120


def extract_pdf_text(content: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(content))
        parts: list[str] = []
        for page in reader.pages:
            text = page.extract_text() or ""
            if text.strip():
                parts.append(text.strip())
        return "\n\n".join(parts)
    except Exception as exc:  # noqa: BLE001 — scanned/broken PDFs fall back to mock OCR
        logger.warning("PDF text extraction failed: %s", exc)
        return ""


def chunk_text(text: str, *, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    text = text.strip()
    if not text:
        return []
    if len(text) <= chunk_size:
        return [text]

    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(len(text), start + chunk_size)
        chunks.append(text[start:end])
        if end >= len(text):
            break
        start = max(0, end - overlap)
    return chunks


def _mock_embedding(seed: str) -> list[float]:
    digest = hashlib.sha256(seed.encode("utf-8")).digest()
    vec = []
    for i in range(EMBEDDING_DIM):
        vec.append((digest[i % len(digest)] / 255.0) * 2 - 1)
    return vec


def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []

    if is_mock_mode():
        return [_mock_embedding(t) for t in texts]

    client: OpenAI = get_client()
    response = client.embeddings.create(
        model=settings.model_embedding,
        input=texts,
        dimensions=EMBEDDING_DIM,
    )
    return [list(item.embedding) for item in response.data]


def file_content_hash(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


async def embed_pdf_and_store(
    *,
    content: bytes,
    filename: str,
) -> dict[str, Any]:
    """Extract PDF text, embed chunks, persist to Supabase (or local fallback)."""
    text = extract_pdf_text(content)
    chunks = chunk_text(text)
    if not chunks:
        return {
            "embedded": False,
            "reason": "no_extractable_text",
            "chunk_count": 0,
            "storage": "none",
        }

    vectors = embed_texts(chunks)
    file_hash = file_content_hash(content)
    storage = await store_document_embeddings(
        file_name=filename,
        file_hash=file_hash,
        chunks=chunks,
        vectors=vectors,
        model=settings.model_embedding,
    )

    return {
        "embedded": True,
        "reason": None,
        "chunk_count": len(chunks),
        "storage": storage,
        "file_hash": file_hash,
        "text_preview": text[:500],
    }


def save_local_embedding_manifest(payload: dict[str, Any], file_hash: str) -> None:
    """Dev fallback when Supabase is not configured."""
    out_dir = Path(settings.local_storage_dir) / "embeddings"
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"{file_hash}.json"
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
