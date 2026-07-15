from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.schemas import IntakeRecordOut, ManualIntakeRequest, OcrPreviewOut, SourceCitation
from app.services.intake_agent import (
    IntakeExtraction,
    extract_from_document,
    merge_multi_document_extractions,
    parse_csv_intake,
)
from app.services.ocr_preview import run_ocr_preview
from app.services.pipeline import run_intake

router = APIRouter(prefix="/api", tags=["intake"])


@router.post("/intake/ocr-preview", response_model=OcrPreviewOut)
async def ocr_preview(file: UploadFile):
    """Stage-1 preview for New Submission: chineseocr on images, PDF text
    extraction + text-embedding-v4 vectors to Supabase, mock fill for gaps."""
    if not file.filename:
        raise HTTPException(status_code=422, detail="Filename is required.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=422, detail="Empty file upload.")

    return await run_ocr_preview(content=content, filename=file.filename)


@router.post("/intake", response_model=IntakeRecordOut)
async def intake(
    submission_id: str = Form(...),
    historical_scale_tonnes: float | None = Form(None),
    production_volume_tonnes: float | None = Form(None),
    fuel_type: str | None = Form(None),
    cn_code_hint: str | None = Form(None),
    billing_period: str | None = Form(None),
    measured_intensity_tco2e_per_tonne: float | None = Form(None),
    files: list[UploadFile] | None = None,
    session: AsyncSession = Depends(get_session),
):
    """Upload document(s) or manual form data -> intake_record (PRD §7).
    CSV/XLSX uploads never reach the vision model (PRD §8.1 rule); anything
    else is treated as a document for the vision/text extraction path.
    """
    extractions: list[IntakeExtraction] = []

    if files:
        for f in files:
            content = await f.read()
            if (f.filename or "").lower().endswith((".csv",)):
                extractions.append(parse_csv_intake(content))
            else:
                try:
                    text = content.decode("utf-8")
                except UnicodeDecodeError:
                    text = f"<binary content, {len(content)} bytes, filename={f.filename}>"
                extractions.append(extract_from_document(text, source_label=f.filename or "upload"))

    if production_volume_tonnes is not None:
        extractions.append(
            IntakeExtraction(
                production_volume_tonnes=production_volume_tonnes,
                fuel_type=fuel_type,
                cn_code_hint=cn_code_hint,
                billing_period=billing_period,
                confidence="high",
                flags=[],
            )
        )

    if not extractions:
        raise HTTPException(status_code=422, detail="Provide either file upload(s) or manual intake fields.")

    merged = merge_multi_document_extractions(extractions)
    if measured_intensity_tco2e_per_tonne is not None:
        merged.__dict__["measured_intensity_tco2e_per_tonne"] = measured_intensity_tco2e_per_tonne

    try:
        record = await run_intake(session, submission_id, merged, historical_scale_tonnes=historical_scale_tonnes)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    extracted = dict(record.extracted_json)
    if measured_intensity_tco2e_per_tonne is not None:
        extracted["measured_intensity_tco2e_per_tonne"] = measured_intensity_tco2e_per_tonne

    return IntakeRecordOut(
        id=record.id,
        submission_id=record.submission_id,
        extracted_json=extracted,
        validator_status=record.validator_status,
        validator_notes=record.validator_notes or [],
        sources=[
            SourceCitation(
                constant="intake validator rules",
                value="10x historical scale / kg-tonne heuristic",
                citation="PRD §8.2",
            )
        ],
    )


@router.post("/intake/validate", response_model=IntakeRecordOut)
async def revalidate_intake(payload: ManualIntakeRequest, session: AsyncSession = Depends(get_session)):
    """Re-run the intake validator against manually-supplied fields for an
    existing submission (PRD §7's `/api/intake/validate`)."""
    extraction = IntakeExtraction(
        production_volume_tonnes=payload.production_volume_tonnes,
        fuel_type=payload.fuel_type,
        cn_code_hint=payload.cn_code_hint,
        billing_period=payload.billing_period,
        confidence="high",
        flags=[],
    )
    try:
        record = await run_intake(session, payload.submission_id, extraction)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return IntakeRecordOut(
        id=record.id,
        submission_id=record.submission_id,
        extracted_json=record.extracted_json,
        validator_status=record.validator_status,
        validator_notes=record.validator_notes or [],
        sources=[SourceCitation(constant="intake validator rules", value="re-validation pass", citation="PRD §8.2")],
    )
