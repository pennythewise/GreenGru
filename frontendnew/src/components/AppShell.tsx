import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Banknote,
  Building2,
  ClipboardCheck,
  FileCheck2,
  Flame,
  Gauge,
  Globe2,
  LogOut,
  Radio,
  ScrollText,
  Sparkles,
  Upload,
  Workflow,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", icon: Gauge, label: "Dashboard", zh: "总览", n: "02" },
  { to: "/new", icon: Upload, label: "New submission", zh: "新建", n: "03" },
  { to: "/pipeline", icon: Workflow, label: "Pipeline", zh: "流水线", n: "04" },
  { to: "/results", icon: ClipboardCheck, label: "Results", zh: "评分", n: "05" },
  { to: "/passport", icon: FileCheck2, label: "CBAM passport", zh: "碳护照", n: "06" },
  { to: "/financing", icon: Banknote, label: "Financing", zh: "融资", n: "07" },
  { to: "/plan", icon: Sparkles, label: "Action plan", zh: "行动方案", n: "08" },
  { to: "/confirm", icon: ScrollText, label: "Manual confirm", zh: "人工确认", n: "09" },
  { to: "/partner", icon: Globe2, label: "Partner view", zh: "宝武视图", n: "10" },
] as const;

export function LangToggle() {
  return (
    <div className="inline-flex items-center rounded-md border border-border bg-card p-0.5 text-[11px] font-mono">
      <button className="px-2 py-0.5 rounded-sm bg-foreground text-background">EN</button>
      <button className="px-2 py-0.5 rounded-sm text-muted-foreground hover:text-foreground">中文</button>
    </div>
  );
}

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-surface/60 backdrop-blur-xl">
      <Link to="/" className="px-5 py-5 border-b border-border block">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-danger flex items-center justify-center ember-glow">
              <Flame className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.4} />
            </div>
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-carbon pulse-dot" />
          </div>
          <div>
            <div className="text-[13px] font-semibold tracking-tight leading-tight">Carbon Passport</div>
            <div className="text-[10.5px] text-muted-foreground font-mono tracking-wider">MVP · v1.0</div>
          </div>
        </div>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-2 pb-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono">SME operator</div>
        {nav.map((it) => {
          const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors group",
                active
                  ? "bg-primary/10 text-foreground border border-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-2 border border-transparent",
              )}
            >
              <span className={cn("font-mono text-[10px] w-5 shrink-0", active ? "text-primary" : "text-muted-foreground/70")}>{it.n}</span>
              <it.icon className="h-4 w-4" strokeWidth={2} />
              <span className="flex-1 text-left">{it.label}</span>
              <span className="text-[10px] font-mono text-muted-foreground/70">{it.zh}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="panel p-3">
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-carbon pulse-dot" />
            BEIJING · DASHSCOPE
          </div>
          <div className="mt-1.5 text-[11.5px] text-muted-foreground leading-snug">
            Your data stays on Beijing-region infrastructure.
          </div>
        </div>
      </div>
    </aside>
  );
}

export function TopBar({ crumb }: { crumb?: string }) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-3.5 border-b border-border bg-background/85 backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          <span>BAOWU × HENGFENG</span>
          <span className="text-border">/</span>
          <span className="text-foreground">{crumb ?? "Command Center"}</span>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <LangToggle />
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-card text-[11px] font-mono text-muted-foreground">
          <Radio className="h-3 w-3 text-carbon" /> qc-ops@hengfeng.cn
        </div>
        <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-2 transition text-[12px]">
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}

export function PageHeader({ n, title, zh, subtitle, right }: { n: string; title: string; zh?: string; subtitle: string; right?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-start justify-between gap-4"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
          <span className="text-primary">{n}</span>
          <span className="text-border">·</span>
          <span>{zh}</span>
        </div>
        <h1 className="mt-1 text-[26px] md:text-[30px] font-semibold tracking-tight leading-[1.1]">{title}</h1>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground max-w-2xl">{subtitle}</p>
      </div>
      {right}
    </motion.div>
  );
}

export function AppShell({ crumb, children }: { crumb?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen flex text-foreground">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar crumb={crumb} />
        <main className="flex-1 p-4 md:p-8 space-y-6 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
