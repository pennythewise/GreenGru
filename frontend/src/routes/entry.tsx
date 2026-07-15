import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Leaf,
  MessagesSquare,
  Paperclip,
  Send,
  Ship,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { AppShell, CitationFooter, PageHeader } from "@/components/AppShell";
import { routerOutput } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/entry")({
  head: () => ({
    meta: [
      { title: "GreenGru Copilot" },
      { name: "description", content: "Describe what you need — the router picks Loan, Grant, or CBAM. Confirm before anything runs." },
    ],
  }),
  component: Entry,
});

const chips = [
  { key: "loan",     label: "贷款 · Loan",       icon: Banknote },
  { key: "grant",    label: "补贴 · Grant",       icon: Leaf },
  { key: "passport", label: "CBAM · EU license", icon: Ship },
];

function Entry() {
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(routerOutput.map((r) => [r.key, r.preSelected])),
  );

  const confirmedCount = Object.values(selected).filter(Boolean).length;

  return (
    <AppShell crumb="GreenGru Copilot">
      <PageHeader
        n="03"
        zh="副驾"
        title="Ask your GreenGru Copilot what you need"
        subtitle="Type it, tap a chip, or upload — the router picks the applicable route(s). You always confirm before anything runs."
      />

      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-5 lg:items-stretch">
        {/* Left — chat + chips */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel p-5 flex flex-col lg:min-h-[620px]">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground shrink-0">
            <MessagesSquare className="h-3.5 w-3.5 text-teal" /> GreenGru Copilot
          </div>

          <div className="mt-4 flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
            <div className="max-w-[75%] rounded-2xl rounded-tl-sm border border-border bg-surface px-3.5 py-2.5 text-[13px]">
              Hi — I'm GreenGru. Tell me what you need and I'll route it. You can tap a chip below.
            </div>
            <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-primary/15 border border-primary/30 px-3.5 py-2.5 text-[13px]">
              We want a green loan for a metering upgrade, and we're applying for the zero-carbon factory grant this year.
            </div>
            <div className="max-w-[75%] rounded-2xl rounded-tl-sm border border-border bg-surface px-3.5 py-2.5 text-[13px]">
              Got it — loan and grant, noted. Quick check while I route this: any tonnes headed to the EU this year? That's what would bring CBAM into scope too.
            </div>
            <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-primary/15 border border-primary/30 px-3.5 py-2.5 text-[13px]">
              Not currently — we're mostly domestic right now, though we might start shipping to the EU around Q3.
            </div>
            <div className="max-w-[75%] rounded-2xl rounded-tl-sm border border-border bg-surface px-3.5 py-2.5 text-[13px]">
              Understood. I'll leave CBAM unselected since there's no EU-bound tonnage declared this period — you can add it back anytime before submitting, no re-work lost.
            </div>
            <div className="max-w-[75%] rounded-2xl rounded-tl-sm border border-border bg-surface px-3.5 py-2.5 text-[13px]">
              Here's what I'm routing this to on the right, with my confidence on each — take a look and confirm.
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 shrink-0">
            {chips.map((c) => (
              <button key={c.key} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-mono hover:border-primary/40 hover:bg-primary/[0.06] transition">
                <c.icon className="h-3.5 w-3.5 text-teal" /> {c.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-2 shrink-0">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Describe your goal · 描述目标…"
              className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/70"
            />
            <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium teal-glow hover:brightness-110 transition">
              <Send className="h-3.5 w-3.5" /> Send
            </button>
          </div>
        </motion.div>

        {/* Right — router output / confirm */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="panel p-5 flex flex-col lg:min-h-[620px]">
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> Router output · confirm the route
            </div>
            <span className="text-[10.5px] font-mono text-muted-foreground">qwen-flash · confidence floor 0.70</span>
          </div>

          <ul className="mt-3 space-y-2 shrink-0">
            {routerOutput.map((r) => {
              const on = selected[r.key];
              const above = r.conf >= 0.70;
              return (
                <li
                  key={r.key}
                  className={cn(
                    "rounded-lg border p-3 cursor-pointer transition",
                    on
                      ? "border-primary/50 bg-primary/[0.08]"
                      : "border-border bg-surface/50 hover:bg-surface-2",
                  )}
                  onClick={() => setSelected((prev) => ({ ...prev, [r.key]: !prev[r.key] }))}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center",
                        on ? "bg-primary border-primary" : "border-border",
                      )}>
                        {on && <BadgeCheck className="h-3 w-3 text-primary-foreground" />}
                      </span>
                      <span className="text-[13px] font-medium">{r.label}</span>
                    </div>
                    <span className={cn(
                      "text-[10.5px] font-mono px-1.5 py-0.5 rounded border",
                      above ? "bg-carbon/10 text-carbon border-carbon/30" : "bg-warning/10 text-warning border-warning/30",
                    )}>
                      {Math.round(r.conf * 100)}%
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11.5px] text-muted-foreground pl-6">{r.reason}</p>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 rounded-lg border border-border bg-surface/40 p-3 text-[11.5px] text-muted-foreground">
            <span className="text-foreground font-medium">Why confirm, not auto-run?</span> The router's confidence is
            advisory, not authorization — GreenGru never starts a paid model call or touches your data on a route you
            haven't ticked. CBAM sits below the 0.70 floor here, so it's off by default.
          </div>

          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between">
              <button className="text-[12px] font-mono text-muted-foreground hover:text-foreground">Edit</button>
              <Link
                to="/new"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-[12.5px] font-medium teal-glow hover:brightness-110 transition"
              >
                Confirm {confirmedCount} route{confirmedCount === 1 ? "" : "s"} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <p className="mt-3 text-[11px] text-muted-foreground italic">
              Never a silent override. Each confirmed route opens its own page after New submission.
            </p>
          </div>
        </motion.div>
      </div>

      <CitationFooter extra="PBOC 2025 · GB/T 36132 · Reg (EU) 2023/956" />
    </AppShell>
  );
}
