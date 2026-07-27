import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";

import type { ExtractionVerification } from "@/lib/api";
import { useLocale } from "@/lib/locale";
import { invoiceCard } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

export function VerificationPanel({
  verification,
  busy,
}: {
  verification: ExtractionVerification | null;
  busy?: boolean;
}) {
  const { t, isZh } = useLocale();
  if (busy) {
    return (
      <div className="mt-3 rounded-lg border border-border bg-surface/40 p-3 flex items-center gap-2 text-[12px] text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {t(invoiceCard.verifyReRunning.en, invoiceCard.verifyReRunning.zh)}
      </div>
    );
  }
  if (!verification) return null;

  const tone =
    verification.status === "pass"
      ? "border-carbon/35 bg-carbon/[0.07] text-carbon"
      : verification.status === "fail"
        ? "border-danger/40 bg-danger/[0.08] text-danger"
        : "border-warning/40 bg-warning/[0.08] text-warning";
  const label =
    verification.status === "pass"
      ? t(invoiceCard.verifyPass.en, invoiceCard.verifyPass.zh)
      : verification.status === "fail"
        ? t(invoiceCard.verifyFail.en, invoiceCard.verifyFail.zh)
        : t(invoiceCard.verifyWarn.en, invoiceCard.verifyWarn.zh);
  const Icon =
    verification.status === "pass" ? CheckCircle2 : verification.status === "fail" ? X : AlertTriangle;

  const issues = verification.checks.filter((c) => c.status !== "pass");

  return (
    <div className={cn("mt-3 rounded-lg border p-3", tone)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.12em]">
          <Icon className="h-3.5 w-3.5" />
          {t(invoiceCard.verifyTitle.en, invoiceCard.verifyTitle.zh)} · {label}
        </div>
        <span className="text-[11px] font-mono tabular-nums">{verification.score_pct}%</span>
      </div>
      <p className="mt-1.5 text-[12px] leading-relaxed text-foreground/90">
        {isZh ? verification.summary_zh : verification.summary_en}
      </p>
      <p className="mt-1 text-[10.5px] text-muted-foreground">
        {t(invoiceCard.verifyHint.en, invoiceCard.verifyHint.zh)}
      </p>
      {issues.length > 0 && (
        <ul className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
          {issues.map((c) => (
            <li key={c.id} className="text-[11.5px] leading-snug flex gap-1.5">
              <span className="font-mono shrink-0 uppercase opacity-80">{c.status}</span>
              <span>
                {isZh ? c.message_zh : c.message_en}
                {c.expected != null && c.actual != null && (
                  <span className="font-mono text-muted-foreground">
                    {" "}
                    (exp {c.expected} · got {c.actual})
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
