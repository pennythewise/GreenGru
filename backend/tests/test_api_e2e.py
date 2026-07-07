"""Full pipeline end-to-end, through the HTTP API, in mock LLM mode —
proves the whole thing (DB, calc engine, scoring, document generation)
runs with zero external configuration, per the project's runnability goal."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    # TestClient must be entered as a context manager to trigger the app's
    # lifespan (startup runs init_db(), which creates the tables) — without
    # this, every request hits a database with no tables at all.
    with TestClient(app) as c:
        yield c


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["llm_mock_mode"] is True


def test_full_pipeline_end_to_end(client):
    company_resp = client.post("/api/companies", json={"name": "Haiyan Test Fastener Co.", "province": "Zhejiang"})
    assert company_resp.status_code == 200
    company_id = company_resp.json()["id"]

    product_resp = client.post(
        "/api/products",
        json={
            "company_id": company_id,
            "cn_code": "7318 15 88",
            "production_route": "BF-BOF",
            "annual_export_tonnes": 5000,
        },
    )
    assert product_resp.status_code == 200
    product_id = product_resp.json()["id"]

    submission_resp = client.post("/api/submissions", json={"product_id": product_id, "source_type": "manual"})
    assert submission_resp.status_code == 200
    submission_id = submission_resp.json()["id"]
    assert submission_resp.json()["status"] == "intake_pending"

    intake_resp = client.post(
        "/api/intake",
        data={
            "submission_id": submission_id,
            "production_volume_tonnes": "5000",
            "fuel_type": "coking coal",
            "billing_period": "2026-01 to 2026-12",
        },
    )
    assert intake_resp.status_code == 200
    assert intake_resp.json()["validator_status"] in ("passed", "flagged")

    process_resp = client.post(
        f"/api/submissions/{submission_id}/process",
        json={"product_description": "Hex head screw, M8x40, zinc plated", "year": 2026},
    )
    assert process_resp.status_code == 200
    state = process_resp.json()

    assert state["calculation"] is not None
    assert state["calculation"]["phase_in_factor"] == 0.025
    assert state["calculation"]["tariff_cost_eur_per_tonne"] < state["calculation"]["gross_tariff_cost_eur_per_tonne"]

    assert state["score"] is not None
    assert state["score"]["cisa_grade"] in ("A", "B", "C", "D", "E")
    assert state["score"]["cisa_grade_is_provisional"] is True

    assert len(state["documents"]) == 2
    doc_types = {d["doc_type"] for d in state["documents"]}
    assert doc_types == {"passport", "financing_report"}

    assert state["advisory"] is not None
    assert len(state["advisory"]["ranked_actions"]) >= 1

    # Full-state GET returns the same picture independently of /process
    get_resp = client.get(f"/api/submissions/{submission_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["score"]["id"] == state["score"]["id"]

    # Every generated document must actually be downloadable
    for doc in state["documents"]:
        download_resp = client.get(f"/api/documents/{doc['id']}/download")
        assert download_resp.status_code == 200
        assert len(download_resp.content) > 0


def test_unsupported_cn_code_rejected_at_product_creation(client):
    company_resp = client.post("/api/companies", json={"name": "Edge Case Co."})
    company_id = company_resp.json()["id"]

    resp = client.post(
        "/api/products",
        json={"company_id": company_id, "cn_code": "7601", "production_route": "BF-BOF", "annual_export_tonnes": 100},
    )
    assert resp.status_code == 422


def test_route_defaults_conservatively_when_omitted(client):
    company_resp = client.post("/api/companies", json={"name": "No Route Co."})
    company_id = company_resp.json()["id"]

    resp = client.post(
        "/api/products",
        json={"company_id": company_id, "cn_code": "7207", "annual_export_tonnes": 100},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["route_was_defaulted"] is True
    assert body["production_route"] == "BF-BOF"
