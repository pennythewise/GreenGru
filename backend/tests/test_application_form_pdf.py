"""Filled Grant / Loan application form PDF generation."""

from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app
from app.services.pdf_generator import render_filled_application_form_pdf


def test_render_grant_form_pdf_smoke():
    form = {
        "factory_basic_information": {
            "factory_name": "六安江淮电机有限公司",
            "factory_address": "安徽省六安市",
            "industry_code_nbs_4digit": "3130",
            "main_products": "碳结圆",
            "ownership_type": {
                "domestic_state_owned": False,
                "domestic_collective": False,
                "domestic_private": True,
                "sino_foreign_joint_venture": False,
                "hk_macau_taiwan_invested": False,
                "wholly_foreign_owned": False,
            },
            "unified_social_credit_code": "9134150072554518XQ",
            "legal_representative": "张三",
            "legal_representative_phone": "0564-3368617",
            "application_contact_person": "李四",
            "contact_department": "安环部",
            "contact_phone": "13800000000",
            "contact_email": "a@example.com",
        },
        "certification_level_applied_for": {"national": False, "provincial": True, "municipal": False},
        "basic_veto_requirements": {
            "registered_in_china_manufacturing_gb_t4754": True,
            "qms_gb_t19001_in_place": True,
            "ohsms_gb_t45001_28001_in_place": True,
            "ems_gb_t24001_in_place": True,
            "energy_mgmt_system_gb_t23331_in_place": True,
            "no_phased_out_banned_tech_process_equipment": True,
            "dedicated_solid_waste_storage_and_dust_recovery": True,
            "emissions_comply_with_control_and_permit_requirements": True,
            "energy_metering_per_gb17167": True,
            "no_major_environmental_incident_past_3yrs": True,
        },
        "indicator_scoring_self_evaluation": {
            "infrastructure": {"weight_pct": 20, "self_score": 16},
            "management_system": {"weight_pct": 15, "self_score": 12},
            "energy_resource_input": {"weight_pct": 15, "self_score": 10},
            "product": {"weight_pct": 10, "self_score": 7},
            "environmental_emissions": {"weight_pct": 10, "self_score": 8},
            "performance": {"weight_pct": 30, "self_score": 20},
            "total_score": 73,
        },
        "evaluation_method": {
            "self_evaluation": True,
            "third_party_evaluation": False,
            "third_party_institution_name": "",
        },
        "evaluation_report_outline_attached": {
            "section1_overview": True,
            "section2_evaluation_content": True,
            "section3_evaluation_conclusion": True,
            "section4_recommendations": False,
            "section5_reference_documents": False,
            "annex_onsite_supporting_materials_checklist": False,
        },
        "declaration": {"legal_rep_signature": "张三", "date": "2026-07-18", "company_seal_applied": True},
    }
    doc = render_filled_application_form_pdf(
        route="grant",
        application_form=form,
        score_summary="72/100 · Municipal green factory",
    )
    assert Path(doc.storage_path).exists()
    assert doc.content_hash


def test_api_application_form_pdf_grant():
    with TestClient(app) as client:
        resp = client.post(
            "/api/routes/application-form-pdf/download",
            json={
                "route": "grant",
                "application_form": {
                    "factory_basic_information": {
                        "factory_name": "Test Co",
                        "factory_address": "Addr",
                        "industry_code_nbs_4digit": "3130",
                        "main_products": "bolts",
                        "ownership_type": {
                            "domestic_state_owned": False,
                            "domestic_collective": False,
                            "domestic_private": True,
                            "sino_foreign_joint_venture": False,
                            "hk_macau_taiwan_invested": False,
                            "wholly_foreign_owned": False,
                        },
                        "unified_social_credit_code": "91TEST",
                        "legal_representative": "A",
                        "legal_representative_phone": "1",
                        "application_contact_person": "B",
                        "contact_department": "C",
                        "contact_phone": "2",
                        "contact_email": "a@b.c",
                    },
                    "certification_level_applied_for": {
                        "national": False,
                        "provincial": False,
                        "municipal": True,
                    },
                    "basic_veto_requirements": {
                        "registered_in_china_manufacturing_gb_t4754": True,
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
                        "self_evaluation": True,
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
                },
            },
        )
    assert resp.status_code == 200
    assert len(resp.content) > 500
