import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CircleAlert,
  Download,
  FileText,
  Info,
  Radio,
  Upload,
  Wand2,
} from "lucide-react";
import { AppShell, CitationFooter, PageHeader } from "@/components/AppShell";
import { advisoryCards, docChecklists, gaps, routePages, routeStrip } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

type Slug = keyof typeof routePages;

/* ---------- Doc checklist ---------- */
function Checklist({ slug }: { slug: Slug }) {
  const c = docChecklists[slug];
  const done = c.items.filter((i) => i.done).length;
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
          <FileText className="h-3.5 w-3.5 text-teal" /> Section A · Document intake
        </div>
        <span className="text-[11.5px] font-mono">{done} of {c.items.length} collected</span>
      </div>
      <h3 className="mt-1 text-[15px] font-semibold tracking-tight">{c.title}</h3>
      <p className="mt-1 text-[11.5px] text-muted-foreground italic">Deterministic checklist — no model call. Missing rows block Section B.</p>

      <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-carbon" style={{ width: `${(done / c.items.length) * 100}%` }} />
      </div>

      <ul className="mt-4 divide-y divide-border">
        {c.items.map((it) => (
          <li key={it.name} className="py-2.5 flex items-center gap-3">
            <span className={cn(
              "h-5 w-5 rounded-full flex items-center justify-center shrink-0",
              it.done ? "bg-carbon/15 text-carbon" : "bg-muted/60 text-muted-foreground border border-dashed border-border",
            )}>
              {it.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <span className={cn("flex-1 text-[13px]", !it.done && "text-muted-foreground")}>{it.name}</span>
            {it.done ? (
              <span className="text-[10.5px] font-mono text-carbon">✓ done</span>
            ) : (
              <button className="inline-flex items-center gap-1 text-[11.5px] font-mono text-primary hover:brightness-125">
                <Upload className="h-3 w-3" /> Upload
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5 text-[10.5px] font-mono text-muted-foreground">
        <BookOpen className="h-3 w-3" /> {c.kb}
      </div>
    </div>
  );
}

/* ---------- Horizontal stage strip ---------- */
function StageStrip({ kb }: { kb: string }) {
  const stages = routeStrip(kb);
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
        <Radio className="h-3.5 w-3.5 text-teal" /> Section B · Route pipeline
      </div>
      <ol className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        {stages.map((s) => {
          const done = s.status === "done";
          const active = s.status === "active";
          return (
            <li key={s.n} className={cn(
              "rounded-lg border p-3 relative",
              done && "border-carbon/40 bg-carbon/[0.06]",
              active && "border-primary/50 bg-primary/[0.08] teal-glow",
              !done && !active && "border-border bg-surface/50",
            )}>
              <div className="flex items-baseline justify-between">
                <span className={cn(
                  "text-[10px] font-mono",
                  done ? "text-carbon" : active ? "text-primary" : "text-muted-foreground",
                )}>
                  {active && "▸ "}STAGE {s.n}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">{s.elapsed ?? "—"}</span>
              </div>
              <div className="mt-1 text-[13px] font-medium">{s.key}</div>
              <div className="text-[10px] font-mono text-muted-foreground">{s.zh}</div>
              <div className={cn(
                "mt-2 text-[10.5px] font-mono leading-snug",
                active ? "text-primary" : "text-muted-foreground",
              )}>{s.method}</div>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-[11.5px] text-muted-foreground italic">Pull factory data reads the same live bus as the Dashboard's factory panel — never a second source.</p>
    </div>
  );
}

/* ---------- Score gauge (small, CISA-style) ---------- */
function ScoreGauge({ value, grade }: { value: number; grade: string }) {
  const pct = Math.max(0, Math.min(100, value)) / 100;
  const angle = -90 + pct * 180;
  return (
    <div className="relative w-[220px] h-[120px] mx-auto">
      <svg viewBox="0 0 200 110" className="w-full h-full">
        <defs>
          <linearGradient id="rpg" x1="0" x2="1">
            <stop offset="0" stopColor="var(--color-danger)" />
            <stop offset="0.5" stopColor="var(--color-warning)" />
            <stop offset="1" stopColor="var(--color-carbon)" />
          </linearGradient>
        </defs>
        <path d="M 15 100 A 85 85 0 0 1 185 100" fill="none" stroke="url(#rpg)" strokeWidth="12" strokeLinecap="round" />
        <g transform={`rotate(${angle} 100 100)`}>
          <line x1="100" y1="100" x2="100" y2="35" stroke="var(--color-gold)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="100" cy="100" r="5" fill="var(--color-gold)" />
        </g>
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className="font-mono text-[26px] font-semibold text-gold leading-none">{grade}</div>
        <div className="text-[10.5px] font-mono text-muted-foreground mt-0.5">{value} / 100</div>
      </div>
    </div>
  );
}

/* ============================================================ */

export function RoutePage({ slug }: { slug: Slug }) {
  const cfg = routePages[slug];
  const advice = advisoryCards[slug];
  const gapList = gaps[slug];

  return (
    <AppShell crumb={cfg.label}>
      <PageHeader
        n={cfg.n}
        zh={cfg.zh}
        title={cfg.title}
        subtitle={cfg.subtitle}
        right={
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-carbon/30 bg-carbon/5 text-[11.5px] font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-carbon pulse-dot" /> Submit-ready
          </div>
        }
      />

      <Checklist slug={slug} />
      <StageStrip kb={cfg.kb} />

      {/* Section C — split panel */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Left: report preview */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="panel-lift p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <FileText className="h-3.5 w-3.5 text-teal" /> Section C · Report preview
            </div>
            <span className="text-[10.5px] font-mono text-carbon inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-carbon" /> deterministic
            </span>
          </div>

          <h3 className="mt-2 text-[17px] font-semibold tracking-tight">{cfg.title}</h3>
          <p className="text-[11.5px] font-mono text-muted-foreground">{cfg.scoreLabel} · {cfg.scoreValue}</p>

          <div className="mt-4 rounded-lg border border-border bg-surface/40 p-4">
            <ScoreGauge value={cfg.gauge} grade={cfg.scoreGrade} />
          </div>

          <div className="mt-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Gap list</div>
            <ul className="mt-2 space-y-1.5">
              {gapList.map((g) => (
                <li key={g} className="flex items-start gap-2 text-[12.5px]">
                  <CircleAlert className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-[12.5px] font-medium teal-glow hover:brightness-110 transition">
              <Download className="h-3.5 w-3.5" /> Download PDF
            </button>
            <span className="text-[10.5px] font-mono text-muted-foreground">Available before Advisory finishes.</span>
          </div>
        </motion.div>

        {/* Right: advisory */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="panel p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <Wand2 className="h-3.5 w-3.5 text-gold" /> Section C · Advisory
            </div>
            <span className="text-[10.5px] font-mono text-muted-foreground">non-blocking · optional follow-up</span>
          </div>

          <ul className="mt-3 space-y-2">
            {advice.map((a) => (
              <li key={a.title} className="rounded-lg border border-border bg-surface/50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[13px] font-medium">{a.title}</div>
                  <span className="shrink-0 text-[10.5px] font-mono px-1.5 py-0.5 rounded bg-gold/15 text-gold border border-gold/30">
                    {a.impact} {cfg.advisoryImpactUnit}
                  </span>
                </div>
                <details className="mt-1.5">
                  <summary className="text-[11.5px] font-mono text-muted-foreground cursor-pointer hover:text-foreground">Why?</summary>
                  <p className="mt-1.5 text-[11.5px] text-muted-foreground leading-relaxed">{a.why}</p>
                </details>
                <div className="mt-2">
                  <span className={cn(
                    "text-[10.5px] font-mono px-1.5 py-0.5 rounded border",
                    a.status.startsWith("Implemented") ? "bg-carbon/10 text-carbon border-carbon/30" : "bg-muted/60 text-muted-foreground border-border",
                  )}>{a.status}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-start gap-2 text-[11px] text-muted-foreground">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>The SME can act on the left panel alone — advisory is optional.</span>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between">
        <Link to="/" className="text-[12.5px] font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          ← Back to dashboard
        </Link>
        <Link to="/pipeline" className="text-[12.5px] font-mono text-primary inline-flex items-center gap-1">
          View underlying pipeline <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <CitationFooter extra={cfg.citations} />
    </AppShell>
  );
}
