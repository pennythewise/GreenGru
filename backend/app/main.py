from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import init_db
from app.routers import advisory, baowu, calculate, classify, companies, copilot, documents, intake, iot, routes, score, submissions

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
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
app.include_router(classify.router)
app.include_router(calculate.router)
app.include_router(score.router)
app.include_router(documents.router)
app.include_router(advisory.router)
app.include_router(iot.router)
app.include_router(baowu.router)
app.include_router(copilot.router)
app.include_router(routes.router)


@app.get("/health")
async def health():
    copilot_key = settings.dashscope_copilot_api_key or settings.dashscope_api_key
    return {
        "status": "ok",
        "llm_mock_mode": settings.llm_mock_mode or not settings.dashscope_api_key,
        "copilot_mock_mode": settings.llm_mock_mode or not copilot_key,
        "copilot_model": settings.model_copilot,
        "chinese_ocr_url": settings.chinese_ocr_url,
        "supabase_configured": bool(settings.supabase_url and settings.supabase_service_role_key),
    }
