import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, FunctionSquare } from "lucide-react";

import { useLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

type FormulaRow = {
  eq?: string;
  label: string;
  latex: string;
  values?: Record<string, number | string>;
  result?: number | string;
};

export type StageDetail = {
  n: number;
  key: string;
  zh: string;
  status: string;
  elapsed: string | null;
  summary: string;
  detail: Record<string, unknown>;
};

function AnimatedFormula({ f, delay }: { f: FormulaRow; delay: number }) {
  const entries = f.values ? Object.entries(f.values) : [];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-md border border-border bg-surface/50 p-2.5 space-y-1.5"
    >
      <div className="flex items-center gap-2 text-[10px] font-mono text-teal">
        <FunctionSquare className="h-3 w-3" />
        {f.eq && <span>式 {f.eq}</span>}
        <span className="text-muted-foreground">· {f.label}</span>
      </div>
      <div className="text-[11.5px] font-mono text-primary/90 tracking-tight">{f.latex}</div>
      {entries.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10.5px] font-mono text-muted-foreground">
          {entries.map(([k, v]) => (
            <span key={k}>
              {k}=<span className="text-foreground">{typeof v === "number" ? v.toLocaleString() : v}</span>
            </span>
          ))}
        </div>
      )}
      {f.result !== undefined && (
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: delay + 0.15, type: "spring", stiffness: 260 }}
          className="text-[12px] font-mono font-medium text-carbon"
        >
          → {typeof f.result === "number" ? f.result.toLocaleString(undefined, { maximumFractionDigits: 4 }) : f.result}
        </motion.div>
      )}
    </motion.div>
  );
}

function DetailBlock({ stage }: { stage: StageDetail }) {
  const d = stage.detail;
  const formulas = (d.formulas as FormulaRow[] | undefined) ?? [];
  const cisaFormulas = (d.cisa_formulas as FormulaRow[] | undefined) ?? [];
  const allFormulas = [...formulas, ...cisaFormulas];

  return (
    <div className="mt-2 space-y-2 text-[11px]">
      {stage.n === 1 && (
        <div className="rounded-md border border-warning/30 bg-warning/[0.06] p-2 text-muted-foreground">
          OCR: <span className="text-foreground font-mono">{String(d.ocr_source ?? "—")}</span>
          {Array.isArray(d.mock_fields) && (d.mock_fields as string[]).length > 0 && (
            <div className="mt-1">Mock-filled: {(d.mock_fields as string[]).join(", ")}</div>
          )}
        </div>
      )}
      {stage.n === 2 && (
        <div className="space-y-1 font-mono text-muted-foreground">
          <div>API: <span className="text-teal">{String(d.api_method ?? "nuonuo.OpeMplatform.invoiceInspection")}</span></div>
          <div>Status: <span className="text-foreground">{String(d.invoice_status ?? "—")}</span> · mock={String(d.mock)}</div>
          {Array.isArray(d.checks) && (
            <div className="flex flex-wrap gap-1 mt-1">
              {(d.checks as string[]).map((c) => (
                <span key={c} className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px]">{c}</span>
              ))}
            </div>
          )}
        </div>
      )}
      {stage.n === 3 && (
        <div className="font-mono text-muted-foreground space-y-0.5">
          <div>CN <span className="text-foreground">{String(d.cn_code)}</span> · {(Number(d.confidence) * 100).toFixed(0)}%</div>
          <div>Model: <span className="text-primary">{String(d.model_used)}</span>{d.escalated ? " · escalated" : ""}</div>
        </div>
      )}
      {stage.n === 5 && d.dashboard_snapshot != null && (
        <div className="text-muted-foreground">
          Committed: tier gauge, grant levers, emissions split, process matrix →{" "}
          <span className="text-carbon">Dashboard</span>
        </div>
      )}
      {stage.n === 6 && d.content_hash != null && (
        <div className="rounded-md border border-border bg-surface/40 p-2 font-mono text-[10px] break-all space-y-1">
          <div className="text-muted-foreground">{String(d.signing_method)}</div>
          <div><span className="text-muted-foreground">SHA-256:</span> {String(d.content_hash).slice(0, 24)}…</div>
          <div><span className="text-muted-foreground">HMAC:</span> {String(d.signature).slice(0, 24)}…</div>
        </div>
      )}
      {allFormulas.length > 0 && (
        <div className="space-y-2">
          {allFormulas.map((f, i) => (
            <AnimatedFormula key={`${f.eq}-${f.label}-${i}`} f={f} delay={i * 0.08} />
          ))}
        </div>
      )}
    </div>
  );
}

export function PipelineStagePanel({
  stage,
  isActive,
  isDone,
}: {
  stage: StageDetail;
  isActive: boolean;
  isDone: boolean;
}) {
  const [open, setOpen] = useState(isActive);
  const { isZh } = useLocale();

  if (!isActive && !isDone) return null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[10.5px] font-mono text-muted-foreground hover:text-foreground transition"
      >
        <ChevronDown className={cn("h-3 w-3 transition", open && "rotate-180")} />
        {isZh ? "展开详情" : "Show details"}
        {stage.summary && <span className="text-muted-foreground/70 truncate max-w-[180px]">· {stage.summary}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <DetailBlock stage={stage} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
