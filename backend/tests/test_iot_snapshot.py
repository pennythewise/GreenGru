"""IoT window snapshot API — financing evidence only."""

from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from app.db import async_session_factory, init_db
from app.main import app
from app.models_orm import IotReading


def _seed_readings(n: int = 5) -> None:
    import asyncio

    async def _run() -> None:
        await init_db()
        async with async_session_factory() as session:
            now = datetime.now(timezone.utc)
            for i in range(n):
                session.add(
                    IotReading(
                        company_id="demo-hengfeng",
                        reading_timestamp=now - timedelta(minutes=n - i),
                        voltage=40.0 + i,
                        current=0.1,
                        kwh=0.01 + i * 0.001,
                        ingested_at=now - timedelta(minutes=n - i),
                    )
                )
            await session.commit()

    asyncio.get_event_loop().run_until_complete(_run())


def test_create_iot_snapshot_and_attach_pipeline():
    _seed_readings(6)
    with TestClient(app) as client:
        snap = client.post(
            "/api/iot/snapshot",
            json={
                "company_id": "demo-hengfeng",
                "window_minutes": 30,
                "green_trading": "no",
            },
        )
        assert snap.status_code == 201, snap.text
        body = snap.json()
        assert body["window_minutes"] == 30
        assert body["sample_count"] >= 1
        assert body["emission_factor_t_per_mwh"] == 0.5568
        assert "id" in body

        hist = client.get("/api/iot/history?window_minutes=30&limit=20")
        assert hist.status_code == 200
        assert len(hist.json()) >= 1

        got = client.get(f"/api/iot/snapshot/{body['id']}")
        assert got.status_code == 200
        assert got.json()["id"] == body["id"]
