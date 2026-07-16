"""Central settings. Everything that varies between dev/demo and a real
deployment lives here, loaded from environment variables — never hardcoded
inline in a router or service module."""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- Database ----------------------------------------------------------
    # Defaults to a local SQLite file so the whole pipeline runs with zero
    # setup. Point this at a Supabase Postgres connection string
    # (postgresql+asyncpg://...) in production — the schema
    # (supabase/migrations/0001_init.sql) and the ORM models
    # (app/models_orm.py) are the same either way; Supabase *is* managed
    # Postgres, so nothing about the app code needs to change.
    database_url: str = "sqlite+aiosqlite:///./carbon_passport.db"

    # --- Supabase (Storage/Auth) — optional, only needed for file uploads
    # and real auth. The app runs without these (local filesystem storage,
    # no auth) for demo/dev purposes.
    supabase_url: str | None = None
    supabase_service_role_key: str | None = None

    # --- DashScope (Qwen via Alibaba Cloud Model Studio) --------------------
    # IMPORTANT: Beijing region — load-bearing for data sovereignty (PRD §10),
    # not a default to leave unset. The legacy fixed domain below is the
    # simplest correct choice for an MVP; the newer workspace-scoped domain
    # (https://{WorkspaceId}.cn-beijing.maas.aliyuncs.com/compatible-mode/v1)
    # offers better performance/stability and should be adopted once a
    # Model Studio workspace ID is provisioned — see README.
    dashscope_api_key: str | None = None
    dashscope_base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"

    # Copilot chat uses a dedicated key + model (sidebar + /entry chat).
    dashscope_copilot_api_key: str | None = None
    model_copilot: str = "qwen3.7-plus"

    model_intake_vision: str = "qwen3-vl-flash"
    model_classifier: str = "qwen-flash"
    model_classifier_escalation: str = "qwen-plus"
    model_writing: str = "qwen-plus"  # passport, financing report, advisory
    model_embedding: str = "text-embedding-v4"

    # --- chineseocr (optional Stage-0 / Stage-1 OCR service) ---------------
    # Run separately: clone https://github.com/chineseocr/chineseocr and
    # `python app.py 8080` — then point this at http://localhost:8080/ocr
    chinese_ocr_url: str | None = None
    chinese_ocr_timeout_s: float = 90.0

    # If no API key is configured, every agent call returns a deterministic,
    # clearly-labeled mock response instead of failing — this is what lets
    # the full pipeline run end-to-end (including PDF generation) without
    # any external dependency, per the project's "runnable with zero config"
    # goal. Real output quality obviously requires a real key.
    llm_mock_mode: bool = True

    # --- Stage-0 ModelScope pre-screen (PRD §4.2, §8.0) — optional,
    # feature-flagged, never on the critical path. Off by default because it
    # requires downloading multi-hundred-MB model weights on first use.
    enable_modelscope_prescreen: bool = False

    # --- CBAM certificate price — must be refreshed each quarter, never
    # hardcoded as permanent (PRD §6.2).
    cbam_certificate_price_eur: float = 75.36
    cbam_certificate_price_quarter: str = "Q1-2026"

    # --- Classifier confidence threshold (PRD §8.3) -------------------------
    classifier_confidence_threshold: float = 0.7

    # --- File storage --------------------------------------------------------
    local_storage_dir: str = "./storage"

    # --- CORS ------------------------------------------------------------
    frontend_origin: str = "http://localhost:3000,http://localhost:8080"

    # --- Document signing --------------------------------------------------
    # HMAC secret for signing generated documents (PRD §9.3 — hash+signature,
    # explicitly not blockchain). Change this in any real deployment.
    document_signing_secret: str = "dev-only-insecure-secret-change-me"

    # --- Baowu/Ansteel integration API (read-only Scope 3 feed) ------------
    integration_api_key: str | None = None  # defaults to greengru-demo-key in router


@lru_cache
def get_settings() -> Settings:
    return Settings()
