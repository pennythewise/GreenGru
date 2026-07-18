"""Route preview PDF generation — themed report from frontend-assembled state."""

from fastapi import APIRouter
from fastapi.responses import FileResponse

from app.schemas import (
    ApplicationFormPdfRequest,
    CbamScoreRequest,
    CbamScoreResponse,
    GrantScoreRequest,
    GrantScoreResponse,
    LoanScoreRequest,
    LoanScoreResponse,
    RoutePreviewPdfRequest,
    RoutePreviewPdfResponse,
)
from app.services.cbam_operator_scorer import (
    compute_cbam_operator_score,
    result_to_dict as cbam_result_to_dict,
)
from app.services.green_factory_scorer import compute_green_factory_score, result_to_dict
from app.services.loan_green_finance_scorer import (
    compute_loan_green_finance_score,
    result_to_dict as loan_result_to_dict,
)
from app.services.pdf_generator import render_filled_application_form_pdf, render_route_preview_pdf

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


@router.post("/cbam-score", response_model=CbamScoreResponse)
async def cbam_operator_readiness_score(payload: CbamScoreRequest):
    """Passport Stage 3 — EU CBAM installation-operator readiness (DG TAXUD guidance)."""
    result = compute_cbam_operator_score(
        cn_code=payload.cn_code,
        production_route=payload.production_route,
        intensity_tco2e_per_t=payload.intensity_tco2e_per_t,
        metering_pct=payload.metering_pct,
        scrap_ratio_pct=payload.scrap_ratio_pct,
        production_tonnes=payload.production_tonnes,
        checklist=[c.model_dump() for c in payload.checklist],
        process_matrix=payload.process_matrix,
        has_verifier=payload.has_verifier,
        has_certificates_ledger=payload.has_certificates_ledger,
    )
    return CbamScoreResponse(**cbam_result_to_dict(result))


@router.post("/loan-score", response_model=LoanScoreResponse)
async def loan_green_finance_score(payload: LoanScoreRequest):
    """Loan Stage 3 — GB/T 36132—2025 + 绿色金融支持项目目录（2025）deterministic score."""
    result = compute_loan_green_finance_score(
        scrap_ratio_pct=payload.scrap_ratio_pct,
        green_electricity_pct=payload.green_electricity_pct,
        intensity_tco2e_per_t=payload.intensity_tco2e_per_t,
        metering_pct=payload.metering_pct,
        checklist=[c.model_dump() for c in payload.checklist],
        application_form=payload.application_form,
    )
    return LoanScoreResponse(**loan_result_to_dict(result))


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


@router.post("/application-form-pdf/download")
async def download_filled_application_form_pdf(payload: ApplicationFormPdfRequest):
    """Download Grant/Loan application form PDF filled with user-edited fields."""
    generated = render_filled_application_form_pdf(
        route=payload.route,
        application_form=payload.application_form,
        score_summary=payload.score_summary,
    )
    if generated.used_pdf_fallback_html:
        media_type = "text/html"
        filename = (
            "GreenGru_Green_Factory_Grant_Application_Form.html"
            if payload.route == "grant"
            else "GreenGru_Green_Loan_Intake_Form.html"
        )
    else:
        media_type = "application/pdf"
        filename = (
            "GreenGru_Green_Factory_Grant_Application_Form.pdf"
            if payload.route == "grant"
            else "GreenGru_Green_Loan_Intake_Form.pdf"
        )
    return FileResponse(
        generated.storage_path,
        media_type=media_type,
        filename=filename,
        headers={
            "X-Content-Hash": generated.content_hash,
            "X-Signature": generated.signature,
        },
    )
