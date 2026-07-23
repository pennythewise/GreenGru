"""RAG query + user-upload ingest for Stage 1 pre-screeners."""

from __future__ import annotations

import asyncio
from typing import Literal

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app.services.rag.form_store import ingest_application_form
from app.services.rag.kb_upload import ingest_kb_pdfs_batch
from app.services.rag.retrieve import (
    SIMILARITY_THRESHOLD,
    format_chunks_for_prompt,
    retrieve_prescreener,
)
from app.services.rag.upload_store import ingest_upload_pdf, ingest_upload_pdfs_batch

router = APIRouter(prefix="/api/rag", tags=["rag"])

Channel = Literal["cbam", "loan", "grant"]
RagSource = Literal["uploads", "kb", "hybrid"]


class RagQueryRequest(BaseModel):
    channel: Channel = "cbam"
    query: str = Field(..., min_length=1)
    k: int = Field(default=3, ge=1, le=20)
    language: str | None = "en"
    upload_session_id: str | None = None
    source: RagSource = "hybrid"
    """When set (loan/grant), embed + store form before Stage 1 retrieve."""
    application_form: dict | None = None


class RagChunkOut(BaseModel):
    chunk_text: str
    heading_path: str
    source_file: str
    similarity: float
    chunk_index: int
    channel: str
    language: str
    corpus: str = "kb"
    matched_kb_file: str = ""
    matched_kb_heading: str = ""
    checklist_item: str = ""


class RagQueryResponse(BaseModel):
    channel: str
    query: str
    hit_count: int
    chunks: list[RagChunkOut]
    prompt_block: str
    source: str = "hybrid"
    confidence_score: float = 0.0
    threshold: float = SIMILARITY_THRESHOLD
    passes_threshold: bool = False
    ranked_pool_size: int = 0
    upload_chunks_scored: int = 0
    form_chunks_scored: int = 0
    kb_chunks_compared: int = 0
    matched_kb_files: list[str] = []
    form_ingest: dict | None = None


@router.post("/query", response_model=RagQueryResponse)
async def rag_query(payload: RagQueryRequest) -> RagQueryResponse:
    form_ingest: dict | None = None
    if (
        payload.application_form
        and payload.upload_session_id
        and payload.channel in ("loan", "grant")
    ):
        form_ingest = await ingest_application_form(
            route=payload.channel,  # type: ignore[arg-type]
            upload_session_id=payload.upload_session_id,
            application_form=payload.application_form,
            language=payload.language or "zh",
        )

    result = await asyncio.to_thread(
        retrieve_prescreener,
        channel=payload.channel,
        query=payload.query,
        k=payload.k,
        language=payload.language,
        upload_session_id=payload.upload_session_id,
        source=payload.source,
    )
    hits = result.chunks
    chunks = [
        RagChunkOut(
            chunk_text=h.chunk_text,
            heading_path=h.heading_path,
            source_file=h.source_file,
            similarity=h.similarity,
            chunk_index=h.chunk_index,
            channel=h.channel,
            language=h.language,
            corpus=h.corpus,
            matched_kb_file=h.matched_kb_file or "",
            matched_kb_heading=h.matched_kb_heading or "",
            checklist_item=getattr(h, "checklist_item", "") or "",
        )
        for h in hits
    ]
    return RagQueryResponse(
        channel=payload.channel,
        query=payload.query,
        hit_count=len(chunks),
        chunks=chunks,
        prompt_block=format_chunks_for_prompt(hits),
        source=payload.source,
        confidence_score=result.confidence_score,
        threshold=result.threshold,
        passes_threshold=result.passes_threshold,
        ranked_pool_size=result.ranked_pool_size,
        upload_chunks_scored=result.upload_chunks_scored,
        form_chunks_scored=result.form_chunks_scored,
        kb_chunks_compared=result.kb_chunks_compared,
        matched_kb_files=result.matched_kb_files,
        form_ingest=form_ingest,
    )


class RagIngestUploadResponse(BaseModel):
    stored: bool
    reason: str | None = None
    chunk_count: int = 0
    storage: str | None = None
    file_hash: str | None = None
    source_file: str | None = None
    convert_method: str | None = None
    channel: str | None = None
    upload_session_id: str | None = None
    checklist_item: str | None = None
    model: str | None = None
    cached: bool | None = None


@router.post("/ingest-upload", response_model=RagIngestUploadResponse)
async def rag_ingest_upload(
    file: UploadFile = File(...),
    channel: Channel = Form(...),
    upload_session_id: str = Form(...),
    checklist_item: str = Form(""),
    language: str = Form("en"),
) -> RagIngestUploadResponse:
    name = file.filename or "upload.pdf"
    if not name.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Stage 1 RAG ingest accepts PDF only (MinerU → markdown → embed).",
        )
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty upload")

    result = await ingest_upload_pdf(
        content=content,
        filename=name,
        channel=channel,
        upload_session_id=upload_session_id.strip(),
        checklist_item=checklist_item or "",
        language=language or "en",
    )
    return RagIngestUploadResponse(**result)


class RagBatchIngestResponse(BaseModel):
    results: list[RagIngestUploadResponse]
    embedded_chunks: int = 0
    file_count: int = 0
    channel: str | None = None
    upload_session_id: str | None = None


@router.post("/ingest-upload-batch", response_model=RagBatchIngestResponse)
async def rag_ingest_upload_batch(
    files: list[UploadFile] = File(...),
    channel: Channel = Form(...),
    upload_session_id: str = Form(...),
    checklist_items: str = Form("[]"),
    language: str = Form("en"),
) -> RagBatchIngestResponse:
    """Attach-then-process: convert each PDF, then one batched embed call."""
    import json

    try:
        labels = json.loads(checklist_items or "[]")
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="checklist_items must be JSON array") from exc
    if not isinstance(labels, list):
        raise HTTPException(status_code=400, detail="checklist_items must be a JSON array")
    if len(labels) != len(files):
        raise HTTPException(
            status_code=400,
            detail=f"checklist_items length ({len(labels)}) must match files ({len(files)})",
        )

    items: list[dict] = []
    for file, label in zip(files, labels, strict=True):
        name = file.filename or "upload.pdf"
        if not name.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail=f"Batch RAG ingest accepts PDF only: {name}",
            )
        content = await file.read()
        items.append(
            {
                "content": content,
                "filename": name,
                "checklist_item": str(label or ""),
            }
        )

    batch = await ingest_upload_pdfs_batch(
        items=items,
        channel=channel,
        upload_session_id=upload_session_id.strip(),
        language=language or "en",
    )
    return RagBatchIngestResponse(
        results=[RagIngestUploadResponse(**r) for r in batch.get("results") or []],
        embedded_chunks=int(batch.get("embedded_chunks") or 0),
        file_count=int(batch.get("file_count") or 0),
        channel=batch.get("channel"),
        upload_session_id=batch.get("upload_session_id"),
    )


class RagIngestFormRequest(BaseModel):
    route: Literal["loan", "grant"]
    upload_session_id: str
    application_form: dict
    language: str | None = "zh"


class RagIngestFormResponse(BaseModel):
    stored: bool
    reason: str | None = None
    chunk_count: int = 0
    storage: str | None = None
    file_hash: str | None = None
    source_file: str | None = None
    checklist_item: str | None = None
    channel: str | None = None
    upload_session_id: str | None = None
    model: str | None = None
    char_count: int = 0


@router.post("/ingest-form", response_model=RagIngestFormResponse)
async def rag_ingest_application_form(payload: RagIngestFormRequest) -> RagIngestFormResponse:
    """Qwen-embed loan/grant application form into the same session as Section A PDFs."""
    result = await ingest_application_form(
        route=payload.route,
        upload_session_id=payload.upload_session_id.strip(),
        application_form=payload.application_form,
        language=payload.language or "zh",
    )
    return RagIngestFormResponse(**result)


class RagIngestKbItem(BaseModel):
    stored: bool
    reason: str | None = None
    chunk_count: int = 0
    storage: str | None = None
    file_hash: str | None = None
    source_file: str | None = None
    convert_method: str | None = None
    channel: str | None = None
    model: str | None = None
    char_count: int = 0
    cached: bool = False


class RagIngestKbBatchResponse(BaseModel):
    results: list[RagIngestKbItem]
    embedded_chunks: int = 0
    file_count: int = 0
    stored_count: int = 0
    channel: str | None = None
    cache_hits: int = 0


@router.post("/ingest-kb", response_model=RagIngestKbBatchResponse)
async def rag_ingest_kb(
    files: list[UploadFile] = File(...),
    channel: Channel = Form(...),
    language: str = Form(""),
) -> RagIngestKbBatchResponse:
    """Stage 1: upload regulatory PDF(s) → PyMuPDF→pypdf → embed → kb_chunks."""
    if channel not in ("cbam", "loan", "grant"):
        raise HTTPException(status_code=400, detail="channel must be cbam|loan|grant")

    items: list[dict] = []
    for file in files:
        name = file.filename or "kb.pdf"
        if not name.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail=f"KB ingest accepts PDF only: {name}",
            )
        content = await file.read()
        items.append({"content": content, "filename": name})

    if not items:
        raise HTTPException(status_code=400, detail="No PDF files provided")

    batch = await ingest_kb_pdfs_batch(
        items=items,
        channel=channel,
        language=language or "",
    )
    results = [RagIngestKbItem(**r) for r in batch.get("results") or []]
    return RagIngestKbBatchResponse(
        results=results,
        embedded_chunks=int(batch.get("embedded_chunks") or 0),
        file_count=int(batch.get("file_count") or 0),
        stored_count=int(batch.get("stored_count") or 0),
        channel=batch.get("channel"),
        cache_hits=sum(1 for r in results if r.cached),
    )


class RagLookupHashesRequest(BaseModel):
    channel: Channel
    corpus: Literal["kb", "upload"] = "kb"
    hashes: list[str] = Field(default_factory=list)


class RagHashHit(BaseModel):
    content_hash: str
    file_hash: str = ""
    chunk_count: int = 0
    source_file: str = ""
    model: str = ""
    channel: str = ""
    corpus: str = ""
    checklist_item: str = ""


class RagLookupHashesResponse(BaseModel):
    hits: dict[str, RagHashHit]


@router.post("/lookup-hashes", response_model=RagLookupHashesResponse)
async def rag_lookup_hashes(payload: RagLookupHashesRequest) -> RagLookupHashesResponse:
    """Check which content SHA-256 hashes already exist in Supabase (no reprocess)."""
    from app.services.rag.hash_lookup import lookup_hashes

    raw = lookup_hashes(
        channel=payload.channel,
        corpus=payload.corpus,
        content_hashes=payload.hashes,
    )
    return RagLookupHashesResponse(
        hits={k: RagHashHit(**v) for k, v in raw.items()}
    )


class RagAdoptUploadItem(BaseModel):
    content_hash: str
    checklist_item: str = ""
    source_file: str = ""


class RagAdoptUploadsRequest(BaseModel):
    channel: Channel
    upload_session_id: str
    language: str = "en"
    items: list[RagAdoptUploadItem]


@router.post("/adopt-uploads", response_model=RagBatchIngestResponse)
async def rag_adopt_uploads(payload: RagAdoptUploadsRequest) -> RagBatchIngestResponse:
    """Clone existing upload_chunks into this session by content hash (no PDF bytes)."""
    from app.services.rag.upload_store import _clone_cached_upload_chunks

    session = payload.upload_session_id.strip()
    if not session:
        raise HTTPException(status_code=400, detail="upload_session_id required")

    results: list[RagIngestUploadResponse] = []
    embedded = 0
    for item in payload.items:
        h = (item.content_hash or "").strip().lower()
        if not h:
            results.append(
                RagIngestUploadResponse(
                    stored=False,
                    reason="missing_hash",
                    chunk_count=0,
                    checklist_item=item.checklist_item,
                    source_file=item.source_file or None,
                )
            )
            continue
        cached = await _clone_cached_upload_chunks(
            channel=payload.channel,
            upload_session_id=session,
            checklist_item=item.checklist_item or "",
            language=payload.language or "en",
            source_file=item.source_file or "upload.pdf",
            file_hash=h,
        )
        if not cached:
            results.append(
                RagIngestUploadResponse(
                    stored=False,
                    reason="hash_not_found",
                    chunk_count=0,
                    file_hash=h,
                    checklist_item=item.checklist_item,
                    source_file=item.source_file or None,
                    channel=payload.channel,
                    upload_session_id=session,
                    cached=False,
                )
            )
            continue
        results.append(RagIngestUploadResponse(**cached))
        embedded += int(cached.get("chunk_count") or 0)

    return RagBatchIngestResponse(
        results=results,
        embedded_chunks=embedded,
        file_count=len(results),
        channel=payload.channel,
        upload_session_id=session,
    )
