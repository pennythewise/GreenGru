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
