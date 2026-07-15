import { Link, useRouterState } from "@tanstack/react-router";
import {
  Banknote,
  Building2,
  FileCheck2,
  Gauge,
  Leaf,
  LogOut,
  MessagesSquare,
  Radio,
  Upload,
} from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { CopilotTrigger } from "@/components/CopilotChat";
import { cn } from "@/lib/utils";

type NavChild = { to: string; icon: typeof Gauge; label: string; zh: string };
type NavItem = { to: string; icon: typeof Gauge; label: string; zh: string; children?: NavChild[] };

const nav: NavItem[] = [
  { to: "/",      icon: Gauge,          label: "Dashboard",      zh: "总览" },
  { to: "/new",   icon: Upload,         label: "New submission", zh: "新建" },
  {
    to: "/entry", icon: MessagesSquare, label: "GreenGru Copilot", zh: "副驾",
    children: [
      { to: "/passport", icon: FileCheck2, label: "EU license", zh: "碳护照" },
      { to: "/loan",     icon: Banknote,   label: "Loan",       zh: "贷款" },
      { to: "/grant",    icon: Leaf,       label: "Grant",      zh: "补贴" },
    ],
  },
];

export function LangToggle() {
  return (
    <div className="inline-flex items-center rounded-md border border-border bg-surface p-0.5 text-[11px] font-mono">
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
            <div className="h-9 w-9 rounded-lg flex items-center justify-center teal-glow"
                 style={{ background: "var(--gradient-teal)" }}>
              <span className="font-display text-[18px] font-bold text-[oklch(0.14_0.02_220)]">G</span>
            </div>
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-carbon pulse-dot" />
          </div>
          <div>
            <div className="text-[13px] font-semibold tracking-tight leading-tight">GreenGru</div>
            <div className="text-[10.5px] text-muted-foreground font-mono tracking-wider">MVP · v1.0</div>
          </div>
        </div>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-2 pb-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono">SME operator</div>
        {nav.map((it) => {
          const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
          return (
            <div key={it.to}>
              <Link
                to={it.to}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors group",
                  active
                    ? "bg-primary/10 text-foreground border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-2 border border-transparent",
                )}
              >
                <it.icon className="h-4 w-4" strokeWidth={2} />
                <span className="flex-1 text-left">{it.label}</span>
                <span className="text-[10px] font-mono text-muted-foreground/70">{it.zh}</span>
              </Link>
              {it.children && (
                <div className="relative mt-0.5 ml-[22px] space-y-0.5 border-l border-border pl-3">
                  {it.children.map((c) => {
                    const cActive = pathname.startsWith(c.to);
                    return (
                      <Link
                        key={c.to}
                        to={c.to}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded-md text-[12.5px] transition-colors",
                          cActive
                            ? "bg-primary/10 text-foreground border border-primary/30"
                            : "text-muted-foreground hover:text-foreground hover:bg-surface-2 border border-transparent",
                        )}
                      >
                        <c.icon className="h-3.5 w-3.5" strokeWidth={2} />
                        <span className="flex-1 text-left">{c.label}</span>
                        <span className="text-[10px] font-mono text-muted-foreground/70">{c.zh}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
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
    <header className="flex items-center justify-between gap-4 px-6 py-3.5 border-b border-border bg-background/70 backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          <span>BAOWU × HENGFENG</span>
          <span className="text-border">/</span>
          <span className="text-foreground">{crumb ?? "Command Center"}</span>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5">
          <LangToggle />
          <CopilotTrigger />
        </div>
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-surface text-[11px] font-mono text-muted-foreground">
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
        <p className="mt-1.5 text-[13.5px] text-muted-foreground max-w-2xl italic">{subtitle}</p>
      </div>
      {right}
    </motion.div>
  );
}

export function CitationFooter({ extra }: { extra?: string }) {
  return (
    <footer className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-mono text-muted-foreground border-t border-border/60">
      <div>Cited: IR (EU) 2025/2621 · Reg (EU) 2023/956 · CISA · PBOC · 工信部联节〔2026〕13号{extra ? ` · ${extra}` : ""}</div>
      <div>© GreenGru · Beijing-region infra</div>
    </footer>
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
