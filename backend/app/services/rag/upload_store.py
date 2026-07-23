"""Ingest user-uploaded PDFs into channel+session scoped upload_chunks."""

from __future__ import annotations

import asyncio
import json
import logging
import shutil
import tempfile
from pathlib import Path
from typing import Any, Literal

from app.config import get_settings
from app.services.pdf_embedding import EMBEDDING_DIM, embed_texts, file_content_hash
from app.services.rag.chunking import chunk_markdown
from app.services.rag.mineru_convert import convert_pdf_to_markdown
from app.services.supabase_store import _get_supabase_client

logger = logging.getLogger(__name__)
settings = get_settings()

Channel = Literal["cbam", "loan", "grant"]


def _display_pdf_name(filename: str) -> str:
    name = Path(filename or "upload.pdf").name.strip() or "upload.pdf"
    if not name.lower().endswith(".pdf"):
        name = f"{name}.pdf"
    return name


def _fs_pdf_name(file_hash: str) -> str:
    """ASCII-only on-disk name — Chinese/spaced names break Win32 temp cleanup."""
    return f"{(file_hash or 'upload')[:16]}.pdf"


async def _clone_cached_upload_chunks(
    *,
    channel: Channel,
    upload_session_id: str,
    checklist_item: str,
    language: str,
    source_file: str,
    file_hash: str,
) -> dict[str, Any] | None:
    """If ``file_hash`` already exists (any session), copy vectors into this session.

    Avoids MinerU/VL + embedding cost on re-upload of the same bytes.
    """
    client = _get_supabase_client()
    if client is not None:
        try:
            resp = (
                client.table("upload_chunks")
                .select(
                    "chunk_index,heading_path,chunk_text,embedding,model,"
                    "language,source_file,checklist_item"
                )
                .eq("file_hash", file_hash)
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
                        "chunk_index,heading_path,chunk_text,embedding,model,"
                        "language,source_file,checklist_item"
                    )
                    .eq("file_hash", file_hash)
                    .order("chunk_index")
                    .limit(500)
                    .execute()
                )
                rows = resp.data or []
            if not rows:
                return None

            existing = (
                client.table("upload_chunks")
                .select("id")
                .eq("upload_session_id", upload_session_id)
                .eq("file_hash", file_hash)
                .limit(1)
                .execute()
            )
            if existing.data:
                n = (
                    client.table("upload_chunks")
                    .select("id", count="exact")
                    .eq("upload_session_id", upload_session_id)
                    .eq("file_hash", file_hash)
                    .execute()
                )
                count = getattr(n, "count", None) or len(existing.data)
                return {
                    "stored": True,
                    "reason": "cache_hit_same_session",
                    "chunk_count": count,
                    "storage": "supabase",
                    "file_hash": file_hash,
                    "source_file": source_file or rows[0].get("source_file"),
                    "convert_method": "cache",
                    "channel": channel,
                    "upload_session_id": upload_session_id,
                    "checklist_item": checklist_item,
                    "model": rows[0].get("model") or settings.model_embedding,
                    "cached": True,
                }

            inserts = [
                {
                    "channel": channel,
                    "upload_session_id": upload_session_id,
                    "checklist_item": checklist_item
                    or (r.get("checklist_item") or ""),
                    "language": language or (r.get("language") or "en"),
                    "source_file": source_file or (r.get("source_file") or "upload.pdf"),
                    "file_hash": file_hash,
                    "heading_path": r.get("heading_path") or "",
                    "chunk_index": r["chunk_index"],
                    "chunk_text": r["chunk_text"],
                    "embedding": r["embedding"],
                    "model": r.get("model") or settings.model_embedding,
                }
                for r in rows
            ]
            (
                client.table("upload_chunks")
                .delete()
                .eq("upload_session_id", upload_session_id)
                .eq("file_hash", file_hash)
                .execute()
            )
            batch = 50
            for i in range(0, len(inserts), batch):
                client.table("upload_chunks").insert(inserts[i : i + batch]).execute()

            logger.info(
                "Upload RAG cache hit · channel=%s · hash=%s… · chunks=%s",
                channel,
                file_hash[:12],
                len(inserts),
            )
            return {
                "stored": True,
                "reason": "cache_hit",
                "chunk_count": len(inserts),
                "storage": "supabase",
                "file_hash": file_hash,
                "source_file": inserts[0]["source_file"],
                "convert_method": "cache",
                "channel": channel,
                "upload_session_id": upload_session_id,
                "checklist_item": checklist_item,
                "model": inserts[0]["model"],
                "cached": True,
            }
        except Exception as exc:  # noqa: BLE001
            logger.warning("Upload cache lookup failed: %s", exc)

    root = Path(settings.local_storage_dir) / "upload_embeddings"
    if root.is_dir():
        for path in root.rglob(f"{file_hash}.json"):
            try:
                payload = json.loads(path.read_text(encoding="utf-8"))
                chunks = payload.get("chunks") or []
                if not chunks:
                    continue
                out_dir = root / channel / upload_session_id
                out_dir.mkdir(parents=True, exist_ok=True)
                dest = out_dir / f"{file_hash}.json"
                dest.write_text(
                    json.dumps(
                        {
                            **payload,
                            "channel": channel,
                            "upload_session_id": upload_session_id,
                            "checklist_item": checklist_item
                            or payload.get("checklist_item")
                            or "",
                            "language": language or payload.get("language") or "en",
                            "source_file": source_file
                            or payload.get("source_file")
                            or "upload.pdf",
                            "file_hash": file_hash,
                        },
                        ensure_ascii=False,
                        indent=2,
                    ),
                    encoding="utf-8",
                )
                return {
                    "stored": True,
                    "reason": "cache_hit",
                    "chunk_count": len(chunks),
                    "storage": "local",
                    "file_hash": file_hash,
                    "source_file": source_file or payload.get("source_file"),
                    "convert_method": "cache",
                    "channel": channel,
                    "upload_session_id": upload_session_id,
                    "checklist_item": checklist_item,
                    "model": payload.get("model") or settings.model_embedding,
                    "cached": True,
                }
            except Exception as exc:  # noqa: BLE001
                logger.warning("Local upload cache read failed (%s): %s", path, exc)
    return None


async def store_upload_chunks(
    *,
    channel: Channel,
    upload_session_id: str,
    checklist_item: str,
    language: str,
    source_file: str,
    file_hash: str,
    chunks: list,
    vectors: list[list[float]],
    model: str,
) -> Literal["supabase", "local", "none"]:
    if len(chunks) != len(vectors):
        raise ValueError("chunks/vectors length mismatch")

    rows = [
        {
            "channel": channel,
            "upload_session_id": upload_session_id,
            "checklist_item": checklist_item,
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
            (
                client.table("upload_chunks")
                .delete()
                .eq("upload_session_id", upload_session_id)
                .eq("file_hash", file_hash)
                .execute()
            )
            batch = 50
            for i in range(0, len(rows), batch):
                client.table("upload_chunks").insert(rows[i : i + batch]).execute()
            return "supabase"
        except Exception as exc:  # noqa: BLE001
            logger.warning("Supabase upload_chunks insert failed, local fallback: %s", exc)

    out_dir = (
        Path(settings.local_storage_dir)
        / "upload_embeddings"
        / channel
        / upload_session_id
    )
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"{file_hash}.json"
    path.write_text(
        json.dumps(
            {
                "channel": channel,
                "upload_session_id": upload_session_id,
                "checklist_item": checklist_item,
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


def _convert_and_chunk_pdf(
    *,
    content: bytes,
    filename: str,
    channel: Channel,
    session: str,
    language: str,
) -> dict[str, Any]:
    """MinerU → markdown → chunks (no embedding). Blocking — call via to_thread.

    Section A path for cbam / loan / grant: MinerU, then PyMuPDF (pypdf last).
    """
    display_name = _display_pdf_name(filename)
    file_hash = file_content_hash(content)
    fs_name = _fs_pdf_name(file_hash)
    persist_dir = Path(settings.local_storage_dir) / "uploads" / channel / session
    persist_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = persist_dir / fs_name
    pdf_path.write_bytes(content)

    md_path = persist_dir / f"{Path(fs_name).stem}.md"
    work_dir = persist_dir / f"_mineru_work_{file_hash[:10]}"

    convert_meta: dict[str, Any] = {"method": None}
    # ignore_cleanup_errors: Windows often fails unlink on CJK/spaced names or
    # locked handles left by MinerU/PyMuPDF (WinError 267 NotADirectoryError).
    with tempfile.TemporaryDirectory(
        prefix="rag_upload_", ignore_cleanup_errors=True
    ) as tmp:
        tmp_pdf = Path(tmp) / fs_name
        shutil.copy2(pdf_path, tmp_pdf)
        convert_meta = convert_pdf_to_markdown(
            tmp_pdf,
            output_md_path=md_path,
            work_dir=work_dir,
            lang=language or "en",
            backend="pipeline",
            # Section A (cbam / loan / grant): MinerU → PyMuPDF → pypdf; no Qwen-VL.
            allow_vision=False,
        )

    markdown = md_path.read_text(encoding="utf-8") if md_path.is_file() else ""
    if not markdown.strip():
        return {
            "ok": False,
            "reason": "no_markdown",
            "file_hash": file_hash,
            "source_file": display_name,
            "convert_method": convert_meta.get("method"),
            "chunks": [],
        }

    chunks = chunk_markdown(markdown)
    if not chunks:
        return {
            "ok": False,
            "reason": "no_chunks",
            "file_hash": file_hash,
            "source_file": display_name,
            "convert_method": convert_meta.get("method"),
            "chunks": [],
        }

    return {
        "ok": True,
        "reason": None,
        "file_hash": file_hash,
        "source_file": display_name,
        "convert_method": convert_meta.get("method"),
        "chunks": chunks,
    }


async def ingest_upload_pdf(
    *,
    content: bytes,
    filename: str,
    channel: Channel,
    upload_session_id: str,
    checklist_item: str = "",
    language: str = "en",
) -> dict[str, Any]:
    """MinerU → PyMuPDF/pypdf → chunk → embed → upload_chunks (Section A)."""
    if not content:
        return {"stored": False, "reason": "empty_file", "chunk_count": 0}

    session = (upload_session_id or "").strip()
    if not session:
        return {"stored": False, "reason": "missing_session", "chunk_count": 0}

    safe_name = _display_pdf_name(filename)
    file_hash = file_content_hash(content)

    cached = await _clone_cached_upload_chunks(
        channel=channel,
        upload_session_id=session,
        checklist_item=checklist_item or "",
        language=language,
        source_file=safe_name,
        file_hash=file_hash,
    )
    if cached:
        return cached

    try:
        converted = await asyncio.to_thread(
            _convert_and_chunk_pdf,
            content=content,
            filename=safe_name,
            channel=channel,
            session=session,
            language=language,
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception(
            "Upload RAG convert failed · channel=%s · file=%s", channel, safe_name
        )
        return {
            "stored": False,
            "reason": f"convert_error: {exc}",
            "chunk_count": 0,
            "file_hash": file_hash,
            "source_file": safe_name,
            "checklist_item": checklist_item,
            "cached": False,
        }
    if not converted.get("ok"):
        return {
            "stored": False,
            "reason": converted.get("reason") or "convert_failed",
            "chunk_count": 0,
            "convert_method": converted.get("convert_method"),
            "file_hash": converted.get("file_hash"),
            "source_file": converted.get("source_file"),
            "checklist_item": checklist_item,
            "cached": False,
        }

    chunks = converted["chunks"]
    vectors = await asyncio.to_thread(embed_texts, [c.text for c in chunks])
    storage = await store_upload_chunks(
        channel=channel,
        upload_session_id=session,
        checklist_item=checklist_item or "",
        language=language,
        source_file=converted["source_file"],
        file_hash=converted["file_hash"],
        chunks=chunks,
        vectors=vectors,
        model=settings.model_embedding,
    )

    logger.info(
        "Upload RAG ingest · channel=%s · session=%s · file=%s · chunks=%s · "
        "storage=%s · method=%s",
        channel,
        session[:8],
        converted["source_file"],
        len(chunks),
        storage,
        converted.get("convert_method"),
    )
    return {
        "stored": True,
        "reason": None,
        "chunk_count": len(chunks),
        "storage": storage,
        "file_hash": converted["file_hash"],
        "source_file": converted["source_file"],
        "convert_method": converted.get("convert_method"),
        "channel": channel,
        "upload_session_id": session,
        "checklist_item": checklist_item,
        "model": settings.model_embedding,
        "cached": False,
    }


async def ingest_upload_pdfs_batch(
    *,
    items: list[dict[str, Any]],
    channel: Channel,
    upload_session_id: str,
    language: str = "en",
) -> dict[str, Any]:
    """Convert each PDF (sequential MinerU), then one batched embedding call.

    ``items``: ``[{content, filename, checklist_item}, ...]``
    """
    session = (upload_session_id or "").strip()
    if not session:
        return {"results": [], "embedded_chunks": 0, "reason": "missing_session"}

    results: list[dict[str, Any]] = []
    pending_store: list[dict[str, Any]] = []
    all_texts: list[str] = []

    for item in items:
        content: bytes = item.get("content") or b""
        filename = item.get("filename") or "upload.pdf"
        checklist_item = item.get("checklist_item") or ""
        if not content:
            results.append(
                {
                    "stored": False,
                    "reason": "empty_file",
                    "chunk_count": 0,
                    "checklist_item": checklist_item,
                    "source_file": filename,
                }
            )
            continue

        display_name = _display_pdf_name(filename)
        file_hash = file_content_hash(content)
        cached = await _clone_cached_upload_chunks(
            channel=channel,
            upload_session_id=session,
            checklist_item=checklist_item,
            language=language,
            source_file=display_name,
            file_hash=file_hash,
        )
        if cached:
            results.append(cached)
            continue

        try:
            converted = await asyncio.to_thread(
                _convert_and_chunk_pdf,
                content=content,
                filename=display_name,
                channel=channel,
                session=session,
                language=language,
            )
        except Exception as exc:  # noqa: BLE001 — per-file; do not 500 the batch
            logger.exception(
                "Upload RAG convert failed · channel=%s · file=%s",
                channel,
                display_name,
            )
            results.append(
                {
                    "stored": False,
                    "reason": f"convert_error: {exc}",
                    "chunk_count": 0,
                    "file_hash": file_hash,
                    "source_file": display_name,
                    "checklist_item": checklist_item,
                    "channel": channel,
                    "upload_session_id": session,
                    "cached": False,
                }
            )
            continue

        if not converted.get("ok"):
            results.append(
                {
                    "stored": False,
                    "reason": converted.get("reason") or "convert_failed",
                    "chunk_count": 0,
                    "convert_method": converted.get("convert_method"),
                    "file_hash": converted.get("file_hash"),
                    "source_file": converted.get("source_file"),
                    "checklist_item": checklist_item,
                    "channel": channel,
                    "upload_session_id": session,
                    "cached": False,
                }
            )
            continue

        chunks = converted["chunks"]
        text_offset = len(all_texts)
        all_texts.extend(c.text for c in chunks)
        pending_store.append(
            {
                "checklist_item": checklist_item,
                "source_file": converted["source_file"],
                "file_hash": converted["file_hash"],
                "convert_method": converted.get("convert_method"),
                "chunks": chunks,
                "text_offset": text_offset,
                "text_count": len(chunks),
            }
        )

    vectors: list[list[float]] = []
    if all_texts:
        logger.info(
            "Batch embed · channel=%s · files=%s · chunks=%s",
            channel,
            len(pending_store),
            len(all_texts),
        )
        vectors = await asyncio.to_thread(embed_texts, all_texts)

    for pending in pending_store:
        start = pending["text_offset"]
        end = start + pending["text_count"]
        file_vecs = vectors[start:end]
        storage = await store_upload_chunks(
            channel=channel,
            upload_session_id=session,
            checklist_item=pending["checklist_item"],
            language=language,
            source_file=pending["source_file"],
            file_hash=pending["file_hash"],
            chunks=pending["chunks"],
            vectors=file_vecs,
            model=settings.model_embedding,
        )
        results.append(
            {
                "stored": True,
                "reason": None,
                "chunk_count": len(pending["chunks"]),
                "storage": storage,
                "file_hash": pending["file_hash"],
                "source_file": pending["source_file"],
                "convert_method": pending["convert_method"],
                "channel": channel,
                "upload_session_id": session,
                "checklist_item": pending["checklist_item"],
                "model": settings.model_embedding,
                "cached": False,
            }
        )
        logger.info(
            "Upload RAG batch item · file=%s · chunks=%s · method=%s · storage=%s",
            pending["source_file"],
            len(pending["chunks"]),
            pending["convert_method"],
            storage,
        )

    return {
        "results": results,
        "embedded_chunks": len(all_texts),
        "file_count": len(results),
        "channel": channel,
        "upload_session_id": session,
    }
