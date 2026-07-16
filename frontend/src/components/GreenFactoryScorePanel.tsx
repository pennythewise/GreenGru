import { motion } from "motion/react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Factory,
  Leaf,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

export type GrantIndicatorScore = {
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
};

export type GrantDimensionScore = {
  key: string;
  name_en: string;
  name_zh: string;
  weight_pct: number;
  score: number;
  max_score: number;
  indicators: GrantIndicatorScore[];
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
  dimensions: GrantDimensionScore[];
  tier_label: string;
  tier_label_zh: string;
  formulas: { eq: string; label: string; latex: string; values: Record<string, unknown>; result: number }[];
  summary_en: string;
  summary_zh: string;
};

const DIM_COLORS: Record<string, string> = {
  energy: "from-teal/80 to-primary/60",
  resource: "from-carbon/70 to-teal/50",
  clean: "from-gold/70 to-warning/50",
  product: "from-primary/60 to-teal/40",
  land: "from-muted-foreground/40 to-border",
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
  dim: GrantDimensionScore;
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
              {isZh ? `权重 ${dim.weight_pct}%` : `Weight ${dim.weight_pct}%`} · {dim.score.toFixed(1)} / {dim.max_score}
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
                    {ind.formula_ref && <span className="px-1 py-0.5 rounded bg-primary/10 text-primary">式 {ind.formula_ref}</span>}
                    <span>{ind.data_source}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[14px] font-mono font-semibold text-carbon">
                    {ind.score}<span className="text-[10px] text-muted-foreground">/{ind.weight_points}</span>
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

export function GreenFactoryScorePanel({ result }: { result: GrantScoreResult }) {
  const { isZh } = useLocale();
  const [expandedDim, setExpandedDim] = useState<string | null>("energy");

  const steps = isZh
    ? [
        { n: 1, title: "基本准入", desc: "核对 GB/T 36132 §4.2 与申请表一票否决项" },
        { n: 2, title: "采集数据", desc: "新建提交碳强度、废钢比、绿电比 + 上传清单" },
        { n: 3, title: "对标赋分", desc: "§5.2 引领值满分、基准值零分、区间线性比例" },
        { n: 4, title: "一级汇总", desc: "五类指标加权累计为评价结果（§6.1）" },
      ]
    : [
        { n: 1, title: "Basic requirements", desc: "Check §4.2 gates + application veto items" },
        { n: 2, title: "Collect signals", desc: "New submission levers + uploaded checklist docs" },
        { n: 3, title: "Benchmark score", desc: "§5.2 — full at leading, zero at benchmark, linear between" },
        { n: 4, title: "Roll up", desc: "Sum five primary indicators per §6.1" },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/[0.06] via-surface/40 to-carbon/[0.04] p-5 space-y-5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start gap-5">
        <ScoreRing value={result.total_score} max={result.max_score} qualified={result.qualified} />
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-primary">
            <Factory className="h-3.5 w-3.5" />
            {isZh ? "B 节 · 阶段 3 · 评分" : "Section B · Stage 3 · Score"}
          </div>
          <h4 className="mt-1 text-[17px] font-semibold tracking-tight">
            {isZh ? "绿色工厂评价" : "Green factory evaluation"}
          </h4>
          <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
            {isZh ? result.summary_zh : result.summary_en}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-primary/30 bg-primary/10 text-[10.5px] font-mono text-primary">
            <BookOpen className="h-3 w-3" />
            {result.standard} {result.standard_zh}
          </div>
          <div className="mt-1.5 text-[10px] font-mono text-muted-foreground flex items-center gap-1">
            <Leaf className="h-3 w-3 text-carbon" />
            {isZh ? "评价依据：" : "Guideline: "}
            {result.guideline_doc}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium",
              result.qualified ? "bg-carbon/15 text-carbon border border-carbon/30" : "bg-warning/15 text-warning border border-warning/30",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isZh ? result.tier_label_zh : result.tier_label}
          </motion.div>
        </div>
      </div>

      {/* How it works */}
      <div>
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          {isZh ? "评价流程" : "How 绿色工厂 evaluates your company"}
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
              <div className="text-[10px] font-mono text-primary">Step {s.n}</div>
              <div className="text-[12px] font-medium mt-0.5">{s.title}</div>
              <div className="text-[10.5px] text-muted-foreground mt-1 leading-snug">{s.desc}</div>
            </motion.li>
          ))}
        </ol>
      </div>

      {/* Veto gate */}
      <div className="rounded-lg border border-border bg-surface/30 p-3">
        <div className="flex items-center gap-2 text-[12px] font-medium">
          {result.veto_passed ? (
            <CheckCircle2 className="h-4 w-4 text-carbon" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-warning" />
          )}
          {isZh ? "基本准入（一票否决）" : "Basic requirements (veto gate)"}
          <span className={cn("text-[10px] font-mono ml-auto", result.veto_passed ? "text-carbon" : "text-warning")}>
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

      {/* Five dimensions */}
      <div>
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          {isZh ? "五类一级指标（表 C.1）" : "Five primary indicators (Table C.1)"}
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

      {/* Formula strip */}
      {result.formulas.length > 0 && (
        <div className="rounded-lg border border-border/70 bg-surface/20 p-3 space-y-2">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            {isZh ? "评分公式（通则 §5.2 · 附录 B）" : "Scoring formulas (§5.2 · Appendix B)"}
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
