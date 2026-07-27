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
        production_tonnes=1000.0,
        checklist=checklist,
    )
    assert result.veto_passed is True
    assert result.total_score >= 70.0
    assert result.qualified is True
    assert len(result.dimensions) == 5
    assert result.standard == "CBAM Operator Guidance"
    assert result.approval_likelihood_pct >= 70.0
    assert abs(result.approval_likelihood_pct + result.deny_likelihood_pct - 100.0) < 0.2
    assert result.tariff.certificate_price_eur_per_tco2e == 75.36
    assert result.tariff_if_approved.tariff_eur_per_tonne > 0
    assert result.tariff_if_approved.data_source == "measured"
    assert result.tariff_if_denied.data_source == "china_default"
    assert result.tariff_if_denied.tariff_eur_per_tonne > result.tariff_if_approved.tariff_eur_per_tonne
    assert result.export_margin.margin_eur_per_tonne_before > 0
    assert result.export_margin.margin_saved_by_approval_eur_per_tonne > 0
    assert result.export_margin.cost_pct_of_fob_if_denied > result.export_margin.cost_pct_of_fob_if_approved
    assert result.export_margin.cost_pct_of_fob_if_approved >= 0
    ill = result.industry_illustration
    assert ill.has_lifecycle_transparency is True
    # Default path = engine denied (Annex I); approved = measured 2.1
    assert ill.default_path_eur_per_tonne == result.tariff_if_denied.tariff_eur_per_tonne
    assert ill.approved_path_eur_per_tonne == result.tariff_if_approved.tariff_eur_per_tonne
    assert ill.approved_path_eur_per_tonne < ill.default_path_eur_per_tonne
    assert ill.approved_see_tco2e_per_t == 2.1
    assert "172.46" not in ill.note_en and "526.47" not in ill.note_en


def test_default_values_path_when_no_emissions_evidence():
    result = compute_cbam_operator_score(
        cn_code="7208 10 00",
        production_route="BF-BOF",
        intensity_tco2e_per_t=3.506,
        checklist=[
            {"name": "CN-code product list · 税则号", "done": True},
            {"name": "Route-of-production statement", "done": True},
        ],
        production_tonnes=500.0,
    )
    assert result.tariff.data_source == "china_default"
    assert result.tariff.markup_applied == 0.10
    assert result.tariff.certificate_price_eur_per_tco2e == 75.36
    # Annex I China×7208: (3.187×1.10 − 1.370)×75.36×0.025 ≈ €4.02/t (mark-up once)
    assert 3.0 < result.tariff.tariff_eur_per_tonne < 5.0
    assert result.tariff_if_denied.tariff_eur_per_tonne == result.tariff.tariff_eur_per_tonne
    assert result.export_margin.margin_eur_after_denied < result.export_margin.margin_eur_per_tonne_before
    ill = result.industry_illustration
    assert ill.has_lifecycle_transparency is False
    assert ill.default_path_eur_per_tonne == result.tariff_if_denied.tariff_eur_per_tonne
    assert ill.approved_path_eur_per_tonne == ill.default_path_eur_per_tonne
    assert ill.discount_eur_per_tonne == 0.0
    assert ill.see_source == "engine_annex_i_default"


def test_fastener_annex_i_vs_measured():
    """Annex I China×7318 15 default vs measured intensity on engine path."""
    result = compute_cbam_operator_score(
        cn_code="7318 15 88",
        production_route="BF-BOF",
        intensity_tco2e_per_t=2.0,
        checklist=[
            {"name": "CN-code product list · 税则号", "done": True},
            {"name": "Route-of-production statement", "done": True},
            {"name": "Direct + indirect embedded emissions", "done": True},
            {"name": "Installation-level emissions data", "done": True},
        ],
        production_tonnes=800.0,
    )
    ill = result.industry_illustration
    assert ill.baseline_key == "fastener"
    assert ill.has_lifecycle_transparency is True
    assert ill.see_source == "engine_measured"
    assert ill.approved_see_tco2e_per_t == 2.0
    assert ill.default_see_tco2e_per_t == result.tariff_if_denied.intensity_tco2e_per_tonne
    # Denied uses 6.375×1.10; approved uses 2.0 measured — large gap
    assert ill.default_path_eur_per_tonne > ill.approved_path_eur_per_tonne
    assert ill.discount_pct > 50.0
    assert ill.default_path_eur_per_tonne != 526.47


def test_slash_cn_code_does_not_crash():
    result = compute_cbam_operator_score(
        cn_code="7213 / 7214",
        production_route="BF-BOF",
        intensity_tco2e_per_t=3.506,
        checklist=[
            {"name": "CN-code product list · 税则号", "done": True},
            {"name": "Route-of-production statement", "done": True},
        ],
    )
    assert result.tariff.tariff_eur_per_tonne >= 0
    assert result.tariff_if_approved is not None
    assert result.export_margin.fob_eur_per_tonne == 850.0


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
    assert "approval_likelihood_pct" in data
    assert "deny_likelihood_pct" in data
    assert data["tariff"]["certificate_price_eur_per_tco2e"] == 75.36
    assert data["tariff"]["tariff_eur_per_tonne"] >= 0
    assert "tariff_if_approved" in data
    assert "tariff_if_denied" in data
    assert "export_margin" in data
    assert data["export_margin"]["margin_pct_before_cbam"] == 12.0
    assert "industry_illustration" in data
    ill = data["industry_illustration"]
    assert ill["default_path_eur_per_tonne"] == data["tariff_if_denied"]["tariff_eur_per_tonne"]
    assert ill["approved_path_eur_per_tonne"] == data["tariff_if_approved"]["tariff_eur_per_tonne"]
    assert ill["approved_path_eur_per_tonne"] < ill["default_path_eur_per_tonne"]
    assert 172.46 not in (ill["default_path_eur_per_tonne"], ill["approved_path_eur_per_tonne"])
