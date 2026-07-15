import * as XLSX from "xlsx";
import excelCells from "@/lib/cbam-excel-cells.json";

export const TEMPLATE_URL = "/templates/CBAM-communication-template.xlsx";
export const TEMPLATE_FILENAME = "CBAM-communication-template_en_20241213.xlsx";

type CellRef = { sheet: string; cell: string };

const FIELD_CELLS = excelCells as Record<string, CellRef>;

/** Keys we read/write on the EU template (A_InstData + Summary_Products). */
export const EXCEL_FIELD_KEYS = Object.keys(FIELD_CELLS);

function setCell(ws: XLSX.WorkSheet, addr: string, value: string) {
  if (!value) return;
  ws[addr] = { t: "s", v: value };
}

export async function fetchTemplateArrayBuffer(): Promise<ArrayBuffer> {
  const res = await fetch(TEMPLATE_URL);
  if (!res.ok) throw new Error("Template not found — place file in public/templates/");
  return res.arrayBuffer();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Download blank EU Commission template. */
export async function downloadBlankTemplate() {
  const buf = await fetchTemplateArrayBuffer();
  downloadBlob(
    new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    TEMPLATE_FILENAME,
  );
}

/** Export workbook with current field values written to mapped cells. */
export async function exportFilledWorkbook(values: Record<string, string>) {
  const buf = await fetchTemplateArrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });

  for (const [key, ref] of Object.entries(FIELD_CELLS)) {
    const val = values[key];
    if (!val) continue;
    const ws = wb.Sheets[ref.sheet];
    if (!ws) continue;
    setCell(ws, ref.cell, val);
  }

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  downloadBlob(
    new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `CBAM-filled-${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}

/** Import field values from uploaded EU template (.xlsx). */
export async function importWorkbookFile(file: File): Promise<Record<string, string>> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true, raw: false });
  const imported: Record<string, string> = {};

  for (const [key, ref] of Object.entries(FIELD_CELLS)) {
    const ws = wb.Sheets[ref.sheet];
    if (!ws) continue;
    const cell = ws[ref.cell];
    if (!cell || cell.v == null || cell.v === "") continue;
    const v = cell.v instanceof Date ? cell.v.toISOString().slice(0, 10) : String(cell.v).trim();
    if (v) imported[key] = v;
  }

  return imported;
}
