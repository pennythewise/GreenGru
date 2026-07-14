import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  FileUp,
  HardHat,
  Info,
  Leaf,
  Radio,
  Ship,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/new")({
  head: () => ({
    meta: [
      { title: "New submission · GreenGru" },
      { name: "description", content: "Upload invoices, pick route(s) — loan, grant, or CBAM — and submit to the six-stage pipeline." },
    ],
  }),
  component: NewSubmission,
});

const cnCodes = ["7207", "7208 10 00", "7213 / 7214", "7301", "7302", "7318 15 42", "7318 15 88", "7326"];
const routes = ["BF-BOF", "DRI-EAF", "Scrap-EAF", "Downstream only", "not sure"];

const routeChips = [
  { key: "loan",     label: "Loan 贷款",         icon: Banknote },
  { key: "grant",    label: "Grant 补贴",         icon: Leaf },
  { key: "passport", label: "CBAM 碳关税",        icon: Ship },
];

function NewSubmission() {
  const [picked, setPicked] = useState<Record<string, boolean>>({ loan: true, grant: true, passport: false });
  const active = Object.entries(picked).filter(([, v]) => v).map(([k]) => k);

  return (
    <AppShell crumb="New submission">
      <PageHeader
        n="04"
        zh="新建"
        title="Get real data in — with guardrails"
        subtitle="Invoices, route(s), tonnage. Obviously-wrong uploads get rejected before any paid model call runs."
      />

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="space-y-5">
          {/* 1 · Documents */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel p-5">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <FileUp className="h-3.5 w-3.5 text-teal" /> 1 · Documents
            </div>
            <div className="mt-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/[0.04] p-8 text-center hover:bg-primary/[0.08] transition cursor-pointer">
              <Upload className="h-8 w-8 text-primary mx-auto" strokeWidth={1.6} />
              <div className="mt-3 text-[14px] font-medium">Drop invoices / photos / PDF</div>
              <div className="mt-1 text-[12px] text-muted-foreground">or upload CSV / XLSX — structured files skip the vision model entirely</div>
              <button type="button" className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-surface text-[12px] font-medium hover:bg-surface-2 transition">
                Browse files
              </button>
            </div>
            <div className="mt-3 flex items-start gap-2 text-[11.5px] text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>Stage 0 pre-screen (StructBERT + DAMO OCR, local) rejects selfies, blank pages, and wrong document types before any DashScope call.</span>
            </div>
          </motion.div>

          {/* 2 · Product & route */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="panel p-5 space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <HardHat className="h-3.5 w-3.5 text-warning" /> 2 · Product & route
            </div>

            {/* Route multi-select — NEW */}
            <div>
              <div className="text-[11.5px] font-mono text-muted-foreground">Applicable route(s) · 适用路径 · multi-select</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {routeChips.map((c) => {
                  const on = picked[c.key];
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setPicked((p) => ({ ...p, [c.key]: !p[c.key] }))}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-mono transition",
                        on
                          ? "border-primary/50 bg-primary/[0.12] text-foreground teal-glow"
                          : "border-border bg-surface text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      <c.icon className="h-3.5 w-3.5" /> {c.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Each active route pulls in its own document checklist further down (deterministic — no model call).
              </p>
            </div>

            <div className="hairline" />

            <div className="grid md:grid-cols-2 gap-3">
              <Field label="CN code hint · 税则号" hint="optional">
                <select className="w-full bg-surface border border-input rounded-md px-3 py-2 text-[13px] font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/25">
                  <option value="">— let the classifier decide</option>
                  {cnCodes.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Production route · 工艺路线" hint="or 'not sure'">
                <select className="w-full bg-surface border border-input rounded-md px-3 py-2 text-[13px] font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/25">
                  {routes.map((r) => <option key={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Company name · 公司名称">
                <input defaultValue="宁波恒峰精密紧固件有限公司" className="w-full bg-surface border border-input rounded-md px-3 py-2 text-[13px] outline-none focus:border-ring focus:ring-2 focus:ring-ring/25" />
              </Field>
              <Field label="Registration · 统一社会信用代码">
                <input defaultValue="91330203MA2G4X7K9L" className="w-full bg-surface border border-input rounded-md px-3 py-2 text-[13px] font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/25" />
              </Field>
              <Field label="Annual export tonnage · 年出口吨数" hint="inline 1000× check on submit">
                <div className="relative">
                  <input defaultValue="1240" className="w-full bg-surface border border-input rounded-md px-3 py-2 pr-14 text-[13px] font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/25" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-muted-foreground">t / yr</span>
                </div>
              </Field>
              <Field label="Reporting period · 期间">
                <input defaultValue="2025-04-01 → 2026-03-31" className="w-full bg-surface border border-input rounded-md px-3 py-2 text-[13px] font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/25" />
              </Field>
            </div>

            <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/[0.06] p-3">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <p className="text-[12px] text-muted-foreground">
                Grant route rejects submissions with no factory registration on file, before any scoring call runs. Kg/tonne mix-ups and values below 50 or above 500,000 t/yr are flagged before submit.
              </p>
            </div>
          </motion.div>

          {/* 3 · Sensor */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="panel p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                <Radio className="h-3.5 w-3.5 text-carbon" /> 3 · Sensor data · optional
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="peer sr-only" />
                <span className="w-9 h-5 rounded-full bg-muted peer-checked:bg-carbon transition relative">
                  <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-background rounded-full transition peer-checked:translate-x-4" />
                </span>
                <span className="text-[12px] font-mono">Include ESP32 kWh feed</span>
              </label>
            </div>
            <p className="mt-2 text-[12px] text-muted-foreground">
              Decoupled — feeds the <span className="text-carbon">grant + loan scores</span>, never the CBAM tariff number.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-mono">
              {[
                { k: "MQTT topic", v: "hf/shopfloor/mains" },
                { k: "Last reading", v: "412.8 kW · 09:41" },
                { k: "Uptime 30d", v: "98.4%" },
              ].map((r) => (
                <div key={r.k} className="rounded-md border border-border bg-surface p-2">
                  <div className="text-muted-foreground uppercase text-[10px] tracking-wider">{r.k}</div>
                  <div className="mt-0.5">{r.v}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right sticky */}
        <div className="lg:sticky lg:top-24 space-y-3 self-start">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="panel-lift p-5">
            <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Ready to submit</div>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">Pipeline preview</h3>
            <ol className="mt-3 space-y-2 text-[12.5px]">
              {[
                "Intake — deterministic OCR + StructBERT",
                "Validate — 国家税务总局 API",
                "Classify — qwen-flash · route router",
                "Calculate — python · rule-based",
                "Update dashboard — deterministic write-back",
                "Authorize → Upstream (Baowu/Ansteel)",
              ].map((s, i) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="font-mono text-[10px] w-4 shrink-0 text-primary">{i + 1}</span>
                  <span className="text-muted-foreground">{s}</span>
                </li>
              ))}
            </ol>

            <div className="mt-4 hairline" />
            <div className="mt-4 space-y-1.5 text-[11.5px] font-mono">
              <Row k="Routes active" v={active.length ? active.join(" · ") : "none"} />
              <Row k="Tonnage" v="1,240 t / yr" />
              <Row k="Sensor" v="attached · 30 d" />
            </div>

            <Link
              to="/pipeline"
              className="mt-5 w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-md bg-primary text-primary-foreground text-[13.5px] font-medium teal-glow hover:brightness-110 transition"
            >
              Submit <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-carbon shrink-0 mt-0.5" />
              <span>Routed to Pipeline status (05). Resumable — a failed stage never re-bills finished work.</span>
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-[11.5px] font-mono text-muted-foreground">{label}</span>
        {hint && <span className="text-[10px] font-mono text-muted-foreground/70">{hint}</span>}
      </div>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{k}</span>
      <span className="text-foreground text-right truncate">{v}</span>
    </div>
  );
}
