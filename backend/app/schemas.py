"""Pydantic request/response schemas for the API contract (PRD §7). Every
endpoint returns its stage's output plus a `sources` array citing which
regulatory constant was used (PRD §7 hard requirement)."""

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
