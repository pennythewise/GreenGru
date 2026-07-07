from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models_orm import Document
from app.schemas import DocumentOut, DocumentRequest
from app.services.pipeline import run_financing_document, run_passport_document

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("/passport", response_model=DocumentOut)
async def passport(payload: DocumentRequest, session: AsyncSession = Depends(get_session)):
    try:
        doc = await run_passport_document(session, payload.score_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return DocumentOut(
        id=doc.id,
        submission_id=doc.submission_id,
        doc_type=doc.doc_type,
        language=doc.language,
        content_hash=doc.content_hash,
        signature=doc.signature,
        pdf_storage_path=doc.pdf_storage_path,
        used_pdf_fallback_html=doc.pdf_storage_path.endswith(".fallback.html"),
    )


@router.get("/{document_id}/download")
async def download_document(document_id: str, session: AsyncSession = Depends(get_session)):
    doc = await session.get(Document, document_id)
    if doc is None:
        raise HTTPException(status_code=404, detail=f"document {document_id} not found")
    media_type = "text/html" if doc.pdf_storage_path.endswith(".fallback.html") else "application/pdf"
    filename = f"{doc.doc_type}{'.html' if media_type == 'text/html' else '.pdf'}"
    return FileResponse(doc.pdf_storage_path, media_type=media_type, filename=filename)


@router.post("/financing", response_model=DocumentOut)
async def financing(payload: DocumentRequest, session: AsyncSession = Depends(get_session)):
    try:
        doc = await run_financing_document(session, payload.score_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return DocumentOut(
        id=doc.id,
        submission_id=doc.submission_id,
        doc_type=doc.doc_type,
        language=doc.language,
        content_hash=doc.content_hash,
        signature=doc.signature,
        pdf_storage_path=doc.pdf_storage_path,
        used_pdf_fallback_html=doc.pdf_storage_path.endswith(".fallback.html"),
    )
