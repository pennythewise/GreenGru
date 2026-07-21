"""Optional IoT ingestion + window snapshots (PRD §12).

Feeds financing electricity evidence only — never the CBAM passport tariff.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models_orm import IotReading, IotWindowSnapshot
from app.schemas import (
    IotReadingIngest,
    IotReadingOut,
    IotSnapshotCreate,
    IotSnapshotOut,
)

router = APIRouter(prefix="/api", tags=["iot"])

# CISA Appendix B.3 national default grid EF (tCO₂e/MWh)
_EF_NO_GREEN_TRADING = 0.5568
_EF_WITH_GREEN_TRADING = 0.5942

_POWER_BY_ID: dict[str, float] = {}


def _power_w(voltage: float | None, current: float | None, power_w: float | None) -> float | None:
    if power_w is not None:
        return power_w
    if voltage is not None and current is not None:
        return round(voltage * current, 6)
    return None


def _to_reading_out(row: IotReading, power_w: float | None = None) -> IotReadingOut:
    pw = power_w if power_w is not None else _POWER_BY_ID.get(row.id)
    if pw is None:
        pw = _power_w(row.voltage, row.current, None)
    return IotReadingOut(
        id=row.id,
        company_id=row.company_id,
        reading_timestamp=row.reading_timestamp.isoformat(),
        voltage=row.voltage,
        current=row.current,
        power_w=pw,
        kwh=row.kwh,
        ingested_at=row.ingested_at.isoformat() if row.ingested_at else "",
    )


def _ef_for(green_trading: str) -> float:
    return _EF_WITH_GREEN_TRADING if green_trading == "yes" else _EF_NO_GREEN_TRADING


def _tco2e_from_kwh(kwh: float, ef: float) -> float:
    return round((kwh / 1000.0) * ef, 10)


def _to_snapshot_out(row: IotWindowSnapshot) -> IotSnapshotOut:
    return IotSnapshotOut(
        id=row.id,
        company_id=row.company_id,
        window_minutes=row.window_minutes,
        green_trading=row.green_trading,
        emission_factor_t_per_mwh=row.emission_factor_t_per_mwh,
        window_start=row.window_start.isoformat(),
        window_end=row.window_end.isoformat(),
        sample_count=row.sample_count,
        kwh_start=row.kwh_start,
        kwh_end=row.kwh_end,
        delta_kwh=row.delta_kwh,
        avg_power_w=row.avg_power_w,
        tco2e=row.tco2e,
        submission_id=row.submission_id,
        created_at=row.created_at.isoformat() if row.created_at else "",
        note_en=(
            "Financing / electricity-intensity evidence only — not used in CBAM tariff. "
            "tCO₂e = ΔkWh/1000 × CISA App. B.3 grid EF."
        ),
        note_zh=(
            "仅用于融资/电力强度证据 — 不进入 CBAM 关税。"
            "tCO₂e = ΔkWh/1000 × CISA 附录 B.3 电网排放系数。"
        ),
    )


@router.post("/iot/ingest", status_code=201)
async def ingest_iot_reading(payload: IotReadingIngest, session: AsyncSession = Depends(get_session)):
    if payload.kwh <= 0:
        raise HTTPException(status_code=422, detail="kwh must be > 0 — anomalous reading dropped, not stored")

    reading = IotReading(
        company_id=payload.company_id,
        reading_timestamp=datetime.fromisoformat(payload.reading_timestamp),
        voltage=payload.voltage,
        current=payload.current,
        kwh=payload.kwh,
    )
    session.add(reading)
    try:
        await session.commit()
        await session.refresh(reading)
    except IntegrityError:
        await session.rollback()
        return {"status": "duplicate_ignored"}

    pw = _power_w(payload.voltage, payload.current, payload.power_w)
    if pw is not None:
        _POWER_BY_ID[reading.id] = pw

    return {
        "status": "ingested",
        "id": reading.id,
        "reading": _to_reading_out(reading, pw),
    }


@router.get("/iot/latest", response_model=IotReadingOut | None)
async def latest_iot_reading(
    company_id: str = Query(default="demo-hengfeng"),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(IotReading)
        .where(IotReading.company_id == company_id)
        .order_by(IotReading.ingested_at.desc())
        .limit(1)
    )
    row = result.scalar_one_or_none()
    if row is None:
        result = await session.execute(
            select(IotReading).order_by(IotReading.ingested_at.desc()).limit(1)
        )
        row = result.scalar_one_or_none()
    if row is None:
        return None
    return _to_reading_out(row)


@router.get("/iot/history", response_model=list[IotReadingOut])
async def iot_reading_history(
    company_id: str = Query(default="demo-hengfeng"),
    limit: int = Query(default=48, ge=1, le=500),
    window_minutes: int | None = Query(default=None, description="If set, only samples in the last N minutes"),
    session: AsyncSession = Depends(get_session),
):
    q = select(IotReading).where(IotReading.company_id == company_id)
    if window_minutes in (10, 30, 60):
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=window_minutes)
        q = q.where(IotReading.ingested_at >= cutoff)
    q = q.order_by(IotReading.ingested_at.desc()).limit(limit)
    result = await session.execute(q)
    rows = list(result.scalars().all())
    if not rows and window_minutes is None:
        result = await session.execute(
            select(IotReading).order_by(IotReading.ingested_at.desc()).limit(limit)
        )
        rows = list(result.scalars().all())
    rows.reverse()
    return [_to_reading_out(r) for r in rows]


@router.post("/iot/snapshot", response_model=IotSnapshotOut, status_code=201)
async def create_iot_snapshot(payload: IotSnapshotCreate, session: AsyncSession = Depends(get_session)):
    """Freeze last 10 / 30 / 60 minutes of ESP32 readings for pipeline attach."""
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(minutes=payload.window_minutes)
    result = await session.execute(
        select(IotReading)
        .where(
            IotReading.company_id == payload.company_id,
            IotReading.ingested_at >= window_start,
        )
        .order_by(IotReading.ingested_at.asc())
    )
    rows = list(result.scalars().all())
    if not rows:
        # Fallback: any company if demo id mismatch
        result = await session.execute(
            select(IotReading)
            .where(IotReading.ingested_at >= window_start)
            .order_by(IotReading.ingested_at.asc())
        )
        rows = list(result.scalars().all())
    if len(rows) < 1:
        raise HTTPException(
            status_code=422,
            detail=(
                f"No ESP32 readings in the last {payload.window_minutes} minutes. "
                "Keep the meter posting, then save again."
            ),
        )

    kwh_start = float(rows[0].kwh)
    kwh_end = float(rows[-1].kwh)
    delta = max(0.0, kwh_end - kwh_start)
    # If cumulative meter barely moved, still attribute end-of-window energy intensity
    # using delta; if delta==0 use a tiny epsilon from last reading for demo visibility
    if delta <= 0 and kwh_end > 0:
        # Use span of samples as energy proxy when EEPROM cumulative is flat
        powers = []
        for r in rows:
            pw = _POWER_BY_ID.get(r.id) or _power_w(r.voltage, r.current, None)
            if pw is not None:
                powers.append(pw)
        avg_p = sum(powers) / len(powers) if powers else 0.0
        # Wh over window ≈ avg_W * minutes / 60 → kWh
        delta = round((avg_p * payload.window_minutes) / 60000.0, 8)
    else:
        powers = []
        for r in rows:
            pw = _POWER_BY_ID.get(r.id) or _power_w(r.voltage, r.current, None)
            if pw is not None:
                powers.append(pw)
        avg_p = sum(powers) / len(powers) if powers else None

    ef = _ef_for(payload.green_trading)
    tco2e = _tco2e_from_kwh(delta if delta > 0 else kwh_end, ef)

    snap = IotWindowSnapshot(
        company_id=payload.company_id,
        window_minutes=payload.window_minutes,
        green_trading=payload.green_trading,
        emission_factor_t_per_mwh=ef,
        window_start=rows[0].ingested_at,
        window_end=rows[-1].ingested_at,
        sample_count=len(rows),
        kwh_start=kwh_start,
        kwh_end=kwh_end,
        delta_kwh=delta,
        avg_power_w=round(avg_p, 6) if avg_p is not None else None,
        tco2e=tco2e,
    )
    session.add(snap)
    await session.commit()
    await session.refresh(snap)
    return _to_snapshot_out(snap)


@router.get("/iot/snapshot/{snapshot_id}", response_model=IotSnapshotOut)
async def get_iot_snapshot(snapshot_id: str, session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(IotWindowSnapshot).where(IotWindowSnapshot.id == snapshot_id)
    )
    row = result.scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="IoT snapshot not found")
    return _to_snapshot_out(row)


@router.get("/iot/snapshots", response_model=list[IotSnapshotOut])
async def list_iot_snapshots(
    company_id: str = Query(default="demo-hengfeng"),
    limit: int = Query(default=10, ge=1, le=50),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(IotWindowSnapshot)
        .where(IotWindowSnapshot.company_id == company_id)
        .order_by(IotWindowSnapshot.created_at.desc())
        .limit(limit)
    )
    return [_to_snapshot_out(r) for r in result.scalars().all()]
