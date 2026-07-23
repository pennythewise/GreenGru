"""Central settings. Everything that varies between dev/demo and a real
deployment lives here, loaded from environment variables — never hardcoded
inline in a router or service module."""

from functools import lru_cache

from pydantic import AliasChoices, Field
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

    # --- LLM (OpenAI-compatible client → Qwen via OpenRouter) --------------
    # Prefer LLM_* env names. Legacy DASHSCOPE_* names still resolve.
    # Put a shared fallback key in LLM_API_KEY; optional per-role keys override.
    llm_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices("LLM_API_KEY", "DASHSCOPE_API_KEY"),
    )
    llm_base_url: str = Field(
        default="https://openrouter.ai/api/v1",
        validation_alias=AliasChoices("LLM_BASE_URL", "DASHSCOPE_BASE_URL"),
    )
    llm_copilot_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices("LLM_COPILOT_API_KEY", "DASHSCOPE_COPILOT_API_KEY"),
    )
    llm_classifier_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices("LLM_CLASSIFIER_API_KEY"),
    )
    llm_vision_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices(
            "LLM_VISION_API_KEY",
            "LLM_PDF_VISION_API_KEY",
            "LLM_INTAKE_VISION_API_KEY",
        ),
    )
    llm_embedding_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices("LLM_EMBEDDING_API_KEY"),
    )
    llm_writing_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices("LLM_WRITING_API_KEY"),
    )

    # Chat / vision agents (OpenRouter slugs)
    model_copilot: str = "qwen/qwen3.7-plus"
    # New Submission OCR fallback after PaddleOCR (also PDF VL for RAG)
    model_intake_vision: str = "qwen/qwen3-vl-235b-a22b-thinking"
    model_classifier: str = "qwen/qwen3.6-flash"
    # Single escalation retry (PRD §8.3) — Plus after Flash low-confidence
    model_classifier_escalation: str = "qwen/qwen3.7-plus"
    model_writing: str = "qwen/qwen3.7-plus"
    # Stage-1 RAG PDF → Markdown when MinerU unavailable
    model_pdf_vision: str = "qwen/qwen3-vl-235b-a22b-thinking"
    pdf_vl_max_pages: int = 20
    pdf_vl_dpi: int = 144
    pdf_vl_timeout_s: float = 180.0
    # RAG + intake PDF vectors (Matryoshka → 1024-d for pgvector)
    model_embedding: str = "qwen/qwen3-embedding-8b"
    embedding_dimensions: int = 1024

    # --- PaddleOCR (Stage-1 image OCR, in-process) -------------------------
    # lang='ch' = simplified Chinese + English (PP-OCR Chinese model).
    # Models auto-download on first request (~20s). Set enable_mkldnn=false on Windows CPU.
    paddleocr_enabled: bool = True
    paddleocr_lang: str = "ch"
    paddleocr_version: str = "PP-OCRv4"
    paddleocr_enable_mkldnn: bool = False
    paddleocr_timeout_s: float = 45.0
    # Qwen-VL OCR fallback for new-submission images (235B needs headroom)
    ocr_intake_timeout_s: float = 90.0
    # Temp dev flag — skip PaddleOCR + qwen vision on upload; mock templates only.
    ocr_mock_only: bool = False

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

    # --- Nuonuo (诺诺) invoice查验 — authorized 税务局 third-party proxy ----
    nuonuo_app_key: str | None = None
    nuonuo_app_secret: str | None = None
    nuonuo_access_token: str | None = None
    nuonuo_tax_num: str | None = None
    nuonuo_sandbox: bool = True

    @property
    def nuonuo_configured(self) -> bool:
        return bool(self.nuonuo_app_key and self.nuonuo_access_token and self.nuonuo_tax_num)

    # --- Baowu/Ansteel integration API (read-only Scope 3 feed) ------------
    integration_api_key: str | None = None  # defaults to greengru-demo-key in router

    def api_key_for(self, role: str = "default") -> str | None:
        """Resolve OpenRouter (or compatible) key for a role; fall back to LLM_API_KEY."""
        role = (role or "default").lower()
        dedicated = {
            "default": self.llm_api_key,
            "copilot": self.llm_copilot_api_key,
            "classifier": self.llm_classifier_api_key,
            # Escalation uses Plus — prefer writing/copilot, then classifier, then default
            "classifier_escalation": self.llm_writing_api_key
            or self.llm_copilot_api_key
            or self.llm_classifier_api_key,
            "vision": self.llm_vision_api_key,
            "pdf_vision": self.llm_vision_api_key,
            "intake_vision": self.llm_vision_api_key,
            "embedding": self.llm_embedding_api_key,
            "writing": self.llm_writing_api_key,
        }.get(role, None)
        return dedicated or self.llm_api_key


@lru_cache
def get_settings() -> Settings:
    return Settings()
