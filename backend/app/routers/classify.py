from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.schemas import ClassifyRequest, ClassifyResponse, SourceCitation
from app.services.pipeline import run_classify

router = APIRouter(prefix="/api", tags=["classify"])


@router.post("/classify", response_model=ClassifyResponse)
async def classify(payload: ClassifyRequest, session: AsyncSession = Depends(get_session)):
    try:
        result = await run_classify(session, payload.submission_id, payload.product_description)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return ClassifyResponse(
        cn_code=result.cn_code,
        confidence=result.confidence,
        model_used=result.model_used,
        escalated=result.escalated,
        requires_manual_confirmation=result.requires_manual_confirmation,
        reason=result.reason,
        sources=[SourceCitation(constant="8 supported CN codes", value="PRD §6.1 table", citation="PRD §6.1")],
    )
