// In dev, use same-origin requests (Vite proxies /api → backend :8000).
// In production, set VITE_API_URL to your deployed backend URL.
const API_BASE = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_URL ?? "http://localhost:8000");

export type InvoiceParty = {
  name: string;
  taxId: string;
  addressPhone: string;
  bankAccount: string;
};

export type InvoiceLineItem = {
  name: string;
  spec: string;
  unit: string;
  qty: string;
  unitPrice: string;
  amount: string;
  taxRate: string;
  tax: string;
};

export type InvoiceData = {
  invoiceCode: string;
  invoiceNumber: string;
  issueDate: string;
  buyer: InvoiceParty;
  seller: InvoiceParty;
  items: InvoiceLineItem[];
  totalAmount: string;
  totalTax: string;
  totalWithTax: string;
  payee: string;
  reviewer: string;
  issuer: string;
};

export type ClassificationPreview = {
  cnCode: string;
  cnLabel: string;
  flashConfidence: number;
  escalated: boolean;
  plusConfidence: number | null;
  route: string;
  benchmark: string;
  defaultIntensity: string;
};

export type PdfEmbeddingInfo = {
  embedded: boolean;
  chunk_count: number;
  storage: string;
  file_hash: string | null;
  reason: string | null;
};

export type OcrPreviewResponse = {
  invoice: InvoiceData;
  classification: ClassificationPreview;
  ocr_source: string;
  ocr_text_preview: string;
  mock_fields: string[];
  production_volume_tonnes: number | null;
  pdf_embedding: PdfEmbeddingInfo | null;
  sources: { constant: string; value: string; citation: string }[];
};

export async function previewOcr(file: File): Promise<OcrPreviewResponse> {
  const form = new FormData();
  form.append("file", file);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/intake/ocr-preview`, {
      method: "POST",
      body: form,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      throw new Error(
        "Cannot reach backend. Start it: cd backend && python -m uvicorn app.main:app --reload --port 8000",
      );
    }
    throw err;
  }

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `OCR preview failed (${res.status})`);
  }

  return res.json() as Promise<OcrPreviewResponse>;
}

export type PipelineStageDetail = {
  n: number;
  key: string;
  zh: string;
  status: string;
  elapsed: string | null;
  summary: string;
  detail: Record<string, unknown>;
};

export type PipelineRunResponse = {
  stages: PipelineStageDetail[];
  dashboard_snapshot: {
    tierGauge: { value: number; nextTier: string; zh: string; pointsToNext?: number };
    ratioSliders: { key: string; label: string; zh: string; value: number; target: number; unit: string }[];
    emissionsBreakdown: { key: string; label: string; value: number; color: string }[];
    processMatrix: {
      stage: string;
      zh: string;
      energy: string;
      intensity: string;
      metering: string;
      audit: string;
    }[];
    cisaGrade?: string;
    intensity?: number;
    updatedAt?: string;
  };
  package: {
    body: Record<string, unknown>;
    content_hash: string;
    signature: string;
  };
};

export async function runPipeline(payload: {
  invoice: InvoiceData;
  classification_route: string;
  production_volume_tonnes: number | null;
  ocr_source: string;
  mock_fields: string[];
  iot_snapshot_id?: string | null;
}): Promise<PipelineRunResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/pipeline/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      throw new Error("Cannot reach backend pipeline. Start backend on :8000.");
    }
    throw err;
  }
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Pipeline failed (${res.status})`);
  }
  return res.json() as Promise<PipelineRunResponse>;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export type CopilotHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export type CopilotChatResponse = {
  reply: string;
  model: string;
  mock: boolean;
};

export async function sendCopilotChat(params: {
  page: string;
  message: string;
  promptId?: string | null;
  history?: CopilotHistoryMessage[];
}): Promise<CopilotChatResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/copilot/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: params.page,
        message: params.message,
        prompt_id: params.promptId ?? null,
        history: params.history ?? [],
      }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      throw new Error(
        "Cannot reach backend. Start it: cd backend && python -m uvicorn app.main:app --reload --port 8000",
      );
    }
    throw err;
  }

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Copilot chat failed (${res.status})`);
  }

  return res.json() as Promise<CopilotChatResponse>;
}

export type RouteIntentResponse = {
  loan: number;
  grant: number;
  passport: number;
  reasons: Record<string, string>;
  mock: boolean;
};

export async function sendRouteIntent(history: CopilotHistoryMessage[]): Promise<RouteIntentResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/copilot/route-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      throw new Error("Cannot reach backend for route intent.");
    }
    throw err;
  }

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Route intent failed (${res.status})`);
  }

  return res.json() as Promise<RouteIntentResponse>;
}

export type RoutePreviewPdfPayload = {
  route: "loan" | "grant" | "passport";
  title: string;
  title_zh?: string | null;
  subtitle: string;
  subtitle_zh?: string | null;
  kb: string;
  citations: string;
  company_name: string;
  company_id: string;
  production_route: string;
  score_label: string;
  score_value: string;
  score_grade: string;
  gauge: number;
  status_label?: string;
  checklist: { name: string; name_zh?: string | null; done: boolean; file_name?: string | null }[];
  pipeline_stages: {
    n: number;
    key: string;
    zh: string;
    method: string;
    status: "pending" | "loading" | "active" | "done";
    elapsed?: string | null;
  }[];
  gaps: string[];
  advisory: { title: string; impact: string; why: string; status: string }[];
  kpis?: { label: string; value: string }[];
  lang?: string;
};

export type GrantScoreResult = {
  standard: string;
  standard_zh: string;
  guideline_doc: string;
  total_score: number;
  max_score: number;
  qualified: boolean;
  veto_passed: boolean;
  veto_items: { key: string; label_en: string; label_zh: string; passed: boolean; source: string }[];
  dimensions: {
    key: string;
    name_en: string;
    name_zh: string;
    weight_pct: number;
    score: number;
    max_score: number;
    indicators: {
      seq: number;
      name_en: string;
      name_zh: string;
      indicator_type: string;
      unit: string;
      weight_points: number;
      score: number;
      actual: number | string | null;
      leading: number | string | null;
      benchmark: number | string | null;
      formula_ref: string | null;
      data_source: string;
      explanation_en: string;
      explanation_zh: string;
    }[];
  }[];
  tier_label: string;
  tier_label_zh: string;
  formulas: { eq: string; label: string; latex: string; values: Record<string, unknown>; result: number }[];
  summary_en: string;
  summary_zh: string;
};

export async function runGrantScore(payload: {
  scrap_ratio_pct: number;
  green_electricity_pct: number;
  intensity_tco2e_per_t: number;
  metering_pct: number | null;
  water_reuse_pct: number;
  solid_waste_util_pct: number;
  production_tonnes: number | null;
  checklist: { name: string; done: boolean; file_name?: string | null }[];
  application_form: unknown;
}): Promise<GrantScoreResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/routes/grant-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      throw new Error("Cannot reach backend grant scorer. Start backend on :8000.");
    }
    throw err;
  }
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Grant score failed (${res.status})`);
  }
  return res.json() as Promise<GrantScoreResult>;
}

export type LoanScoreResult = GrantScoreResult;

export type CbamTariffEstimate = {
  certificate_price_eur_per_tco2e: number;
  certificate_price_quarter: string;
  intensity_tco2e_per_tonne: number;
  benchmark_tco2e_per_tonne: number;
  taxable_emissions_tco2e_per_tonne: number;
  phase_in_factor: number;
  markup_applied: number;
  data_source: string;
  path_label: string;
  path_label_zh: string;
  tariff_eur_per_tonne: number;
  gross_tariff_eur_per_tonne: number;
  annual_exposure_eur: number;
  export_tonnes: number;
  formula_en: string;
  formula_zh: string;
};

export type CbamExportMargin = {
  fob_eur_per_tonne: number;
  margin_pct_before_cbam: number;
  margin_eur_per_tonne_before: number;
  tariff_if_approved_eur_per_tonne: number;
  margin_eur_after_approved: number;
  margin_pct_after_approved: number;
  tariff_if_denied_eur_per_tonne: number;
  margin_eur_after_denied: number;
  margin_pct_after_denied: number;
  margin_saved_by_approval_eur_per_tonne: number;
  cost_pct_of_fob_if_approved: number;
  cost_pct_of_fob_if_denied: number;
  note_en: string;
  note_zh: string;
};

/** Literature-baseline industry €/t for Stage-3 UX (not φ-regulated passport invoice). */
export type CbamIndustryIllustration = {
  baseline_key: string;
  baseline_label_en: string;
  baseline_label_zh: string;
  cn_code: string;
  has_lifecycle_transparency: boolean;
  default_see_tco2e_per_t: number;
  approved_see_tco2e_per_t: number;
  see_source: string;
  benchmark_tco2e_per_t: number;
  free_allocation_pct: number;
  carbon_price_eur: number;
  default_path_eur_per_tonne: number;
  approved_path_eur_per_tonne: number;
  discount_eur_per_tonne: number;
  discount_pct: number;
  cost_pct_of_fob_default: number;
  cost_pct_of_fob_approved: number;
  regulated_approved_eur_per_tonne: number;
  regulated_denied_eur_per_tonne: number;
  note_en: string;
  note_zh: string;
};

/** Passport Stage-3 — readiness + approve/deny likelihood + € tariff scenarios. */
export type CbamScoreResult = GrantScoreResult & {
  approval_likelihood_pct: number;
  deny_likelihood_pct: number;
  outcome_label: string;
  outcome_label_zh: string;
  tariff: CbamTariffEstimate;
  tariff_if_approved: CbamTariffEstimate;
  tariff_if_denied: CbamTariffEstimate;
  export_margin: CbamExportMargin;
  industry_illustration: CbamIndustryIllustration;
};

export async function runLoanScore(payload: {
  scrap_ratio_pct: number;
  green_electricity_pct: number;
  intensity_tco2e_per_t: number;
  metering_pct: number | null;
  checklist: { name: string; done: boolean; file_name?: string | null }[];
  application_form: unknown;
}): Promise<LoanScoreResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/routes/loan-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      throw new Error("Cannot reach backend loan scorer. Start backend on :8000.");
    }
    throw err;
  }
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Loan score failed (${res.status})`);
  }
  return res.json() as Promise<LoanScoreResult>;
}

export async function runCbamScore(payload: {
  cn_code: string | null;
  production_route: string;
  intensity_tco2e_per_t: number;
  metering_pct: number | null;
  scrap_ratio_pct: number;
  production_tonnes: number | null;
  checklist: { name: string; done: boolean; file_name?: string | null }[];
  process_matrix: unknown[];
}): Promise<CbamScoreResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/routes/cbam-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      throw new Error("Cannot reach backend CBAM scorer. Start backend on :8000.");
    }
    throw err;
  }
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `CBAM score failed (${res.status})`);
  }
  const raw = (await res.json()) as CbamScoreResult;
  const { withIndustryIllustration } = await import("@/lib/cbam-industry-mock");
  return withIndustryIllustration(raw);
}

export async function fetchLatestIotReading(
  companyId = "demo-hengfeng",
): Promise<IotReading | null> {
  let res: Response;
  try {
    res = await fetch(
      `${API_BASE}/api/iot/latest?company_id=${encodeURIComponent(companyId)}`,
    );
  } catch {
    return null;
  }
  if (res.status === 204 || res.status === 404) return null;
  if (!res.ok) return null;
  const data = await res.json();
  if (data == null) return null;
  return data as IotReading;
}

export async function fetchIotHistory(
  companyId = "demo-hengfeng",
  limit = 48,
): Promise<IotReading[]> {
  let res: Response;
  try {
    res = await fetch(
      `${API_BASE}/api/iot/history?company_id=${encodeURIComponent(companyId)}&limit=${limit}`,
    );
  } catch {
    return [];
  }
  if (!res.ok) return [];
  return (await res.json()) as IotReading[];
}

export type IotReading = {
  id: string;
  company_id: string;
  reading_timestamp: string;
  voltage: number | null;
  current: number | null;
  power_w: number | null;
  kwh: number;
  ingested_at: string;
};

export type IotSnapshot = {
  id: string;
  company_id: string;
  window_minutes: number;
  green_trading: string;
  emission_factor_t_per_mwh: number;
  window_start: string;
  window_end: string;
  sample_count: number;
  kwh_start: number;
  kwh_end: number;
  delta_kwh: number;
  avg_power_w: number | null;
  tco2e: number;
  submission_id: string | null;
  created_at: string;
  note_en: string;
  note_zh: string;
};

export async function createIotSnapshot(payload: {
  company_id?: string;
  window_minutes: 10 | 30 | 60;
  green_trading: "yes" | "no";
}): Promise<IotSnapshot> {
  const res = await fetch(`${API_BASE}/api/iot/snapshot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      company_id: payload.company_id ?? "demo-hengfeng",
      window_minutes: payload.window_minutes,
      green_trading: payload.green_trading,
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Save IoT window failed (${res.status})`);
  }
  return res.json() as Promise<IotSnapshot>;
}

export async function downloadApplicationFormPdf(payload: {
  route: "loan" | "grant";
  application_form: unknown;
  score_summary?: string | null;
}): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/routes/application-form-pdf/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      throw new Error(
        "Cannot reach backend. Start it: cd backend && python -m uvicorn app.main:app --reload --port 8000",
      );
    }
    throw err;
  }
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Application form PDF failed (${res.status})`);
  }
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const filename =
    match?.[1] ??
    (payload.route === "grant"
      ? "GreenGru_Green_Factory_Grant_Application_Form.pdf"
      : "GreenGru_Green_Loan_Intake_Form.pdf");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadCbamCommunicationXlsx(
  workbookValues: Record<string, string>,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/routes/cbam-communication-xlsx/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workbook_values: workbookValues }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      throw new Error(
        "Cannot reach backend. Start it: cd backend && python -m uvicorn app.main:app --reload --port 8000",
      );
    }
    throw err;
  }
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `CBAM Excel download failed (${res.status})`);
  }
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? "CBAM_Communication_template_filled.xlsx";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadRoutePreviewPdf(payload: RoutePreviewPdfPayload): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/routes/preview-pdf/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      throw new Error(
        "Cannot reach backend. Start it: cd backend && python -m uvicorn app.main:app --reload --port 8000",
      );
    }
    throw err;
  }

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `PDF download failed (${res.status})`);
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? `GreenGru-${payload.route}-preview.pdf`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
