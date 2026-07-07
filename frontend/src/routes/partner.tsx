import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Filter, Lock, Globe2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { partnerSuppliers } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/partner")({
  head: () => ({
    meta: [
      { title: "Partner dashboard · Carbon Passport" },
      { name: "description", content: "Anchor-enterprise aggregate view — tier + verified totals only, never raw invoice data." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Partner,
});

function Partner() {
  return (
    <AppShell crumb="Partner view">
      <PageHeader
        n="10"
        zh="宝武视图 · stretch"
        title="Aggregate view — never a supplier's raw data"
        subtitle="Enforced at the database role level (RLS), not just app code. No drill-down. Intentional dead end."
        right={
          <div className="flex items-center gap-2">
            <Select label="Grade" opts={["all grades", "A", "B", "C", "D", "E"]} />
            <Select label="Tier" opts={["all tiers", "深绿", "浅绿", "黄", "红"]} />
          </div>
        }
      />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel p-5">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-3">
          <Globe2 className="h-3.5 w-3.5 text-signal" /> Supplier ledger · {partnerSuppliers.length} of 317
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-2 pr-3">Supplier</th>
                <th className="py-2 pr-3">CISA grade</th>
                <th className="py-2 pr-3">Financing tier</th>
                <th className="py-2 pr-0 text-right">Verified annual exposure · tCO₂e</th>
              </tr>
            </thead>
            <tbody>
              {partnerSuppliers.map((s) => (
                <tr key={s.name} className="border-b border-border last:border-0">
                  <td className="py-3 pr-3 font-mono text-muted-foreground">{s.name}</td>
                  <td className="py-3 pr-3">
                    <span className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded font-semibold text-[11px]",
                      (s.grade === "A" || s.grade === "B") && "bg-carbon/15 text-carbon",
                      s.grade === "C" && "bg-warning/15 text-warning",
                      (s.grade === "D" || s.grade === "E") && "bg-danger/15 text-danger",
                    )}>{s.grade}</span>
                  </td>
                  <td className="py-3 pr-3 font-mono text-[12.5px]">{s.tier}</td>
                  <td className="py-3 pr-0 text-right font-mono">{s.exposure.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="panel p-5 flex items-start gap-3">
        <Lock className="h-5 w-5 text-carbon shrink-0 mt-0.5" />
        <div>
          <div className="text-[13px] font-medium">Hard data-segregation boundary</div>
          <p className="mt-1 text-[12px] text-muted-foreground max-w-2xl">
            This view can only ever query <code className="text-foreground">cisa_grade</code> and aggregated <code className="text-foreground">annual_exposure</code> — never raw invoices or <code className="text-foreground">extracted_json</code>. Enforced as a separate Postgres role + RLS policy in Supabase, not a UI-layer filter that a future refactor could quietly remove.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function Select({ label, opts }: { label: string; opts: string[] }) {
  return (
    <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-card text-[12px]">
      <Filter className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-muted-foreground text-[11px] font-mono">{label}</span>
      <select className="bg-transparent outline-none text-[12px] font-mono">
        {opts.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}
