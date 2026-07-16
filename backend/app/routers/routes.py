"""Route preview PDF generation — themed report from frontend-assembled state."""

from fastapi import APIRouter
from fastapi.responses import FileResponse

from app.schemas import GrantScoreRequest, GrantScoreResponse, RoutePreviewPdfRequest, RoutePreviewPdfResponse
from app.services.green_factory_scorer import compute_green_factory_score, result_to_dict
from app.services.pdf_generator import render_route_preview_pdf

router = APIRouter(prefix="/api/routes", tags=["routes"])


@router.post("/grant-score", response_model=GrantScoreResponse)
async def grant_green_factory_score(payload: GrantScoreRequest):
    """Section B Stage 3 — GB/T 36132—2025 deterministic green factory score."""
    se = None
    if payload.application_form:
        se = payload.application_form.get("indicator_scoring_self_evaluation")
    result = compute_green_factory_score(
        scrap_ratio_pct=payload.scrap_ratio_pct,
        green_electricity_pct=payload.green_electricity_pct,
        intensity_tco2e_per_t=payload.intensity_tco2e_per_t,
        metering_pct=payload.metering_pct,
        water_reuse_pct=payload.water_reuse_pct,
        solid_waste_util_pct=payload.solid_waste_util_pct,
        production_tonnes=payload.production_tonnes,
        checklist=[c.model_dump() for c in payload.checklist],
        application_form=payload.application_form,
        self_evaluation=se,
    )
    return GrantScoreResponse(**result_to_dict(result))


@router.post("/preview-pdf", response_model=RoutePreviewPdfResponse)
async def generate_route_preview_pdf(payload: RoutePreviewPdfRequest):
    """Generate a themed PDF (or HTML fallback) for the route preview page."""
    generated = render_route_preview_pdf(
        payload=payload.model_dump(),
        route=payload.route,
    )
    ext = ".html" if generated.used_pdf_fallback_html else ".pdf"
    filename = f"GreenGru-{payload.route}-preview{ext}"
    return RoutePreviewPdfResponse(
        content_hash=generated.content_hash,
        signature=generated.signature,
        filename=filename,
        used_pdf_fallback_html=generated.used_pdf_fallback_html,
    )


@router.post("/preview-pdf/download")
async def download_route_preview_pdf(payload: RoutePreviewPdfRequest):
    """Generate and immediately return the PDF/HTML file for download."""
    generated = render_route_preview_pdf(
        payload=payload.model_dump(),
        route=payload.route,
    )
    if generated.used_pdf_fallback_html:
        media_type = "text/html"
        filename = f"GreenGru-{payload.route}-preview.html"
    else:
        media_type = "application/pdf"
        filename = f"GreenGru-{payload.route}-preview.pdf"
    return FileResponse(
        generated.storage_path,
        media_type=media_type,
        filename=filename,
        headers={
            "X-Content-Hash": generated.content_hash,
            "X-Signature": generated.signature,
        },
    )
