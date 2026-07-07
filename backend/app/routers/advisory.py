from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.schemas import AdvisoryOut, AdvisoryRequest, RankedAction
from app.services.pipeline import run_advisory

router = APIRouter(prefix="/api", tags=["advisory"])


@router.post("/advisory", response_model=AdvisoryOut)
async def advisory(payload: AdvisoryRequest, session: AsyncSession = Depends(get_session)):
    try:
        plan = await run_advisory(session, payload.score_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    payload_json = plan.ranked_actions_json
    return AdvisoryOut(
        id=plan.id,
        score_id=plan.score_id,
        ranked_actions=[RankedAction(**a) for a in payload_json["actions"]],
        plan_text=payload_json["plan_text"],
    )
