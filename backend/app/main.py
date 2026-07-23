from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import init_db
from app.routers import advisory, baowu, calculate, classify, companies, copilot, documents, intake, integration_v1, iot, ocr, pipeline, rag, routes, score, submissions

settings = get_settings()


def _configure_app_logging() -> None:
    """Make ``app.*`` INFO logs visible next to uvicorn access lines."""
    app_log = logging.getLogger("app")
    app_log.setLevel(logging.INFO)
    if not any(isinstance(h, logging.StreamHandler) for h in app_log.handlers):
        handler = logging.StreamHandler()
        handler.setLevel(logging.INFO)
        handler.setFormatter(logging.Formatter("%(levelname)s:%(name)s:%(message)s"))
        app_log.addHandler(handler)
    app_log.propagate = False  # avoid double-print if root also has handlers


@asynccontextmanager
async def lifespan(app: FastAPI):
    _configure_app_logging()
    await init_db()
    yield


app = FastAPI(title="Carbon Passport API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.frontend_origin.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(companies.router)
app.include_router(submissions.router)
app.include_router(intake.router)
app.include_router(pipeline.router)
app.include_router(ocr.router, prefix="/ocr", tags=["OCR"])
app.include_router(classify.router)
app.include_router(calculate.router)
app.include_router(score.router)
app.include_router(documents.router)
app.include_router(advisory.router)
app.include_router(iot.router)
app.include_router(baowu.router)
app.include_router(copilot.router)
app.include_router(routes.router)
app.include_router(integration_v1.router)
app.include_router(rag.router)


@app.get("/health")
async def health():
    copilot_key = settings.api_key_for("copilot")
    return {
        "status": "ok",
        "llm_mock_mode": settings.llm_mock_mode or not settings.api_key_for("default"),
        "copilot_mock_mode": settings.llm_mock_mode or not copilot_key,
        "copilot_model": settings.model_copilot,
        "classifier_model": settings.model_classifier,
        "classifier_escalation_model": settings.model_classifier_escalation,
        "writing_model": settings.model_writing,
        "intake_vision_model": settings.model_intake_vision,
        "pdf_vision_model": settings.model_pdf_vision,
        "embedding_model": settings.model_embedding,
        "ocr_mock_only": settings.ocr_mock_only,
        "paddleocr_enabled": settings.paddleocr_enabled,
        "paddleocr_lang": settings.paddleocr_lang,
        "paddleocr_version": settings.paddleocr_version,
        "supabase_configured": bool(settings.supabase_url and settings.supabase_service_role_key),
        "keys_configured": {
            "default": bool(settings.llm_api_key),
            "copilot": bool(settings.llm_copilot_api_key),
            "classifier": bool(settings.llm_classifier_api_key),
            "vision": bool(settings.llm_vision_api_key),
            "embedding": bool(settings.llm_embedding_api_key),
            "writing": bool(settings.llm_writing_api_key),
        },
    }
