"""Route preview PDF generation — themed report from frontend-assembled state."""

from fastapi import APIRouter
from fastapi.responses import FileResponse

from app.schemas import RoutePreviewPdfRequest, RoutePreviewPdfResponse
from app.services.pdf_generator import render_route_preview_pdf

router = APIRouter(prefix="/api/routes", tags=["routes"])


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
