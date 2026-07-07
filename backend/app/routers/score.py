from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.schemas import ScoreOut, ScoreRequest, SourceCitation
from app.services.pipeline import run_score

router = APIRouter(prefix="/api", tags=["score"])


@router.post("/score", response_model=ScoreOut)
async def score(payload: ScoreRequest, session: AsyncSession = Depends(get_session)):
    try:
        result = await run_score(session, payload.calculation_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return ScoreOut(
        id=result.id,
        calculation_id=result.calculation_id,
        cisa_grade=result.cisa_grade,
        cisa_grade_is_provisional=result.cisa_grade_is_provisional,
        cbam_risk_tier=result.cbam_risk_tier,
        gap_to_next_tier_tco2e=result.gap_to_next_tier_tco2e,
        de_minimis_possible=result.de_minimis_possible,
        sources=[
            SourceCitation(constant="CISA tier boundaries", value="provisional — IEA/EU-benchmark anchors", citation="primary-sources/INVENTORY.md item 10"),
            SourceCitation(constant="de minimis threshold", value="50 tonnes", citation="Regulation (EU) 2023/956 — assessed per EU importer, not per exporter"),
        ],
    )
