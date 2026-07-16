from fastapi import APIRouter

from app.schemas import PipelineRunRequest, PipelineRunResponse, PipelineStageDetailOut
from app.services.pipeline_run import run_pipeline_from_preview

router = APIRouter(prefix="/api", tags=["pipeline"])


@router.post("/pipeline/run", response_model=PipelineRunResponse)
async def pipeline_run(payload: PipelineRunRequest):
    """Run stages 1–5 for New Submission from OCR preview data.
    Stage 6 returns a SHA-256 + HMAC package awaiting operator authorize."""
    invoice_dict = payload.invoice.model_dump()
    result = await run_pipeline_from_preview(
        invoice=invoice_dict,
        classification_route=payload.classification_route,
        production_volume_tonnes=payload.production_volume_tonnes,
        ocr_source=payload.ocr_source,
        mock_fields=payload.mock_fields,
        year=payload.year,
    )
    return PipelineRunResponse(
        stages=[PipelineStageDetailOut(**s) for s in result["stages"]],
        dashboard_snapshot=result["dashboard_snapshot"],
        package=result["package"],
    )
