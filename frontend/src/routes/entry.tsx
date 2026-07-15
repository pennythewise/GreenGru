import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  MessagesSquare,
  Paperclip,
  Send,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppShell, CitationFooter, PageHeader } from "@/components/AppShell";
import { CopilotPromptBar } from "@/components/CopilotPromptBar";
import { useCopilotChat } from "@/hooks/useCopilotChat";
import { getCopilotContext } from "@/lib/copilot-context";
import {
  buildConfirmedRoutes,
  CONFIDENCE_FLOOR,
  startRouteFlow,
} from "@/lib/route-flow";
import { resolveRouteIntent, selectionFromRoutes, type RouterRoute } from "@/lib/route-intent";
import { useLocale } from "@/lib/locale";
import { crumbs, entryPage } from "@/lib/ui-strings";
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

const ctx = getCopilotContext("/entry");

function Entry() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<RouterRoute[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [intentLoading, setIntentLoading] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t, isZh } = useLocale();
  const greeting = t(entryPage.greeting.en, entryPage.greeting.zh);
  const { messages, pending, modelLabel, sendMessage, reset } = useCopilotChat(ctx.page, greeting);
  const userTurns = messages.filter((m) => m.role === "user").length;

  useEffect(() => {
    reset();
  }, [reset, isZh]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    if (userTurns === 0) return;
    if (pending) return;

    let cancelled = false;
    setIntentLoading(true);
    const history = messages.map((m) => ({ role: m.role, content: m.text }));
    void resolveRouteIntent(history).then((next) => {
      if (cancelled) return;
      setRoutes(next);
      setSelected(selectionFromRoutes(next));
      setIntentLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [messages, pending, userTurns]);

  const confirmedCount = Object.values(selected).filter(Boolean).length;

  function handleSend(text: string, promptId: string | null = null) {
    void sendMessage(text, promptId);
    setInput("");
  }

  function handleConfirmRoutes() {
    const confirmed = buildConfirmedRoutes(selected);
    if (confirmed.length === 0) return;
    startRouteFlow(confirmed);
    void navigate({ to: `/${confirmed[0]}` });
  }

  const displayRoutes = routes.length > 0 ? routes : [
    { key: "grant" as const, label: "Grant 补贴", conf: 0.12, preSelected: false, reason: t(entryPage.chatPlaceholder.en, entryPage.chatPlaceholder.zh) },
    { key: "loan" as const, label: "Loan 贷款", conf: 0.12, preSelected: false, reason: t(entryPage.chatPlaceholder.en, entryPage.chatPlaceholder.zh) },
    { key: "passport" as const, label: "EU license CBAM", conf: 0.34, preSelected: false, reason: t(entryPage.chatPlaceholder.en, entryPage.chatPlaceholder.zh) },
  ];

  const floorPct = Math.round(CONFIDENCE_FLOOR * 100);

  return (
    <AppShell crumb={t(crumbs.entry.en, crumbs.entry.zh)}>
      <PageHeader
        n="03"
        zh="副驾"
        title={entryPage.title.en}
        titleZh={entryPage.title.zh}
        subtitle={entryPage.subtitle.en}
        subtitleZh={entryPage.subtitle.zh}
      />

      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-5 lg:items-stretch">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel p-5 flex flex-col lg:min-h-[620px]">
          <div className="flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <MessagesSquare className="h-3.5 w-3.5 text-teal" /> GreenGru {t(crumbs.entry.en, crumbs.entry.zh)}
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">{modelLabel}</span>
          </div>

          <div ref={scrollRef} className="mt-4 flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap",
                  m.role === "assistant"
                    ? "rounded-tl-sm border border-border bg-surface"
                    : "ml-auto rounded-tr-sm bg-primary/15 border border-primary/30",
                )}
              >
                {m.text}
              </div>
            ))}
            {pending && (
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-border bg-surface px-3.5 py-2.5 text-[13px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse text-teal" />
                  {t(entryPage.thinking.en, entryPage.thinking.zh)}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 shrink-0">
            <CopilotPromptBar
              mode="routes"
              disabled={pending}
              onSendPrompt={(p) => handleSend(p.label, p.id)}
            />
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-2 shrink-0">
            <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder={t(entryPage.describeGoal.en, entryPage.describeGoal.zh)}
              className="flex-1 min-w-0 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/70"
            />
            <button
              type="button"
              disabled={!input.trim() || pending}
              onClick={() => handleSend(input)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium teal-glow hover:brightness-110 transition disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" /> {t(entryPage.send.en, entryPage.send.zh)}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="panel p-5 flex flex-col lg:min-h-[620px]">
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> {t(entryPage.routerTitle.en, entryPage.routerTitle.zh)}
            </div>
            <span className="text-[10.5px] font-mono text-muted-foreground">
              qwen3.7-plus · {isZh ? "阈值" : "floor"} {floorPct}%
              {intentLoading && ` · ${t(entryPage.updating.en, entryPage.updating.zh)}`}
            </span>
          </div>

          <ul className="mt-3 space-y-2 shrink-0">
            {displayRoutes.map((r) => {
              const on = selected[r.key] ?? r.preSelected;
              const above = r.conf >= CONFIDENCE_FLOOR;
              return (
                <li
                  key={r.key}
                  className={cn(
                    "rounded-lg border p-3 cursor-pointer transition",
                    on
                      ? "border-primary/50 bg-primary/[0.08]"
                      : "border-border bg-surface/50 hover:bg-surface-2",
                  )}
                  onClick={() => setSelected((prev) => ({ ...prev, [r.key]: !on }))}
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
                      "text-[10.5px] font-mono px-1.5 py-0.5 rounded border tabular-nums",
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
            <span className="text-foreground font-medium">{t(entryPage.whyConfirm.en, entryPage.whyConfirm.zh)}</span>{" "}
            {isZh ? entryPage.whyConfirmBody.zh(floorPct) : entryPage.whyConfirmBody.en(floorPct)}
          </div>

          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="text-[12px] font-mono text-muted-foreground hover:text-foreground"
                onClick={() => setSelected(selectionFromRoutes(displayRoutes))}
              >
                {t(entryPage.resetRouter.en, entryPage.resetRouter.zh)}
              </button>
              <button
                type="button"
                disabled={confirmedCount === 0}
                onClick={handleConfirmRoutes}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-[12.5px] font-medium transition",
                  confirmedCount > 0
                    ? "bg-primary text-primary-foreground teal-glow hover:brightness-110"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
              >
                {isZh ? entryPage.confirmRoutes.zh(confirmedCount) : entryPage.confirmRoutes.en(confirmedCount)}{" "}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <CitationFooter extra="PBOC 2025 · GB/T 36132 · Reg (EU) 2023/956" />
    </AppShell>
  );
}
