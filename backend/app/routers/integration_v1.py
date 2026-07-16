"""GreenGru Integration API v1 — simulated endpoints for Baowu/Ansteel developers.

Read-only aggregate access to downstream SME Scope 1+2 emissions for anchor
enterprise Scope 3 Category 10 inventory. Mirrors REST + api_key query auth
patterns familiar from outbound automation platforms.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from app.config import get_settings
from app.data.integration_suppliers import (
    SCOPE3_MONTHLY_TREND,
    SUPPLIERS,
    portfolio_summary,
    supplier_to_dict,
)

router = APIRouter(prefix="/api/v1", tags=["integration-v1"])

DEMO_API_KEY = "greengru-demo-key"


def verify_integration_api_key(api_key: str = Query(..., description="Integration API key")) -> str:
    settings = get_settings()
    expected = settings.integration_api_key or DEMO_API_KEY
    if api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid or missing api_key")
    return api_key


class WebhookRegisterRequest(BaseModel):
    url: str
    events: list[str] = Field(
        default_factory=lambda: [
            "passport.verified",
            "emissions.updated",
            "supplier.grade_changed",
        ],
    )


class WebhookRegisterResponse(BaseModel):
    webhook_id: str
    url: str
    events: list[str]
    status: str = "active"


@router.get("/portfolio/summary")
async def get_portfolio_summary(_: str = Depends(verify_integration_api_key)):
    """Aggregate Scope 3 Category 10 totals across all onboarded downstream SMEs."""
    return portfolio_summary()


@router.get("/suppliers")
async def list_suppliers(
    verification_status: str | None = None,
    _: str = Depends(verify_integration_api_key),
):
    """List downstream suppliers with Scope 1+2 summary (read-only aggregate)."""
    rows = list(SUPPLIERS)
    if verification_status:
        rows = [s for s in rows if s.emissions.verification_status == verification_status]
    return {
        "count": len(rows),
        "suppliers": [supplier_to_dict(s) for s in rows],
    }


@router.get("/suppliers/{supplier_id}")
async def get_supplier(supplier_id: str, _: str = Depends(verify_integration_api_key)):
    """Single supplier profile + verified emissions breakdown."""
    match = next((s for s in SUPPLIERS if s.id == supplier_id), None)
    if match is None:
        raise HTTPException(status_code=404, detail=f"supplier {supplier_id} not found")
    return supplier_to_dict(match)


@router.get("/suppliers/{supplier_id}/emissions")
async def get_supplier_emissions(supplier_id: str, _: str = Depends(verify_integration_api_key)):
    """Scope 1 (direct) and Scope 2 (indirect) tCO2e for Baowu-sourced volume."""
    match = next((s for s in SUPPLIERS if s.id == supplier_id), None)
    if match is None:
        raise HTTPException(status_code=404, detail=f"supplier {supplier_id} not found")
    e = match.emissions
    return {
        "supplier_id": match.id,
        "company_name_en": match.company_name_en,
        "baowu_sourced_tonnes": match.baowu_sourced_tonnes,
        "scope1_tco2e": e.scope1_tco2e,
        "scope2_tco2e": e.scope2_tco2e,
        "scope1_plus_2_tco2e": e.scope1_plus_2_tco2e,
        "intensity_tco2e_per_tonne": e.intensity_tco2e_per_tonne,
        "production_route": e.production_route,
        "reporting_period": e.reporting_period,
        "verification_status": e.verification_status,
        "data_source": e.data_source,
        "feeds_scope3_category": 10,
        "citations": ["GHG Protocol Scope 3 Standard", "Reg (EU) 2023/956 (CBAM reference only)"],
    }


@router.get("/suppliers/{supplier_id}/passport")
async def get_supplier_passport(supplier_id: str, _: str = Depends(verify_integration_api_key)):
    """CBAM passport summary — tariff exposure only, no raw upload access."""
    match = next((s for s in SUPPLIERS if s.id == supplier_id), None)
    if match is None:
        raise HTTPException(status_code=404, detail=f"supplier {supplier_id} not found")
    return {
        "passport_id": match.passport_id,
        "supplier_id": match.id,
        "cn_code": match.cn_code,
        "cisa_grade": match.cisa_grade,
        "cbam_risk_tier": match.cbam_risk_tier,
        "annual_exposure_eur": match.annual_exposure_eur,
        "production_route": match.emissions.production_route,
        "intensity_tco2e_per_tonne": match.emissions.intensity_tco2e_per_tonne,
        "last_verified_at": match.last_verified_at,
        "note": "Aggregate read-only — raw invoices and installation files are not exposed via this API.",
    }


@router.get("/scope3/trend")
async def get_scope3_trend(_: str = Depends(verify_integration_api_key)):
    """Monthly verified Scope 3 Category 10 run-rate (tCO2e/yr annualized)."""
    return {
        "category": 10,
        "category_label": "Processing of sold products",
        "unit": "tCO2e/yr",
        "points": SCOPE3_MONTHLY_TREND,
    }


@router.post("/webhooks", response_model=WebhookRegisterResponse)
async def register_webhook(body: WebhookRegisterRequest, _: str = Depends(verify_integration_api_key)):
    """Register a webhook for passport verification and emissions update events."""
    return WebhookRegisterResponse(
        webhook_id="wh_demo_8f3a2c1b",
        url=body.url,
        events=body.events,
    )
