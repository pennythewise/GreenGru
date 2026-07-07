import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AlertTriangle, BadgeCheck, Banknote, Download, TrendingUp } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { financing, kpis, paths } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/financing")({
  head: () => ({
    meta: [
      { title: "Green financing report · Carbon Passport" },
      { name: "description", content: "Chinese-only case a bank or subsidy administrator can act on — every number cited." },
    ],
  }),
  component: Financing,
});

function Financing() {
  return (
    <AppShell crumb="Financing">
      <PageHeader
        n="07"
        zh="绿色金融"
        title="Green financing report · 绿色金融报告"
        subtitle="Chinese-only, by deliberate contrast with the CBAM passport — the audience is a Chinese bank. No number without a citation."
        right={
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-[13px] font-medium ember-glow hover:brightness-110 transition">
            <Download className="h-4 w-4" /> Download PDF · 中文
          </button>
        }
      />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="panel-lift">
        <div className="px-6 py-3 border-b border-border bg-surface/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
            <Banknote className="h-3.5 w-3.5 text-carbon" /> financing-report-CBP-2026-0417.pdf · 中文
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-carbon">
            <BadgeCheck className="h-3.5 w-3.5" /> content hash verified
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Grade + gap */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">1 · 低碳排放钢等级</div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-4xl font-semibold tracking-tight text-warning">Grade {kpis.cisaGrade}</span>
                <span className="text-[13px] text-muted-foreground">→ 距 B 级 <span className="text-primary font-mono">+{kpis.benchmarkGap}%</span></span>
              </div>
              <p className="mt-1 text-[12.5px] text-muted-foreground max-w-md">当前核验强度 {kpis.intensity} tCO₂e/吨 · CISA 低碳排放钢标准分级 · 引用: 中国钢铁工业协会 低碳排放钢评价方法</p>
            </div>
            <div className="rounded-lg border border-carbon/25 bg-carbon/[0.06] px-4 py-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">碳账户档位 · 衢州模型</div>
              <div className="mt-0.5 text-2xl font-semibold text-carbon">{kpis.financingTier}</div>
              <div className="text-[11px] font-mono text-muted-foreground">1.5× credit ceiling · LPR −85bp</div>
            </div>
          </div>

          {/* Credit implication */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">2 · 信贷影响 · Quzhou-style tier logic</div>
            <div className="mt-2 grid md:grid-cols-4 gap-2">
              {[
                { t: "深绿", d: "1.5× · −85bp", active: true, tone: "carbon" },
                { t: "浅绿", d: "1.2× · −40bp", tone: "carbon" },
                { t: "黄", d: "1.0× · +0bp", tone: "warning" },
                { t: "红", d: "0.8× · +50bp", tone: "danger" },
              ].map((r) => (
                <div key={r.t} className={cn(
                  "rounded-md border p-3",
                  r.active ? "border-carbon/40 bg-carbon/[0.06]" : "border-border bg-surface/50",
                )}>
                  <div className={cn(
                    "text-[13px] font-semibold",
                    r.tone === "carbon" && "text-carbon",
                    r.tone === "warning" && "text-warning",
                    r.tone === "danger" && "text-danger",
                  )}>{r.t}{r.active && <span className="ml-1 text-[10px] font-mono">← 当前</span>}</div>
                  <div className="mt-0.5 text-[11px] font-mono text-muted-foreground">{r.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Matched programs */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">3 · 匹配的补贴 / 信贷项目 · matched programs</div>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="py-2 pr-3">程序 · Program</th>
                    <th className="py-2 pr-3 text-right">利率 / 类型</th>
                    <th className="py-2 pr-3 text-right">金额 · Amount</th>
                    <th className="py-2 pr-3">状态</th>
                    <th className="py-2 pr-0">Citation</th>
                  </tr>
                </thead>
                <tbody>
                  {financing.map((f) => (
                    <tr key={f.name} className="border-b border-border last:border-0 hover:bg-surface-2/60 transition">
                      <td className="py-3 pr-3">
                        <div className="font-medium">{f.name}</div>
                        <div className="text-[11px] text-muted-foreground">{f.note}</div>
                      </td>
                      <td className="py-3 pr-3 text-right font-mono text-primary">{f.rate}</td>
                      <td className="py-3 pr-3 text-right font-mono">{f.ceiling}</td>
                      <td className="py-3 pr-3">
                        {f.pass ? (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-mono text-carbon border border-carbon/25 bg-carbon/10 rounded px-1.5 py-0.5">
                            <BadgeCheck className="h-3 w-3" /> eligible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-mono text-warning border border-warning/25 bg-warning/10 rounded px-1.5 py-0.5">
                            <AlertTriangle className="h-3 w-3" /> gap
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-0 text-[11px] font-mono text-muted-foreground">{f.citation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11.5px] text-muted-foreground">
              空匹配将呈现为诚实的空状态,不做补白。The agent may not mention a number it cannot trace to <code>subsidy_matches</code>.
            </p>
          </div>

          {/* Next steps from advisory */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">4 · 建议行动 · recommended next steps</div>
            <ol className="mt-2 space-y-2">
              {paths.slice(0, 3).map((p, i) => (
                <li key={p.id} className="flex items-start gap-3 rounded-md border border-border bg-surface/50 p-3">
                  <span className="h-6 w-6 rounded-full bg-primary/15 text-primary font-mono text-[11px] font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium">{p.name}</div>
                    <div className="text-[11.5px] text-muted-foreground">{p.range} · 详见行动方案 (08)</div>
                  </div>
                  <TrendingUp className="h-4 w-4 text-carbon shrink-0 mt-1" />
                </li>
              ))}
            </ol>
          </div>

          <div className="border-t border-border pt-4 text-[11px] text-muted-foreground space-y-1">
            <p>免责声明:本报告不构成法律或税务建议。所有受监管数字均由确定性代码依据引用来源计算,LLM 只写文,不做算术。</p>
            <p className="font-mono">sha256:9b2c…f14e · issuer signature: 3045-0221-00b7-fc9e…</p>
          </div>
        </div>
      </motion.div>
    </AppShell>
  );
}
