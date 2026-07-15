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
import { useLocale } from "@/lib/locale";
import { shell } from "@/lib/ui-strings";
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
  const { locale, setLocale } = useLocale();
  return (
    <div className="inline-flex items-center rounded-md border border-border bg-surface p-0.5 text-[11px] font-mono">
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "px-2 py-0.5 rounded-sm transition",
          locale === "en" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("zh")}
        className={cn(
          "px-2 py-0.5 rounded-sm transition",
          locale === "zh" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
        )}
      >
        中文
      </button>
    </div>
  );
}

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isZh, t } = useLocale();
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
        <div className="px-2 pb-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono">
          {t(shell.smeOperator.en, shell.smeOperator.zh)}
        </div>
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
                <span className="flex-1 text-left">{isZh ? it.zh : it.label}</span>
                {!isZh && <span className="text-[10px] font-mono text-muted-foreground/70">{it.zh}</span>}
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
                        <span className="flex-1 text-left">{isZh ? c.zh : c.label}</span>
                        {!isZh && <span className="text-[10px] font-mono text-muted-foreground/70">{c.zh}</span>}
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
            {t(shell.dataResidency.en, shell.dataResidency.zh)}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function TopBar({ crumb }: { crumb?: string }) {
  const { t } = useLocale();
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-3.5 border-b border-border bg-background/70 backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          <span>BAOWU × HENGFENG</span>
          <span className="text-border">/</span>
          <span className="text-foreground">{crumb ?? t(shell.commandCenter.en, shell.commandCenter.zh)}</span>
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

export function UpstreamTopBar({ crumb }: { crumb?: string }) {
  const { t } = useLocale();
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-3.5 border-b border-border bg-background/70 backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <Link to="/upstream" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center teal-glow"
               style={{ background: "var(--gradient-teal)" }}>
            <span className="font-display text-[16px] font-bold text-[oklch(0.14_0.02_220)]">G</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span>BAOWU / ANSTEEL</span>
            <span className="text-border">/</span>
            <span className="text-foreground">{crumb ?? t(shell.accountManager.en, shell.accountManager.zh)}</span>
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-surface text-[11px] font-mono text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-carbon pulse-dot" /> {t(shell.apiConnected.en, shell.apiConnected.zh)}
        </div>
        <LangToggle />
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-surface text-[11px] font-mono text-muted-foreground">
          <Radio className="h-3 w-3 text-carbon" /> account-mgr@baowu-partners.cn
        </div>
        <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-2 transition text-[12px]">
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}

// Minimal shell for the anchor-enterprise ("Upstream") persona — deliberately
// not the SME Sidebar/AppShell, since that nav (New submission, GreenGru
// Copilot, Loan/Grant) has no meaning for an account manager looking at an
// aggregate, read-only view across suppliers.
export function UpstreamShell({ crumb, children }: { crumb?: string; children: ReactNode }) {
  return (
    <div className="theme-light min-h-screen flex flex-col text-foreground bg-background" style={{ colorScheme: "light" }}>
      <UpstreamTopBar crumb={crumb} />
      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-[1400px] w-full mx-auto">
        {children}
      </main>
    </div>
  );
}

export function PageHeader({
  n,
  title,
  zh,
  subtitle,
  titleZh,
  subtitleZh,
  right,
}: {
  n: string;
  title: string;
  zh?: string;
  subtitle: string;
  titleZh?: string;
  subtitleZh?: string;
  right?: ReactNode;
}) {
  const { isZh } = useLocale();
  const displayTitle = isZh ? (titleZh ?? zh ?? title) : title;
  const displaySubtitle = isZh ? (subtitleZh ?? subtitle) : subtitle;

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
          {zh && (
            <>
              <span className="text-border">·</span>
              <span>{zh}</span>
            </>
          )}
        </div>
        <h1 className="mt-1 text-[26px] md:text-[30px] font-semibold tracking-tight leading-[1.1]">{displayTitle}</h1>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground max-w-2xl italic">{displaySubtitle}</p>
      </div>
      {right}
    </motion.div>
  );
}

export function CitationFooter({ extra }: { extra?: string }) {
  const { t } = useLocale();
  return (
    <footer className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-mono text-muted-foreground border-t border-border/60">
      <div>{t(shell.cited.en, shell.cited.zh)} IR (EU) 2025/2621 · Reg (EU) 2023/956 · CISA · PBOC · 工信部联节〔2026〕13号{extra ? ` · ${extra}` : ""}</div>
      <div>{t(shell.copyright.en, shell.copyright.zh)}</div>
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
