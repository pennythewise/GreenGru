"""Parse filled loan/grant application PDFs into editable form JSON.

Flow: PyMuPDF → pypdf → structured LLM field mapping (no regulated-number math).
"""

from __future__ import annotations

import copy
import json
import logging
import re
import shutil
import tempfile
from pathlib import Path
from typing import Any, Literal

from app.config import get_settings
from app.services.llm_client import call_structured
from app.services.rag.mineru_convert import _layout_fallback

logger = logging.getLogger(__name__)
settings = get_settings()

Route = Literal["loan", "grant"]

_LOAN_SYSTEM = """You map a filled Chinese green-loan application PDF (as markdown)
into a JSON object matching the GreenGru loan application schema.

Rules:
- Extract only values present in the document. Use null for unknown numbers,
  "" for unknown strings, false for unchecked booleans, null for unknown tri-state.
- Do NOT invent company names, amounts, or dates.
- Do NOT compute scores, tariffs, or emissions — map fields only.
- For enterprise_size pick at most one of large/medium/small/micro as true.
- For use_of_funds_category set selected_category_number (1–12) if a catalogue
  category is clearly selected; omit inventing category name lists.
- Return a single JSON object (no markdown fences).
"""

_GRANT_SYSTEM = """You map a filled Chinese zero-carbon / green-factory grant
application PDF (as markdown) into a JSON object matching the GreenGru grant
application schema.

Rules:
- Extract only values present in the document. Use null for unknown scores,
  "" for unknown strings, false for unchecked booleans.
- Do NOT invent factory names or scores.
- Do NOT recompute weighted totals beyond copying self_score values (0–100)
  for infrastructure, management_system, energy_resource_input, product,
  environmental_emissions, performance when visible.
- Do NOT invent regulated subsidy amounts — leave scoring math to deterministic code.
- Return a single JSON object (no markdown fences).
"""

_LOAN_DEFAULT: dict[str, Any] = {
    "company_information": {
        "company_name": "",
        "unified_social_credit_code": "",
        "registered_address": "",
        "industry_classification": "黑色金属冶炼和压延加工业 — 炼铁/炼钢/铁合金冶炼",
        "legal_representative": "",
        "contact_person_title": "",
        "phone": "",
        "email": "",
        "enterprise_size": {
            "large": False,
            "medium": False,
            "small": False,
            "micro": False,
        },
    },
    "loan_project_information": {
        "lender_applied_to": "",
        "loan_type": {
            "working_capital": False,
            "fixed_asset": False,
            "project_loan": False,
            "tech_upgrade": False,
            "other": "",
        },
        "requested_amount_rmb": None,
        "tenor": "",
        "contract_signing_date": "",
        "disbursement_date": "",
        "project_name": "",
        "project_description": "",
        "refinancing": {
            "includes_refinancing_portion": None,
            "estimated_financing_vs_refinancing_share": "",
            "look_back_period_for_refinanced_projects": "",
        },
        "management_of_proceeds": {
            "method": {
                "dedicated_account": False,
                "internal_tracking_ledger": False,
                "other": "",
            },
            "temporary_placement_arrangement_for_unallocated_proceeds": "",
            "is_one_tranche_of_multi_tranche_facility": None,
            "tranche_separately_labelled_green_and_tracked": None,
        },
    },
    "use_of_funds_category": {
        "selected_category_number": None,
        "categories": [
            {
                "number": 1,
                "name_cn": "绿色农业开发",
                "name_en": "Green agriculture development",
                "selected": False,
            },
            {
                "number": 2,
                "name_cn": "绿色林业开发",
                "name_en": "Green forestry development",
                "selected": False,
            },
            {
                "number": 3,
                "name_cn": "工业节能节水环保",
                "name_en": "Industrial energy/water-saving & environmental protection",
                "selected": False,
            },
            {
                "number": 4,
                "name_cn": "自然保护、生态修复及灾害防控",
                "name_en": "Nature protection & ecological restoration",
                "selected": False,
            },
            {
                "number": 5,
                "name_cn": "资源循环利用",
                "name_en": "Resource recycling",
                "selected": False,
            },
            {
                "number": 6,
                "name_cn": "垃圾处理及污染防治",
                "name_en": "Waste treatment & pollution control",
                "selected": False,
            },
            {
                "number": 7,
                "name_cn": "可再生能源及清洁能源",
                "name_en": "Renewable & clean energy",
                "selected": False,
            },
            {
                "number": 8,
                "name_cn": "农村及城市水",
                "name_en": "Rural & urban water",
                "selected": False,
            },
            {
                "number": 9,
                "name_cn": "建筑节能及绿色建筑",
                "name_en": "Building energy efficiency & green building",
                "selected": False,
            },
            {
                "number": 10,
                "name_cn": "绿色交通运输",
                "name_en": "Green transport",
                "selected": False,
            },
            {
                "number": 11,
                "name_cn": "节能环保服务",
                "name_en": "Energy-saving & environmental services",
                "selected": False,
            },
            {
                "number": 12,
                "name_cn": "境外项目（国际标准）",
                "name_en": "Overseas projects (international standards)",
                "selected": False,
            },
        ],
        "glp_evaluation_and_selection_process": {
            "environmental_sustainability_objectives": "",
            "taxonomy_or_process_used_for_eligibility": (
                "PBOC 绿色金融支持项目目录 (2025) and/or T/CISA 452-2024, as applicable"
            ),
            "exclusion_criteria": "",
            "environmental_social_risk_identification_process": "",
            "material_risks_identified_and_mitigants": "",
        },
    },
    "carbon_account_addon": {
        "applicable": False,
        "enterprise_carbon_account_opened": None,
        "carbon_account_platform_name": "",
        "authorised_platform_to_issue_carbon_credit_report_to_lender": None,
        "latest_carbon_emission_performance_rating": "",
        "registered_capital": "",
        "years_in_operation": "",
        "profitability_summary_past_3yrs": "",
        "existing_financing_liabilities_total": "",
        "legal_rep_and_management_credit_standing": "",
        "material_investment_plans_during_loan_term": "",
        "proposed_collateral_guarantee_type": "",
        "transition_plan_disclosed_to_lender": "",
    },
    "environmental_benefit_and_reporting": {
        "expected_realised_tco2e_reduction": "",
        "expected_realised_energy_savings": "",
        "expected_realised_water_savings": "",
        "expected_realised_pollutant_reduction": "",
        "other_notes": "",
        "methodology_assumptions_disclosed": "",
        "reporting_frequency": {"annual": False, "semi_annual": False, "other": ""},
        "reports_renewed_until": {
            "loan_fully_allocated": False,
            "loan_maturity_revolving_facility": False,
        },
        "next_report_due_date": "",
        "report_recipients": {
            "lender": False,
            "public_disclosure": False,
            "both": False,
        },
    },
    "compliance_declaration": {
        "no_major_environmental_violation_3yrs": False,
        "no_safety_production_violation": False,
        "not_on_phased_out_capacity_list": False,
        "holds_valid_discharge_permit": False,
        "has_ems_iso14001_or_equivalent": False,
        "use_of_funds_maps_clearly_to_one_category": False,
        "meets_gzgfa_baseline_eligibility": False,
    },
    "glp_alignment_verification": {
        "applicable": False,
        "external_review": {"selected": False, "reviewer_name": ""},
        "self_certification": {
            "selected": False,
            "documentation_available_to_lenders": None,
        },
        "not_yet_determined": False,
    },
    "interest_subsidy_addon": {
        "applying_for_subsidy": False,
        "contract_disbursement_within_policy_period": None,
        "subsidy_year": "",
        "interest_paid_this_year_rmb": None,
        "total_subsidy_claimed_this_year_rmb": None,
        "submitted_within_required_window": None,
    },
    "declaration": {
        "legal_rep_signature": "",
        "date": "",
        "company_seal_applied": False,
    },
}

_GRANT_DEFAULT: dict[str, Any] = {
    "factory_basic_information": {
        "factory_name": "",
        "factory_address": "",
        "industry_code_nbs_4digit": "",
        "main_products": "",
        "ownership_type": {
            "domestic_state_owned": False,
            "domestic_collective": False,
            "domestic_private": False,
            "sino_foreign_joint_venture": False,
            "hk_macau_taiwan_invested": False,
            "wholly_foreign_owned": False,
        },
        "unified_social_credit_code": "",
        "legal_representative": "",
        "legal_representative_phone": "",
        "application_contact_person": "",
        "contact_department": "",
        "contact_phone": "",
        "contact_email": "",
    },
    "certification_level_applied_for": {
        "national": False,
        "provincial": False,
        "municipal": False,
    },
    "basic_veto_requirements": {
        "registered_in_china_manufacturing_gb_t4754": False,
        "qms_gb_t19001_in_place": False,
        "ohsms_gb_t45001_28001_in_place": False,
        "ems_gb_t24001_in_place": False,
        "energy_mgmt_system_gb_t23331_in_place": False,
        "no_phased_out_banned_tech_process_equipment": False,
        "dedicated_solid_waste_storage_and_dust_recovery": False,
        "emissions_comply_with_control_and_permit_requirements": False,
        "energy_metering_per_gb17167": False,
        "no_major_environmental_incident_past_3yrs": False,
    },
    "indicator_scoring_self_evaluation": {
        "infrastructure": {"weight_pct": 20, "self_score": None},
        "management_system": {"weight_pct": 15, "self_score": None},
        "energy_resource_input": {"weight_pct": 15, "self_score": None},
        "product": {"weight_pct": 10, "self_score": None},
        "environmental_emissions": {"weight_pct": 10, "self_score": None},
        "performance": {"weight_pct": 30, "self_score": None},
        "total_score": None,
    },
    "evaluation_method": {
        "self_evaluation": False,
        "third_party_evaluation": False,
        "third_party_institution_name": "",
    },
    "evaluation_report_outline_attached": {
        "section1_overview": False,
        "section2_evaluation_content": False,
        "section3_evaluation_conclusion": False,
        "section4_recommendations": False,
        "section5_reference_documents": False,
        "annex_onsite_supporting_materials_checklist": False,
    },
    "declaration": {
        "legal_rep_signature": "",
        "date": "",
        "company_seal_applied": False,
    },
}

_GRANT_WEIGHTS = {
    "infrastructure": 20,
    "management_system": 15,
    "energy_resource_input": 15,
    "product": 10,
    "environmental_emissions": 10,
    "performance": 30,
}


def _deep_merge(base: Any, overlay: Any) -> Any:
    if isinstance(base, dict) and isinstance(overlay, dict):
        out = dict(base)
        for key, val in overlay.items():
            if key in out:
                out[key] = _deep_merge(out[key], val)
            else:
                out[key] = copy.deepcopy(val)
        return out
    if overlay is None:
        return base
    return copy.deepcopy(overlay)


def _normalize_loan(merged: dict[str, Any]) -> dict[str, Any]:
    base_cats = copy.deepcopy(_LOAN_DEFAULT["use_of_funds_category"]["categories"])
    uof = merged.setdefault("use_of_funds_category", {})
    selected = uof.get("selected_category_number")
    try:
        selected_n = int(selected) if selected is not None else None
    except (TypeError, ValueError):
        selected_n = None
    if selected_n is not None and not (1 <= selected_n <= 12):
        selected_n = None
    uof["selected_category_number"] = selected_n
    uof["categories"] = [
        {**c, "selected": c["number"] == selected_n} for c in base_cats
    ]
    return merged


def _normalize_grant(merged: dict[str, Any]) -> dict[str, Any]:
    scoring = merged.setdefault("indicator_scoring_self_evaluation", {})
    total = 0.0
    have_all = True
    for key, weight in _GRANT_WEIGHTS.items():
        dim = scoring.setdefault(key, {})
        if not isinstance(dim, dict):
            dim = {}
            scoring[key] = dim
        dim["weight_pct"] = weight
        score = dim.get("self_score")
        try:
            if score is None or score == "":
                dim["self_score"] = None
                have_all = False
            else:
                n = float(score)
                n = max(0.0, min(100.0, n))
                dim["self_score"] = n
                total += (n * weight) / 100.0
        except (TypeError, ValueError):
            dim["self_score"] = None
            have_all = False
    scoring["total_score"] = round(total, 1) if have_all else None
    return merged


def _pdf_to_markdown(content: bytes, *, filename: str) -> tuple[str, str]:
    """Extract text via PyMuPDF, then pypdf — no MinerU / vision."""
    safe = Path(filename or "application.pdf").name
    with tempfile.TemporaryDirectory(prefix="app_form_pdf_") as tmp:
        root = Path(tmp)
        pdf_path = root / safe
        pdf_path.write_bytes(content)
        text, method = _layout_fallback(pdf_path)
        if not text.strip():
            return "", method
        text = re.sub(r"\n{4,}", "\n\n\n", text).strip() + "\n"
        try:
            persist = Path(settings.local_storage_dir) / "application_form_uploads"
            persist.mkdir(parents=True, exist_ok=True)
            shutil.copy2(pdf_path, persist / safe)
            (persist / f"{pdf_path.stem}.md").write_text(text, encoding="utf-8")
        except OSError:
            pass
        return text, method


def parse_application_form_pdf(
    *,
    content: bytes,
    filename: str,
    route: Route,
) -> dict[str, Any]:
    """PyMuPDF→pypdf text, then LLM map into loan/grant form JSON."""
    if not content:
        raise ValueError("empty_file")
    if route not in ("loan", "grant"):
        raise ValueError(f"unsupported route: {route}")

    markdown, method = _pdf_to_markdown(content, filename=filename)
    if not markdown.strip():
        raise ValueError("no_extractable_text")

    clipped = markdown[:50_000]
    defaults = copy.deepcopy(_LOAN_DEFAULT if route == "loan" else _GRANT_DEFAULT)
    schema_hint = json.dumps(defaults, ensure_ascii=False, indent=2)[:12_000]

    system = _LOAN_SYSTEM if route == "loan" else _GRANT_SYSTEM
    user = (
        f"Target schema (defaults — overwrite with extracted values):\n"
        f"```json\n{schema_hint}\n```\n\n"
        f"PDF markdown ({method}):\n```markdown\n{clipped}\n```"
    )

    mock = copy.deepcopy(defaults)
    if route == "loan":
        mock["company_information"]["company_name"] = "（模拟）从 PDF 解析的企业名称"
        mock["company_information"]["enterprise_size"]["small"] = True
        mock["loan_project_information"]["project_name"] = "（模拟）绿色技改项目"
        mock["loan_project_information"]["requested_amount_rmb"] = 5_000_000
        mock["use_of_funds_category"]["selected_category_number"] = 3
    else:
        mock["factory_basic_information"]["factory_name"] = "（模拟）从 PDF 解析的工厂名称"
        mock["factory_basic_information"]["ownership_type"]["domestic_private"] = True
        mock["certification_level_applied_for"]["municipal"] = True
        mock["indicator_scoring_self_evaluation"]["infrastructure"]["self_score"] = 80
        mock["indicator_scoring_self_evaluation"]["management_system"]["self_score"] = 75
        mock["indicator_scoring_self_evaluation"]["energy_resource_input"]["self_score"] = 70
        mock["indicator_scoring_self_evaluation"]["product"]["self_score"] = 72
        mock["indicator_scoring_self_evaluation"]["environmental_emissions"]["self_score"] = 78
        mock["indicator_scoring_self_evaluation"]["performance"]["self_score"] = 74

    extracted = call_structured(
        model=settings.model_writing,
        system_prompt=system,
        user_prompt=user,
        mock_response=mock,
        temperature=0.0,
        role="writing",
        timeout=480.0,
    )
    extracted.pop("_mock", None)
    if not isinstance(extracted, dict):
        raise ValueError("llm_returned_non_object")

    merged = _deep_merge(defaults, extracted)
    if route == "loan":
        merged = _normalize_loan(merged)
    else:
        merged = _normalize_grant(merged)

    logger.info(
        "Application form PDF parse · route=%s · method=%s · chars=%s",
        route,
        method,
        len(markdown),
    )
    return {
        "route": route,
        "application_form": merged,
        "convert_method": method,
        "char_count": len(markdown),
        "source_file": Path(filename or "application.pdf").name,
    }
