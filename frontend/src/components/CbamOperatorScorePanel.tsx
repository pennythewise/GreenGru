import { motion } from "motion/react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Globe2,
  Scale,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";
import type { GrantScoreResult } from "@/lib/api";

/** Same shape as grant score — shared API contract for Stage-3 panels. */
export type CbamScoreResult = GrantScoreResult;

const DIM_COLORS: Record<string, string> = {
  scope: "from-teal/80 to-primary/60",
  monitoring: "from-primary/70 to-teal/50",
  direct: "from-gold/70 to-warning/50",
  precursors: "from-carbon/70 to-teal/40",
  reporting: "from-muted-foreground/40 to-border",
};

function ScoreRing({ value, max, qualified }: { value: number; max: number; qualified: boolean }) {
  const pct = Math.min(100, (value / max) * 100);
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative w-[140px] h-[140px] shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-border)" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={qualified ? "var(--color-carbon)" : "var(--color-warning)"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-[28px] font-mono font-semibold text-foreground"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          {value}
        </motion.span>
        <span className="text-[10px] font-mono text-muted-foreground">/ {max}</span>
      </div>
    </div>
  );
}

function DimensionCard({
  dim,
  index,
  isZh,
  expanded,
  onToggle,
}: {
  dim: CbamScoreResult["dimensions"][number];
  index: number;
  isZh: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const pct = dim.max_score > 0 ? (dim.score / dim.max_score) * 100 : 0;
  const gradient = DIM_COLORS[dim.key] ?? "from-primary/50 to-teal/40";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl border border-border bg-surface/40 overflow-hidden"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-3.5 hover:bg-surface-2/50 transition"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold">{isZh ? dim.name_zh : dim.name_en}</div>
            <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
              {isZh ? `权重 ${dim.weight_pct}%` : `Weight ${dim.weight_pct}%`} · {dim.score.toFixed(1)} /{" "}
              {dim.max_score}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[18px] font-mono font-semibold text-primary">{Math.round(pct)}%</span>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition", expanded && "rotate-180")} />
          </div>
        </div>
        <div className="mt-2.5 h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full bg-gradient-to-r", gradient)}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, delay: index * 0.08, ease: "easeOut" }}
          />
        </div>
      </button>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-t border-border/70 px-3.5 pb-3.5 space-y-2"
        >
          {dim.indicators.map((ind, i) => (
            <motion.div
              key={ind.seq}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-border/60 bg-surface/30 p-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11.5px] font-medium leading-snug">
                    <span className="font-mono text-muted-foreground mr-1.5">#{ind.seq}</span>
                    {isZh ? ind.name_zh : ind.name_en}
                  </div>
                  <p className="mt-1 text-[10.5px] text-muted-foreground leading-relaxed">
                    {isZh ? ind.explanation_zh : ind.explanation_en}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 text-[9.5px] font-mono text-muted-foreground">
                    {ind.formula_ref && (
                      <span className="px-1 py-0.5 rounded bg-primary/10 text-primary">{ind.formula_ref}</span>
                    )}
                    <span>{ind.data_source}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[14px] font-mono font-semibold text-carbon">
                    {ind.score}
                    <span className="text-[10px] text-muted-foreground">/{ind.weight_points}</span>
                  </div>
                  {ind.actual != null && (
                    <div className="text-[9px] font-mono text-muted-foreground mt-0.5">
                      {String(ind.actual)} {ind.unit !== "—" ? ind.unit : ""}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export function CbamOperatorScorePanel({ result }: { result: CbamScoreResult }) {
  const { isZh } = useLocale();
  const [expandedDim, setExpandedDim] = useState<string | null>("scope");

  const steps = isZh
    ? [
        { n: 1, title: "确认在列货物", desc: "对照附件一 CN 码与钢铁生产路线（§5.2 / §5.6）" },
        { n: 2, title: "建立监测方法", desc: "快速指南 §3：边界 → 报告期 → 监测参数" },
        { n: 3, title: "核算直接排放", desc: "装置直接排放归属至货物 SEE（§6.5 / 附件四）" },
        { n: 4, title: "打包给申报人", desc: "使用欧委会沟通模板回复欧盟进口商（§6.11）" },
      ]
    : [
        { n: 1, title: "Confirm CBAM goods", desc: "Map CN codes + steel production route (§5.2 / §5.6)" },
        { n: 2, title: "Build MMD", desc: "Quick Guide §3: boundaries → period → parameters" },
        { n: 3, title: "Direct emissions", desc: "Attribute installation direct emissions to SEE (§6.5 / Annex IV)" },
        { n: 4, title: "Pack for declarant", desc: "Reply to EU importers via Commission template (§6.11)" },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-teal/30 bg-gradient-to-br from-teal/[0.07] via-surface/40 to-primary/[0.05] p-5 space-y-5"
    >
      <div className="flex flex-wrap items-start gap-5">
        <ScoreRing value={result.total_score} max={result.max_score} qualified={result.qualified} />
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-teal">
            <Globe2 className="h-3.5 w-3.5" />
            {isZh ? "欧盟许可 · 阶段 3 · 评分" : "EU license · Stage 3 · Score"}
          </div>
          <h4 className="mt-1 text-[17px] font-semibold tracking-tight">
            {isZh ? "装置运营方 CBAM 就绪评价" : "Installation operator CBAM readiness"}
          </h4>
          <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
            {isZh ? result.summary_zh : result.summary_en}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-teal/30 bg-teal/10 text-[10.5px] font-mono text-teal">
            <BookOpen className="h-3 w-3" />
            {result.standard} · {result.standard_zh}
          </div>
          <div className="mt-1.5 text-[10px] font-mono text-muted-foreground flex items-start gap-1">
            <Scale className="h-3 w-3 text-teal shrink-0 mt-0.5" />
            <span>
              {isZh ? "评价依据：" : "Guideline: "}
              {result.guideline_doc}
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium",
              result.qualified
                ? "bg-carbon/15 text-carbon border border-carbon/30"
                : "bg-warning/15 text-warning border border-warning/30",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isZh ? result.tier_label_zh : result.tier_label}
          </motion.div>
        </div>
      </div>

      <div>
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          {isZh ? "运营方快速指南流程" : "How the operator Quick Guide evaluates you"}
        </div>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {steps.map((s, i) => (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="rounded-lg border border-border bg-surface/50 p-2.5"
            >
              <div className="text-[10px] font-mono text-teal">Step {s.n}</div>
              <div className="text-[12px] font-medium mt-0.5">{s.title}</div>
              <div className="text-[10.5px] text-muted-foreground mt-1 leading-snug">{s.desc}</div>
            </motion.li>
          ))}
        </ol>
      </div>

      <div className="rounded-lg border border-border bg-surface/30 p-3">
        <div className="flex items-center gap-2 text-[12px] font-medium">
          {result.veto_passed ? (
            <CheckCircle2 className="h-4 w-4 text-carbon" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-warning" />
          )}
          {isZh ? "基本准入（快速指南 §3）" : "Basic gates (Quick Guide §3)"}
          <span
            className={cn(
              "text-[10px] font-mono ml-auto",
              result.veto_passed ? "text-carbon" : "text-warning",
            )}
          >
            {result.veto_items.filter((v) => v.passed).length}/{result.veto_items.length}
          </span>
        </div>
        <div className="mt-2 grid sm:grid-cols-2 gap-1">
          {result.veto_items.map((v) => (
            <div key={v.key} className="flex items-start gap-1.5 text-[10.5px]">
              {v.passed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-carbon shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
              )}
              <span className={v.passed ? "text-foreground" : "text-muted-foreground"}>
                {isZh ? v.label_zh : v.label_en}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          {isZh ? "五维就绪度（指南 §3–§6 · 钢铁 §5.6）" : "Five readiness dimensions (§3–§6 · steel §5.6)"}
        </div>
        <div className="space-y-2">
          {result.dimensions.map((dim, i) => (
            <DimensionCard
              key={dim.key}
              dim={dim}
              index={i}
              isZh={isZh}
              expanded={expandedDim === dim.key}
              onToggle={() => setExpandedDim((k) => (k === dim.key ? null : dim.key))}
            />
          ))}
        </div>
      </div>

      {result.formulas.length > 0 && (
        <div className="rounded-lg border border-border/70 bg-surface/20 p-3 space-y-2">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            {isZh ? "关键公式（指南 / 附件四）" : "Key formulas (Guidance / Annex IV)"}
          </div>
          {result.formulas.map((f, i) => (
            <motion.div
              key={f.eq}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="text-[10.5px] font-mono"
            >
              <span className="text-teal">{f.eq}</span> · {f.label}
              <div className="text-primary/90 mt-0.5">{f.latex}</div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
