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

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
