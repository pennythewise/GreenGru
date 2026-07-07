"""Optional IoT ingestion module (PRD §12) — decoupled, feeds only the
financing report's electricity-intensity score, never the CBAM passport
number. If this endpoint fails, nothing else in the system notices."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models_orm import IotReading
from app.schemas import IotReadingIngest

router = APIRouter(prefix="/api", tags=["iot"])


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
    except IntegrityError:
        await session.rollback()
        # Duplicate (company_id, reading_timestamp) — MQTT redelivery,
        # silently deduplicated per the edge case register, not an error.
        return {"status": "duplicate_ignored"}

    return {"status": "ingested", "id": reading.id}
