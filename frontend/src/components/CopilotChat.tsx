import { useRouterState } from "@tanstack/react-router";
import { MessagesSquare, Paperclip, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CopilotPromptBar } from "@/components/CopilotPromptBar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCopilotChat } from "@/hooks/useCopilotChat";
import { getCopilotContext } from "@/lib/copilot-context";
import { useLocale } from "@/lib/locale";
import { copilot, copilotGreetings, copilotPageLabels } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

function CopilotIcon({ size = "sm" }: { size?: "sm" | "md" }) {
  const dim = size === "md" ? "h-9 w-9 rounded-lg" : "h-7 w-7 rounded-md";
  const text = size === "md" ? "text-[18px]" : "text-[13px]";
  return (
    <div
      className={cn(dim, "flex items-center justify-center teal-glow shrink-0")}
      style={{ background: "var(--gradient-teal)" }}
    >
      <span className={cn("font-display font-bold text-[oklch(0.14_0.02_220)] leading-none", text)}>G</span>
    </div>
  );
}

export function CopilotTrigger() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const ctx = getCopilotContext(pathname);
  const { t, isZh } = useLocale();
  const greeting = t(copilotGreetings[ctx.page].en, copilotGreetings[ctx.page].zh);
  const pageLabel = t(copilotPageLabels[ctx.page].en, copilotPageLabels[ctx.page].zh);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, pending, modelLabel, sendMessage, reset } = useCopilotChat(ctx.page, greeting);

  useEffect(() => {
    if (open) reset();
  }, [ctx.page, isZh, open, reset]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 200);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  function handleSend(text: string, promptId: string | null = null) {
    void sendMessage(text, promptId);
    setInput("");
  }

  const promptMode = ctx.page === "entry" ? "routes" : "page";

  return (
    <Sheet open={open} onOpenChange={setOpen} modal={false}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={open ? t(copilot.closePanel.en, copilot.closePanel.zh) : t(copilot.openCopilot.en, copilot.openCopilot.zh)}
          aria-pressed={open}
          title={t(copilot.title.en, copilot.title.zh)}
          className={cn(
            "inline-flex items-center justify-center h-7 w-7 rounded-md border transition",
            open
              ? "border-primary/50 bg-primary/10"
              : "border-border bg-surface hover:border-primary/40 hover:bg-primary/[0.06]",
          )}
        >
          <CopilotIcon />
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        hideOverlay
        className={cn(
          "inset-y-0 right-0 left-auto h-screen w-full max-w-[440px] p-0 gap-0",
          "border-l border-border bg-popover shadow-2xl flex flex-col",
          "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
          "[&>button:first-of-type]:hidden",
        )}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={() => setOpen(false)}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-surface/60 shrink-0">
          <CopilotIcon size="md" />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold tracking-tight leading-tight">{t(copilot.title.en, copilot.title.zh)}</div>
            <div className="text-[11px] font-mono text-muted-foreground truncate">{pageLabel}</div>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground shrink-0 hidden sm:inline">{modelLabel}</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t(copilot.closePanel.en, copilot.closePanel.zh)}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-surface-2 transition shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[90%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap",
                m.role === "assistant"
                  ? "rounded-tl-sm border border-border bg-surface"
                  : "ml-auto rounded-tr-sm bg-primary/15 border border-primary/30",
              )}
            >
              {m.text}
            </div>
          ))}
          {pending && (
            <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-border bg-surface px-4 py-3 text-[13px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 animate-pulse text-teal" />
                {t(copilot.thinking.en, copilot.thinking.zh)}
              </span>
            </div>
          )}
        </div>

        <div className="px-5 pb-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-2.5">
            <MessagesSquare className="h-3 w-3 text-teal" /> {t(copilot.suggested.en, copilot.suggested.zh)}
          </div>
          <CopilotPromptBar
            mode={promptMode}
            prompts={ctx.prompts}
            disabled={pending}
            onSendPrompt={(p) => handleSend(p.label, p.id)}
          />
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-border shrink-0">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-2.5">
            <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder={t(copilot.placeholder.en, copilot.placeholder.zh)}
              className="flex-1 min-w-0 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/70"
            />
            <button
              type="button"
              disabled={!input.trim() || pending}
              onClick={() => handleSend(input)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground text-[12px] font-medium teal-glow hover:brightness-110 transition disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
