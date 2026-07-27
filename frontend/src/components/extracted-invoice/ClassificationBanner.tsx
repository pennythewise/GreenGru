import { ShieldCheck } from "lucide-react";

import type { ClassificationPreview } from "@/lib/api";
import { useLocale } from "@/lib/locale";
import { invoiceCard } from "@/lib/ui-strings";

export function ClassificationBanner({ classification }: { classification: ClassificationPreview }) {
  const { t } = useLocale();

  return (
    <div className="mt-3 rounded-lg border border-teal/30 bg-teal/[0.06] p-3">
      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.12em] text-teal">
        <ShieldCheck className="h-3.5 w-3.5" /> {t(invoiceCard.classified.en, invoiceCard.classified.zh)}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center px-2 py-1 rounded border border-teal/40 bg-teal/10 text-[12px] font-mono text-foreground">
          CN {classification.cnCode}
        </span>
        <span className="text-[11.5px] text-muted-foreground">{classification.cnLabel}</span>
      </div>
      <div className="mt-2 text-[11px] font-mono text-muted-foreground">
        qwen3.6-flash {classification.flashConfidence}%
        {classification.escalated && classification.plusConfidence != null && (
          <>
            {" "}
            · {t(invoiceCard.lowConfidence.en, invoiceCard.lowConfidence.zh)} qwen3.7-plus{" "}
            {classification.plusConfidence}%
          </>
        )}
      </div>
      <div className="mt-2 pt-2 border-t border-border/60 text-[11.5px]">
        <span className="text-muted-foreground">{t(invoiceCard.calcMethod.en, invoiceCard.calcMethod.zh)} </span>
        <span className="font-medium">{classification.route}</span>
        <span className="text-muted-foreground"> {t(invoiceCard.route.en, invoiceCard.route.zh)} · </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {classification.benchmark} · {classification.defaultIntensity}
        </span>
      </div>
    </div>
  );
}
