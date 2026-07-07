"""Baowu/Ansteel aggregate dashboard (PRD §3, §10 — stretch feature).
Application-level enforcement of the same read-only aggregate scope that's
enforced at the database role level in supabase/migrations/0001_init.sql —
this endpoint must never touch intake_records.extracted_json or any raw
uploaded file."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models_orm import Calculation, Score
from app.schemas import BaowuDashboardRow

router = APIRouter(prefix="/api", tags=["baowu"])


@router.get("/baowu/dashboard", response_model=list[BaowuDashboardRow])
async def baowu_dashboard(session: AsyncSession = Depends(get_session)):
    stmt = select(Score.cisa_grade, Score.cbam_risk_tier, Calculation.annual_exposure_eur).join(
        Calculation, Score.calculation_id == Calculation.id
    )
    rows = (await session.execute(stmt)).all()
    return [
        BaowuDashboardRow(cisa_grade=r.cisa_grade, cbam_risk_tier=r.cbam_risk_tier, annual_exposure_eur=r.annual_exposure_eur)
        for r in rows
    ]
