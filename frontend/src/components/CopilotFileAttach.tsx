import { useCallback, useRef, useState } from "react";
import { Loader2, Paperclip } from "lucide-react";
import { previewOcr, type OcrPreviewResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

export function formatOcrUploadSummary(file: File, result: OcrPreviewResponse): string {
  const inv = result.invoice;
  const lines = [
    `OCR complete · ${file.name}`,
    `Seller / 销售方: ${inv.seller.name || "—"}`,
    `Invoice / 发票: ${inv.invoiceCode || "—"} ${inv.invoiceNumber || ""}`.trim(),
    `CN code: ${result.classification.cnCode} — ${result.classification.cnLabel}`,
    `Production volume: ${result.production_volume_tonnes != null ? `${result.production_volume_tonnes.toLocaleString()} t` : "—"}`,
    `OCR engine: ${result.ocr_source}`,
  ];
  if (result.mock_fields.length > 0) {
    lines.push(`Mock-filled fields: ${result.mock_fields.join(", ")}`);
  }
  return lines.join("\n");
}

type CopilotFileAttachProps = {
  disabled?: boolean;
  onUploaded: (file: File, result: OcrPreviewResponse) => void;
  onError: (message: string) => void;
  className?: string;
};

export function CopilotFileAttach({ disabled, onUploaded, onError, className }: CopilotFileAttachProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (list: FileList | null | undefined) => {
      const file = list?.[0];
      if (!file || uploading || disabled) return;
      setUploading(true);
      try {
        const result = await previewOcr(file);
        onUploaded(file, result);
      } catch (err) {
        onError(err instanceof Error ? err.message : "OCR upload failed");
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [disabled, onUploaded, onError, uploading],
  );

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => fileRef.current?.click()}
        aria-label="Upload invoice"
        className={cn(
          "inline-flex items-center justify-center shrink-0 rounded-md p-1 transition",
          "text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-40",
          className,
        )}
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
      </button>
    </>
  );
}
