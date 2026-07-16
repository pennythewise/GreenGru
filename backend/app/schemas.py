"""Pydantic request/response schemas for the API contract (PRD §7). Every
endpoint returns its stage's output plus a `sources` array citing which
regulatory constant was used (PRD §7 hard requirement)."""

from typing import Literal

from pydantic import BaseModel, Field


class SourceCitation(BaseModel):
    constant: str
    value: str
    citation: str


# --- Companies / products / submissions ------------------------------------


class CompanyCreate(BaseModel):
    name: str
    province: str | None = None
    contact_info: dict | None = None


class CompanyOut(BaseModel):
    id: str
    name: str
    province: str | None


class ProductCreate(BaseModel):
    company_id: str
    cn_code: str
    production_route: str | None = None  # None -> conservative BF-BOF default applied
    annual_export_tonnes: float = Field(ge=0)


class ProductOut(BaseModel):
    id: str
    company_id: str
    cn_code: str
    production_route: str
    annual_export_tonnes: float
    route_was_defaulted: bool = False


class SubmissionCreate(BaseModel):
    product_id: str
    source_type: str = "manual"  # "doc" | "iot" | "manual"


class SubmissionOut(BaseModel):
    id: str
    product_id: str
    status: str


class ProcessSubmissionRequest(BaseModel):
    """Convenience orchestrator input (PRD §4 — 'plain Python function calls
    in FastAPI route handlers, nothing more'; this just chains the same
    per-stage functions the granular endpoints use, in the fixed order the
    architecture already specifies)."""

    product_description: str
    year: int = 2026


# --- Intake ------------------------------------------------------------


class ManualIntakeRequest(BaseModel):
    submission_id: str
    production_volume_tonnes: float
    fuel_type: str | None = None
    cn_code_hint: str | None = None
    billing_period: str | None = None
    measured_intensity_tco2e_per_tonne: float | None = None


class IntakeRecordOut(BaseModel):
    id: str
    submission_id: str
    extracted_json: dict
    validator_status: str
    validator_notes: list[str]
    sources: list[SourceCitation] = []


class InvoicePartyOut(BaseModel):
    name: str
    taxId: str
    addressPhone: str
    bankAccount: str


class InvoiceLineItemOut(BaseModel):
    name: str
    spec: str
    unit: str
    qty: str
    unitPrice: str
    amount: str
    taxRate: str
    tax: str


class InvoiceDataOut(BaseModel):
    invoiceCode: str
    invoiceNumber: str
    issueDate: str
    buyer: InvoicePartyOut
    seller: InvoicePartyOut
    items: list[InvoiceLineItemOut]
    totalAmount: str
    totalTax: str
    totalWithTax: str
    payee: str
    reviewer: str
    issuer: str


class ClassificationPreviewOut(BaseModel):
    cnCode: str
    cnLabel: str
    flashConfidence: int
    escalated: bool
    plusConfidence: int | None = None
    route: str
    benchmark: str
    defaultIntensity: str


class PdfEmbeddingOut(BaseModel):
    embedded: bool
    chunk_count: int = 0
    storage: str = "none"
    file_hash: str | None = None
    reason: str | None = None


class OcrPreviewOut(BaseModel):
    invoice: InvoiceDataOut
    classification: ClassificationPreviewOut
    ocr_source: str
    ocr_text_preview: str
    mock_fields: list[str] = []
    production_volume_tonnes: float | None = None
    pdf_embedding: PdfEmbeddingOut | None = None
    sources: list[SourceCitation] = []


# --- Pipeline run (New Submission) -------------------------------------------


class PipelineRunRequest(BaseModel):
    invoice: InvoiceDataOut
    classification_route: str = "BF-BOF"
    production_volume_tonnes: float | None = None
    ocr_source: str = "mock"
    mock_fields: list[str] = []
    year: int = 2026


class PipelineStageDetailOut(BaseModel):
    n: int
    key: str
    zh: str
    status: str
    elapsed: str | None = None
    summary: str
    detail: dict


class PipelineRunResponse(BaseModel):
    stages: list[PipelineStageDetailOut]
    dashboard_snapshot: dict
    package: dict


# --- Classification ------------------------------------------------------------


class ClassifyRequest(BaseModel):
    submission_id: str
    product_description: str


class ClassifyResponse(BaseModel):
    cn_code: str
    confidence: float
    model_used: str
    escalated: bool
    requires_manual_confirmation: bool
    reason: str | None
    sources: list[SourceCitation] = []


# --- Calculation ------------------------------------------------------------


class CalculateRequest(BaseModel):
    submission_id: str
    year: int


class CalculationOut(BaseModel):
    id: str
    submission_id: str
    intensity_tco2e_per_tonne: float
    data_source: str
    benchmark_tco2e_per_tonne: float
    taxable_emissions_tco2e_per_tonne: float
    certificate_price_eur_per_tco2e: float
    certificate_price_quarter: str
    markup_applied: float
    phase_in_factor: float
    tariff_cost_eur_per_tonne: float
    gross_tariff_cost_eur_per_tonne: float
    annual_exposure_eur: float
    sources: list[SourceCitation] = []


# --- Scoring ------------------------------------------------------------


class ScoreRequest(BaseModel):
    calculation_id: str


class ScoreOut(BaseModel):
    id: str
    calculation_id: str
    cisa_grade: str
    cisa_grade_is_provisional: bool
    cbam_risk_tier: str
    gap_to_next_tier_tco2e: float | None
    de_minimis_possible: bool
    sources: list[SourceCitation] = []


# --- Documents ------------------------------------------------------------


class DocumentRequest(BaseModel):
    score_id: str


class DocumentOut(BaseModel):
    id: str
    submission_id: str
    doc_type: str
    language: str
    content_hash: str
    signature: str
    pdf_storage_path: str
    used_pdf_fallback_html: bool = False


# --- Advisory ------------------------------------------------------------


class AdvisoryRequest(BaseModel):
    score_id: str


class RankedAction(BaseModel):
    path_name: str
    path_name_cn: str
    estimated_cost_cny_low: float
    estimated_cost_cny_high: float | None
    closes_full_gap: bool


class AdvisoryOut(BaseModel):
    id: str
    score_id: str
    ranked_actions: list[RankedAction]
    plan_text: str


# --- Full submission state ------------------------------------------------------------


class SubmissionFullState(BaseModel):
    submission: SubmissionOut
    intake: IntakeRecordOut | None = None
    calculation: CalculationOut | None = None
    score: ScoreOut | None = None
    documents: list[DocumentOut] = []
    advisory: AdvisoryOut | None = None


# --- IoT (optional module) ------------------------------------------------------------


class IotReadingIngest(BaseModel):
    company_id: str
    reading_timestamp: str
    voltage: float | None = None
    current: float | None = None
    kwh: float = Field(ge=0)


# --- Baowu dashboard (stretch) ------------------------------------------------------------


class BaowuDashboardRow(BaseModel):
    cisa_grade: str
    cbam_risk_tier: str
    annual_exposure_eur: float


# --- Copilot chat ------------------------------------------------------------


class CopilotHistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class CopilotChatRequest(BaseModel):
    page: str
    message: str
    prompt_id: str | None = None
    history: list[CopilotHistoryMessage] = []


class CopilotChatResponse(BaseModel):
    reply: str
    model: str
    mock: bool = False


class RouteIntentRequest(BaseModel):
    history: list[CopilotHistoryMessage] = []


class RouteIntentResponse(BaseModel):
    loan: float
    grant: float
    passport: float
    reasons: dict[str, str]
    mock: bool = False


# --- Route preview PDF (MVP demo — frontend sends assembled state) ----------


class ChecklistItemPdf(BaseModel):
    name: str
    name_zh: str | None = None
    done: bool
    file_name: str | None = None


class PipelineStagePdf(BaseModel):
    n: int
    key: str
    zh: str
    method: str
    status: Literal["pending", "loading", "active", "done"]
    elapsed: str | None = None


class AdvisoryItemPdf(BaseModel):
    title: str
    impact: str
    why: str
    status: str


class KpiItemPdf(BaseModel):
    label: str
    value: str


class RoutePreviewPdfRequest(BaseModel):
    route: Literal["loan", "grant", "passport"]
    title: str
    title_zh: str | None = None
    subtitle: str
    subtitle_zh: str | None = None
    kb: str
    citations: str
    company_name: str
    company_id: str
    production_route: str
    score_label: str
    score_value: str
    score_grade: str
    gauge: int = Field(ge=0, le=100)
    status_label: str = "Submit-ready · 可提交"
    checklist: list[ChecklistItemPdf]
    pipeline_stages: list[PipelineStagePdf]
    gaps: list[str]
    advisory: list[AdvisoryItemPdf]
    kpis: list[KpiItemPdf] = []
    lang: str = "en"


class RoutePreviewPdfResponse(BaseModel):
    content_hash: str
    signature: str
    filename: str
    used_pdf_fallback_html: bool


class GrantChecklistItemIn(BaseModel):
    name: str
    done: bool = False
    file_name: str | None = None


class GrantScoreRequest(BaseModel):
    scrap_ratio_pct: float = 24.5
    green_electricity_pct: float = 45.0
    intensity_tco2e_per_t: float = 3.506
    metering_pct: float | None = None
    water_reuse_pct: float = 62.0
    solid_waste_util_pct: float = 72.0
    production_tonnes: float | None = None
    checklist: list[GrantChecklistItemIn] = []
    application_form: dict | None = None


class GrantScoreResponse(BaseModel):
    standard: str
    standard_zh: str
    guideline_doc: str
    total_score: float
    max_score: float
    qualified: bool
    veto_passed: bool
    veto_items: list[dict]
    dimensions: list[dict]
    tier_label: str
    tier_label_zh: str
    formulas: list[dict]
    summary_en: str
    summary_zh: str
