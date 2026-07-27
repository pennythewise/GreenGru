import { motion } from "motion/react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Factory,
  Leaf,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import type { GrantScoreResult } from "@/lib/api";
import { DimensionCard, ScoreRing, ThresholdPassBadge } from "@/components/score-panel";
import { useLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

export type { GrantScoreResult };

const DIM_COLORS: Record<string, string> = {
  energy: "from-teal/80 to-primary/60",
  resource: "from-carbon/70 to-teal/50",
  clean: "from-gold/70 to-warning/50",
  product: "from-primary/60 to-teal/40",
  land: "from-muted-foreground/40 to-border",
};

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
      <div className="flex flex-wrap items-start gap-5">
        <ScoreRing value={result.total_score} max={result.max_score} qualified={result.total_score >= 70} />
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
          <ThresholdPassBadge score={result.total_score} isZh={isZh} />
        </div>
      </div>

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
              colorByKey={DIM_COLORS}
              expanded={expandedDim === dim.key}
              onToggle={() => setExpandedDim((k) => (k === dim.key ? null : dim.key))}
            />
          ))}
        </div>
      </div>

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
