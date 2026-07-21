"""Six-stage pipeline orchestration for New Submission — runs real backend
logic (not frontend timers) from OCR preview payload."""

from __future__ import annotations

import hashlib
import hmac
import json
import time
from dataclasses import asdict

from app.calculation_engine import CBAMInput, ProductionRoute, calculate_cbam_exposure
from app.config import get_settings
from app.data.cert_price import get_certificate_price
from app.services.cisa_process_engine import compute_cisa_dashboard
from app.services.classifier_agent import classify_product
from app.services.invoice_parser import product_description_from_invoice, total_tonnes_from_invoice
from app.services.intake_validator import validate_intake
from app.services.intake_agent import IntakeExtraction
from app.services.nuonuo_client import inspect_invoice
from app.services.threshold_scoring import score_calculation

settings = get_settings()


def _sign_payload(payload: dict) -> tuple[str, str]:
    canonical = json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    content_hash = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    signature = hmac.new(
        settings.document_signing_secret.encode("utf-8"),
        content_hash.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return content_hash, signature


def _elapsed_ms(start: float) -> str:
    return f"{(time.perf_counter() - start) * 1000:.0f} ms"


async def run_pipeline_from_preview(
    *,
    invoice: dict,
    classification_route: str,
    production_volume_tonnes: float | None,
    ocr_source: str,
    mock_fields: list[str],
    year: int = 2026,
    iot_snapshot_id: str | None = None,
) -> dict:
    """Execute stages 1–5; stage 6 returns a signable package only."""
    stages: list[dict] = []
    product_desc = product_description_from_invoice(invoice)
    tonnes = production_volume_tonnes or total_tonnes_from_invoice(invoice) or 100.0
    route = classification_route or "BF-BOF"

    iot_evidence: dict | None = None
    if iot_snapshot_id:
        from app.db import async_session_factory
        from app.models_orm import IotWindowSnapshot
        from sqlalchemy import select

        async with async_session_factory() as session:
            result = await session.execute(
                select(IotWindowSnapshot).where(IotWindowSnapshot.id == iot_snapshot_id)
            )
            snap = result.scalar_one_or_none()
            if snap:
                iot_evidence = {
                    "snapshot_id": snap.id,
                    "window_minutes": snap.window_minutes,
                    "green_trading": snap.green_trading,
                    "emission_factor_t_per_mwh": snap.emission_factor_t_per_mwh,
                    "sample_count": snap.sample_count,
                    "delta_kwh": snap.delta_kwh,
                    "avg_power_w": snap.avg_power_w,
                    "tco2e": snap.tco2e,
                    "scope": "financing_electricity_only_not_cbam",
                }

    # --- Stage 1: Intake ---
    t0 = time.perf_counter()
    extraction = IntakeExtraction(
        production_volume_tonnes=tonnes,
        fuel_type="coking coal (BF-BOF)" if route == "BF-BOF" else None,
        cn_code_hint=None,
        billing_period=invoice.get("issueDate"),
        confidence="medium" if ocr_source in ("mock", "vision_unavailable") else "high",
        flags=list(mock_fields),
    )
    validation = validate_intake(extraction, historical_scale_tonnes=tonnes * 0.8)
    stages.append(
        {
            "n": 1,
            "key": "Intake",
            "zh": "接入",
            "status": "done",
            "elapsed": _elapsed_ms(t0),
            "summary": (
                f"OCR source: {ocr_source} · volume {tonnes:.1f} t"
                + (
                    f" · IoT {iot_evidence['window_minutes']}m window ({iot_evidence['sample_count']} samples)"
                    if iot_evidence
                    else ""
                )
            ),
            "detail": {
                "ocr_source": ocr_source,
                "mock_fields": mock_fields,
                "iot_window_snapshot": iot_evidence,
                "extracted": {
                    "production_volume_tonnes": tonnes,
                    "billing_period": extraction.billing_period,
                    "product_description": product_desc[:120],
                },
                "formulas": [],
            },
        }
    )

    # --- Stage 2: Validate via Nuonuo ---
    t0 = time.perf_counter()
    nuonuo = await inspect_invoice(invoice)
    stages.append(
        {
            "n": 2,
            "key": "Validate",
            "zh": "校验",
            "status": "done" if nuonuo.status == "verified" else "flagged",
            "elapsed": _elapsed_ms(t0),
            "summary": nuonuo.message,
            "detail": {
                "provider": "诺诺 Nuonuo → 国家税务总局",
                "api_method": "nuonuo.OpeMplatform.invoiceInspection",
                "mock": nuonuo.mock,
                "invoice_status": nuonuo.invoice_status,
                "checks": nuonuo.checks,
                "validator_status": validation.status,
                "validator_notes": validation.notes,
                "formulas": [],
            },
        }
    )

    # --- Stage 3: Classify ---
    t0 = time.perf_counter()
    classify_result = classify_product(product_desc, cn_code_hint=None)
    stages.append(
        {
            "n": 3,
            "key": "Classify",
            "zh": "分类",
            "status": "done",
            "elapsed": _elapsed_ms(t0),
            "summary": f"{classify_result.cn_code} · conf {classify_result.confidence:.0%} · {classify_result.model_used}",
            "detail": {
                "cn_code": classify_result.cn_code,
                "confidence": classify_result.confidence,
                "model_used": classify_result.model_used,
                "escalated": classify_result.escalated,
                "requires_manual": classify_result.requires_manual_confirmation,
                "reason": classify_result.reason,
                "formulas": [],
            },
        }
    )

    # --- Stage 4: Calculate (CBAM + CISA) ---
    t0 = time.perf_counter()
    try:
        prod_route = ProductionRoute(route)
    except ValueError:
        prod_route = ProductionRoute.BF_BOF

    price_entry = get_certificate_price(settings.cbam_certificate_price_quarter)
    cbam = calculate_cbam_exposure(
        CBAMInput(
            cn_code=classify_result.cn_code,
            route=prod_route,
            annual_export_tonnes=tonnes,
            year=year,
        ),
        certificate_price_eur_per_tco2e=price_entry.price_eur_per_tco2e,
    )
    cisa = compute_cisa_dashboard(route=route, production_tonnes=tonnes)
    scoring = score_calculation(cbam, annual_export_tonnes=tonnes, route=route)

    stages.append(
        {
            "n": 4,
            "key": "Calculate",
            "zh": "计算",
            "status": "done",
            "elapsed": _elapsed_ms(t0),
            "summary": f"CBAM €{cbam.tariff_cost_eur_per_tonne:.2f}/t · CISA {scoring.cisa_grade}",
            "detail": {
                "cbam": {
                    "intensity_tco2e_per_tonne": cbam.intensity_tco2e_per_tonne,
                    "benchmark_tco2e_per_tonne": cbam.benchmark_tco2e_per_tonne,
                    "taxable_emissions_tco2e_per_tonne": cbam.taxable_emissions_tco2e_per_tonne,
                    "phase_in_factor": cbam.phase_in_factor,
                    "tariff_cost_eur_per_tonne": cbam.tariff_cost_eur_per_tonne,
                    "annual_exposure_eur": cbam.annual_exposure_eur,
                },
                "cisa_formulas": [asdict(s) for s in cisa.formula_steps],
                "formulas": [
                    {
                        "eq": "CBAM",
                        "label": "Taxable emissions",
                        "latex": "taxable = max(0, intensity − benchmark)",
                        "values": {
                            "intensity": cbam.intensity_tco2e_per_tonne,
                            "benchmark": cbam.benchmark_tco2e_per_tonne,
                        },
                        "result": cbam.taxable_emissions_tco2e_per_tonne,
                    },
                    {
                        "eq": "CBAM",
                        "label": "Net tariff (phase-in)",
                        "latex": "tariff = taxable × cert_price × (1+markup) × φ_year",
                        "values": {
                            "cert_price": cbam.certificate_price_eur_per_tco2e,
                            "markup": cbam.markup_applied,
                            "φ_year": cbam.phase_in_factor,
                        },
                        "result": cbam.tariff_cost_eur_per_tonne,
                    },
                ],
            },
        }
    )

    # --- Stage 5: Dashboard commit ---
    t0 = time.perf_counter()
    dashboard_snapshot = {
        "tierGauge": {
            "value": cisa.tier_gauge_value,
            "nextTier": cisa.tier_gauge_next,
            "zh": f"距 {cisa.tier_gauge_next} 级",
            "pointsToNext": cisa.points_to_next_tier,
        },
        "ratioSliders": cisa.ratio_sliders,
        "emissionsBreakdown": cisa.emissions_breakdown,
        "processMatrix": cisa.process_matrix,
        "cisaGrade": scoring.cisa_grade,
        "intensity": cisa.total_intensity_tco2e_per_tonne,
        "updatedAt": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    stages.append(
        {
            "n": 5,
            "key": "Update dashboard",
            "zh": "更新总览",
            "status": "done",
            "elapsed": _elapsed_ms(t0),
            "summary": "Distance to tier · grant levers · emissions split · process matrix",
            "detail": {"dashboard_snapshot": dashboard_snapshot, "formulas": []},
        }
    )

    # --- Stage 6: Package for upstream (hash + signature, not blockchain) ---
    package_body = {
        "invoice_number": invoice.get("invoiceNumber"),
        "cn_code": classify_result.cn_code,
        "tonnes": tonnes,
        "cbam_tariff_eur_per_tonne": cbam.tariff_cost_eur_per_tonne,
        "cisa_grade": scoring.cisa_grade,
        "nuonuo_status": nuonuo.status,
        "stages_complete": 5,
        "iot_window_snapshot": iot_evidence,
    }
    content_hash, signature = _sign_payload(package_body)

    stages.append(
        {
            "n": 6,
            "key": "Authorize → Upstream",
            "zh": "授权上传",
            "status": "pending",
            "elapsed": None,
            "summary": "Awaiting operator authorization",
            "detail": {
                "package": package_body,
                "content_hash": content_hash,
                "signature": signature,
                "signing_method": "SHA-256 canonical JSON + HMAC-SHA256",
                "note": "Not blockchain — tamper-evidence per PRD §9.3",
                "formulas": [],
            },
        }
    )

    return {
        "stages": stages,
        "dashboard_snapshot": dashboard_snapshot,
        "package": {
            "body": package_body,
            "content_hash": content_hash,
            "signature": signature,
        },
    }
