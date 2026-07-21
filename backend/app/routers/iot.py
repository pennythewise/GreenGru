"""Optional IoT ingestion module (PRD §12) — decoupled, feeds only the
financing report's electricity-intensity score, never the CBAM passport
number. If this endpoint fails, nothing else in the system notices."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models_orm import IotReading
from app.schemas import IotReadingIngest, IotReadingOut

router = APIRouter(prefix="/api", tags=["iot"])

# In-memory last power_w per reading id (ORM has no power column yet).
_POWER_BY_ID: dict[str, float] = {}


def _power_w(voltage: float | None, current: float | None, power_w: float | None) -> float | None:
    if power_w is not None:
        return power_w
    if voltage is not None and current is not None:
        return round(voltage * current, 6)
    return None


def _to_out(row: IotReading, power_w: float | None = None) -> IotReadingOut:
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


@router.post("/iot/ingest", status_code=201)
async def ingest_iot_reading(payload: IotReadingIngest, session: AsyncSession = Depends(get_session)):
    # Edge case §8.11 #9: negative/zero kWh readings dropped at ingest;
    # MQTT redelivery deduplicated on (company_id, timestamp) via the
    # unique constraint in the schema.
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
        # Duplicate (company_id, reading_timestamp) — MQTT redelivery,
        # silently deduplicated per the edge case register, not an error.
        return {"status": "duplicate_ignored"}

    pw = _power_w(payload.voltage, payload.current, payload.power_w)
    if pw is not None:
        _POWER_BY_ID[reading.id] = pw

    return {
        "status": "ingested",
        "id": reading.id,
        "reading": _to_out(reading, pw),
    }


@router.get("/iot/latest", response_model=IotReadingOut | None)
async def latest_iot_reading(
    company_id: str = Query(default="demo-hengfeng"),
    session: AsyncSession = Depends(get_session),
):
    """Latest ESP32 reading for the New submission sensor panel."""
    result = await session.execute(
        select(IotReading)
        .where(IotReading.company_id == company_id)
        .order_by(IotReading.ingested_at.desc())
        .limit(1)
    )
    row = result.scalar_one_or_none()
    if row is None:
        # Fallback: any latest reading (demo company id mismatch)
        result = await session.execute(
            select(IotReading).order_by(IotReading.ingested_at.desc()).limit(1)
        )
        row = result.scalar_one_or_none()
    if row is None:
        return None
    return _to_out(row)
