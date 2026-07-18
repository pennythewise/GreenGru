"""CBAM installation-operator readiness scorer (passport Stage 3)."""

from app.services.cbam_operator_scorer import compute_cbam_operator_score


def test_veto_caps_score_when_gates_fail():
    result = compute_cbam_operator_score(
        cn_code=None,
        production_route=None,
        checklist=[],
        intensity_tco2e_per_t=3.506,
    )
    assert result.veto_passed is False
    assert result.total_score <= 54.9
    assert result.qualified is False


def test_full_checklist_can_qualify():
    checklist = [
        {"name": "CN-code product list · 税则号", "done": True},
        {"name": "Route-of-production statement", "done": True},
        {"name": "Summary_Process · Summary_Communication / Processes / Products", "done": True},
        {"name": "A_InstData — installation, processes, purchased precursors", "done": True},
        {"name": "c_CodeLists — country codes, routes, goods categories", "done": True},
        {"name": "Direct + indirect embedded emissions", "done": True},
        {"name": "Installation-level emissions data", "done": True},
        {"name": "Verifier accreditation", "done": True},
        {"name": "Purchased CBAM certificates (Q ledger)", "done": True},
    ]
    result = compute_cbam_operator_score(
        cn_code="7213",
        production_route="BF-BOF",
        intensity_tco2e_per_t=2.1,
        metering_pct=90.0,
        scrap_ratio_pct=35.0,
        checklist=checklist,
    )
    assert result.veto_passed is True
    assert result.total_score >= 70.0
    assert result.qualified is True
    assert len(result.dimensions) == 5
    assert result.standard == "CBAM Operator Guidance"


def test_api_cbam_score_endpoint():
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as client:
        resp = client.post(
            "/api/routes/cbam-score",
            json={
                "cn_code": "7208 10 00",
                "production_route": "BF-BOF",
                "intensity_tco2e_per_t": 3.0,
                "metering_pct": 80,
                "scrap_ratio_pct": 25,
                "checklist": [
                    {"name": "CN-code product list · 税则号", "done": True},
                    {"name": "Route-of-production statement", "done": True},
                    {"name": "Direct + indirect embedded emissions", "done": True},
                    {"name": "A_InstData — installation, processes, purchased precursors", "done": True},
                ],
            },
        )
    assert resp.status_code == 200
    data = resp.json()
    assert data["max_score"] == 100.0
    assert "dimensions" in data
    assert data["veto_passed"] is True
