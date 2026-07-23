import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { parseApplicationFormPdf } from "@/lib/api";

/** Shared “Upload PDF → fill form” control for loan / grant application forms. */
export function ApplicationFormPdfUpload({
  route,
  isZh,
  onMapped,
}: {
  route: "loan" | "grant";
  isZh: boolean;
  onMapped: (form: unknown, meta: { convertMethod: string; sourceFile: string }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(false);
    setMsg(
      isZh
        ? `解析 PDF（PyMuPDF→表单）· ${file.name}`
        : `Parsing PDF (PyMuPDF→form) · ${file.name}`,
    );
    try {
      const result = await parseApplicationFormPdf({ file, route });
      onMapped(result.application_form, {
        convertMethod: result.convert_method,
        sourceFile: result.source_file || file.name,
      });
      setMsg(
        isZh
          ? `已映射：${result.source_file || file.name} · ${result.convert_method} · 可继续编辑`
          : `Mapped: ${result.source_file || file.name} · ${result.convert_method} · form stays editable`,
      );
    } catch (err) {
      setError(true);
      setMsg(err instanceof Error ? err.message : "PDF parse failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1.5 mb-1">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-primary/40 bg-primary/10 text-[11.5px] font-mono text-primary hover:brightness-110 disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {busy
          ? isZh
            ? "解析中…"
            : "Parsing…"
          : isZh
            ? "上传 PDF"
            : "Upload PDF"}
      </button>
      {msg ? (
        <p
          className={`text-[10.5px] font-mono leading-snug ${
            error ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground"
          }`}
        >
          {msg}
        </p>
      ) : (
        <p className="text-[10.5px] font-mono text-muted-foreground">
          {isZh
            ? "上传已填好的申请表 PDF，自动写入下方可编辑字段（PyMuPDF，失败则 pypdf）。"
            : "Upload a filled application PDF to populate the editable fields below (PyMuPDF → pypdf)."}
        </p>
      )}
    </div>
  );
}
