"""Loan Stage-3 dual-source scorer (GB/T 36132 + Catalogue 2025)."""

from fastapi.testclient import TestClient

from app.main import app
from app.services.loan_green_finance_scorer import compute_loan_green_finance_score


def _full_compliance_form(**overrides):
    form = {
        "use_of_funds_category": {
            "selected_category_number": 3,
            "categories": [
                {
                    "number": 3,
                    "name_cn": "工业节能节水环保",
                    "name_en": "Industrial energy/water-saving",
                    "selected": True,
                }
            ],
            "glp_evaluation_and_selection_process": {
                "environmental_sustainability_objectives": "Reduce tCO2e via EAF retrofit",
                "taxonomy_or_process_used_for_eligibility": "目录 2025 §1.4.1",
                "exclusion_criteria": "",
                "environmental_social_risk_identification_process": "ISO 14001",
                "material_risks_identified_and_mitigants": "",
            },
        },
        "loan_project_information": {
            "management_of_proceeds": {
                "method": {
                    "dedicated_account": True,
                    "internal_tracking_ledger": False,
                    "other": "",
                }
            }
        },
        "environmental_benefit_and_reporting": {
            "expected_realised_tco2e_reduction": "1200",
            "reporting_frequency": {"annual": True, "semi_annual": False, "other": ""},
        },
        "compliance_declaration": {
            "no_major_environmental_violation_3yrs": True,
            "no_safety_production_violation": True,
            "not_on_phased_out_capacity_list": True,
            "holds_valid_discharge_permit": True,
            "has_ems_iso14001_or_equivalent": True,
            "use_of_funds_maps_clearly_to_one_category": True,
            "meets_gzgfa_baseline_eligibility": True,
        },
    }
    form.update(overrides)
    return form


def test_veto_caps_when_compliance_fails():
    result = compute_loan_green_finance_score(
        application_form={"compliance_declaration": {}},
        checklist=[],
    )
    assert result.veto_passed is False
    assert result.total_score <= 54.9


def test_steel_category_can_qualify():
    checklist = [
        {"name": "Business licence · 营业执照", "done": True},
        {"name": "Latest 12-mo utility invoices", "done": True},
        {"name": "Emissions ledger · Q1–Q4 2025", "done": True},
        {"name": "Bank statement · last 6 mo", "done": True},
        {"name": "Green-project use-of-proceeds", "done": True},
        {"name": "Auditor attestation (optional)", "done": True},
    ]
    result = compute_loan_green_finance_score(
        scrap_ratio_pct=38,
        green_electricity_pct=55,
        intensity_tco2e_per_t=2.2,
        metering_pct=90,
        checklist=checklist,
        application_form=_full_compliance_form(),
    )
    assert result.veto_passed is True
    assert result.total_score >= 70
    assert result.qualified is True
    assert len(result.dimensions) == 5
    assert "36132" in result.standard or "目录" in result.standard_zh


def test_api_loan_score():
    with TestClient(app) as client:
        resp = client.post(
            "/api/routes/loan-score",
            json={
                "scrap_ratio_pct": 30,
                "green_electricity_pct": 40,
                "intensity_tco2e_per_t": 3.0,
                "metering_pct": 80,
                "checklist": [{"name": "Business licence · 营业执照", "done": True}],
                "application_form": _full_compliance_form(),
            },
        )
    assert resp.status_code == 200
    data = resp.json()
    assert data["max_score"] == 100.0
    assert data["veto_passed"] is True
    assert len(data["dimensions"]) == 5
