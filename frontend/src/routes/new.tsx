import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AlertTriangle, ArrowRight, CheckCircle2, FileUp, HardHat, Info, Radio, Upload } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/new")({
  head: () => ({
    meta: [
      { title: "New submission · Carbon Passport" },
      { name: "description", content: "Upload invoices, choose route and tonnage, submit to the six-stage carbon passport pipeline." },
    ],
  }),
  component: NewSubmission,
});

const cnCodes = ["7207", "7208 10 00", "7213 / 7214", "7301", "7302", "7318 15 42", "7318 15 88", "7326"];
const routes = ["BF-BOF", "DRI-EAF", "Scrap-EAF", "Downstream only", "not sure"];

function NewSubmission() {
  return (
    <AppShell crumb="New submission">
      <PageHeader
        n="03"
        zh="新建"
        title="Get real data in — with guardrails"
        subtitle="Invoices, CN code, route. Obviously-wrong uploads get rejected before any paid model call runs."
      />

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        {/* Left: form */}
        <div className="space-y-5">
          {/* Upload zone */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
            className="panel p-5"
          >
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <FileUp className="h-3.5 w-3.5 text-primary" /> 1 · Documents
            </div>

            <div className="mt-3 rounded-xl border-2 border-dashed border-primary/25 bg-primary/[0.03] p-8 text-center hover:bg-primary/[0.06] transition cursor-pointer">
              <Upload className="h-8 w-8 text-primary mx-auto" strokeWidth={1.6} />
              <div className="mt-3 text-[14px] font-medium">Drop invoices / photos / PDF</div>
              <div className="mt-1 text-[12px] text-muted-foreground">or upload CSV / XLSX — structured files skip the vision model entirely</div>
              <button type="button" className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card text-[12px] font-medium hover:bg-surface-2 transition">
                Browse files
              </button>
            </div>

            <div className="mt-3 flex items-start gap-2 text-[11.5px] text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>Stage 0 pre-screen (StructBERT + DAMO OCR, local) rejects selfies, blank pages, and wrong document types before any DashScope call.</span>
            </div>
          </motion.div>

          {/* Product details */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.35 }}
            className="panel p-5 space-y-4"
          >
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <HardHat className="h-3.5 w-3.5 text-warning" /> 2 · Product & route
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <Field label="CN code hint · 税则号" hint="optional · 1 of 8">
                <select className="w-full bg-card border border-input rounded-md px-3 py-2 text-[13px] font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/25">
                  <option value="">— let the classifier decide</option>
                  {cnCodes.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Production route · 工艺路线" hint="or 'not sure'">
                <select className="w-full bg-card border border-input rounded-md px-3 py-2 text-[13px] font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/25">
                  {routes.map((r) => <option key={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Company name · 公司名称">
                <input defaultValue="宁波恒峰精密紧固件有限公司" className="w-full bg-card border border-input rounded-md px-3 py-2 text-[13px] outline-none focus:border-ring focus:ring-2 focus:ring-ring/25" />
              </Field>
              <Field label="Registration · 统一社会信用代码">
                <input defaultValue="91330203MA2G4X7K9L" className="w-full bg-card border border-input rounded-md px-3 py-2 text-[13px] font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/25" />
              </Field>
              <Field label="Annual export tonnage · 年出口吨数" hint="inline 1000× check on submit">
                <div className="relative">
                  <input defaultValue="1240" className="w-full bg-card border border-input rounded-md px-3 py-2 pr-14 text-[13px] font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/25" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-muted-foreground">t / yr</span>
                </div>
              </Field>
              <Field label="Reporting period · 期间">
                <input defaultValue="2025-04-01 → 2026-03-31" className="w-full bg-card border border-input rounded-md px-3 py-2 text-[13px] font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/25" />
              </Field>
            </div>

            <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/[0.06] p-3">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <p className="text-[12px] text-muted-foreground">
                The kg / tonne mix-up is the single most common bad input. Values below 50 or above 500,000 t/yr are flagged before submit.
              </p>
            </div>
          </motion.div>

          {/* Optional sensor */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}
            className="panel p-5"
          >
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
              Decoupled — only feeds the <span className="text-carbon">financing report score</span>, never the CBAM tariff number.
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

        {/* Right: sticky summary + submit */}
        <div className="lg:sticky lg:top-24 space-y-3 self-start">
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.35 }}
            className="panel-lift p-5"
          >
            <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Ready to submit</div>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">Pipeline preview</h3>
            <ol className="mt-3 space-y-2 text-[12.5px]">
              {[
                "Pre-screen (local) — reject bad uploads",
                "Intake — qwen3-vl-flash · vision",
                "Classify — qwen-flash · 8-way",
                "Calculate — deterministic Python",
                "Score — rule-based · CISA + benchmark",
                "Generate — qwen-plus · EN/中文 + 中文",
              ].map((s, i) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="font-mono text-[10px] w-4 shrink-0 text-primary">{i}</span>
                  <span className="text-muted-foreground">{s}</span>
                </li>
              ))}
            </ol>

            <div className="mt-4 hairline" />

            <div className="mt-4 space-y-1.5 text-[11.5px] font-mono">
              <Row k="Products" v="1 candidate CN code" />
              <Row k="Tonnage" v="1,240 t / yr" />
              <Row k="Route" v="BF-BOF" />
              <Row k="Sensor" v="attached · 30 d" />
            </div>

            <Link
              to="/pipeline"
              className="mt-5 w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-md bg-primary text-primary-foreground text-[13.5px] font-medium ember-glow hover:brightness-110 transition"
            >
              Submit <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-carbon shrink-0 mt-0.5" />
              <span>You'll be routed to Pipeline status (04). Resumable — a failed stage never re-bills finished work.</span>
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
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-foreground">{v}</span>
    </div>
  );
}
