import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AlertTriangle, ArrowRight, CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { confirmCase } from "@/lib/dashboard-data";

export const Route = createFileRoute("/confirm")({
  head: () => ({
    meta: [
      { title: "Manual confirmation · Carbon Passport" },
      { name: "description", content: "The one place a human breaks the automation — never silent, never auto-resolved." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Confirm,
});

function Confirm() {
  return (
    <AppShell crumb="Manual confirmation">
      <PageHeader
        n="09"
        zh="人工确认"
        title="We need you to confirm one detail"
        subtitle="Low-confidence CN code, or a conflict between your hint and the classifier. Never silent, never auto-resolved."
      />

      <div className="rounded-xl border border-warning/40 bg-warning/[0.06] p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div>
          <div className="text-[13.5px] font-medium">Why you're seeing this</div>
          <div className="mt-0.5 text-[12.5px] text-muted-foreground">{confirmCase.reason}</div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel p-5">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
          <FileText className="h-3.5 w-3.5" /> Invoice excerpt · line item
        </div>
        <div className="mt-2 rounded-md border border-border bg-surface p-3 font-mono text-[13px]">
          {confirmCase.invoiceExcerpt}
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        <ChoiceCard
          side="Your CN code hint"
          zh="你填写的税则号"
          cn={confirmCase.hint.cn}
          label={confirmCase.hint.label}
          conf={null}
          recommended
        />
        <ChoiceCard
          side="Classifier result"
          zh="分类器建议"
          cn={confirmCase.classifier.cn}
          label={confirmCase.classifier.label}
          conf={confirmCase.classifier.conf}
        />
      </div>

      <div className="panel p-5 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-carbon shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-[13px] font-medium">This pauses the pipeline at the last completed stage.</div>
          <p className="mt-0.5 text-[12px] text-muted-foreground">Nothing re-runs from zero. Finished work is never re-billed. There is no third "auto-decide" option — a human always closes this loop.</p>
        </div>
        <Link
          to="/pipeline"
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card text-[12px] font-medium hover:bg-surface-2 transition"
        >
          Back to pipeline <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </AppShell>
  );
}

function ChoiceCard({ side, zh, cn: code, label, conf, recommended }: { side: string; zh: string; cn: string; label: string; conf: number | null; recommended?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-5 ${recommended ? "border-primary/30 bg-primary/[0.04]" : "border-border bg-card"}`}
    >
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">{side}</div>
        <span className="text-[10.5px] font-mono text-muted-foreground/70">{zh}</span>
      </div>
      <div className="mt-3 font-mono text-3xl font-semibold tracking-tight">{code}</div>
      <div className="mt-1 text-[13px] text-muted-foreground">{label}</div>
      {conf !== null && (
        <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-warning" style={{ width: `${Math.round(conf * 100)}%` }} />
        </div>
      )}
      {conf !== null && <div className="mt-1 text-[11px] font-mono text-warning">confidence {(conf * 100).toFixed(0)}%</div>}

      <button className={`mt-5 w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-md text-[13px] font-medium transition ${recommended ? "bg-primary text-primary-foreground ember-glow hover:brightness-110" : "border border-border bg-card hover:bg-surface-2"}`}>
        <CheckCircle2 className="h-4 w-4" /> Use {code}
      </button>
    </motion.div>
  );
}
