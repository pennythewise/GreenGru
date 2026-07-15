import { useRouterState } from "@tanstack/react-router";
import { MessagesSquare, Paperclip, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  getCopilotContext,
  getCopilotReply,
  type CopilotPrompt,
} from "@/lib/copilot-context";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

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
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setMessages([{ id: `greeting-${ctx.page}`, role: "assistant", text: ctx.greeting }]);
    setPending(false);
  }, [ctx.page, ctx.greeting, open]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 200);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  function sendMessage(text: string, promptId: string | null = null) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setPending(true);

    window.setTimeout(() => {
      const reply = getCopilotReply(ctx.page, promptId, trimmed);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", text: reply },
      ]);
      setPending(false);
    }, 450);
  }

  function handlePrompt(prompt: CopilotPrompt) {
    sendMessage(prompt.label, prompt.id);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen} modal={false}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={open ? "Close GreenGru Copilot" : "Open GreenGru Copilot"}
          aria-pressed={open}
          title="GreenGru Copilot"
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
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-surface/60 shrink-0">
          <CopilotIcon size="md" />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold tracking-tight leading-tight">GreenGru Copilot</div>
            <div className="text-[11px] font-mono text-muted-foreground truncate">{ctx.pageLabel}</div>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground shrink-0 hidden sm:inline">qwen-plus</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close copilot panel"
            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-surface-2 transition shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[90%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed",
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
                Thinking…
              </span>
            </div>
          )}
        </div>

        {/* Suggested prompts */}
        <div className="px-5 pb-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-2.5">
            <MessagesSquare className="h-3 w-3 text-teal" /> Suggested
          </div>
          <div className="flex flex-col gap-2">
            {ctx.prompts.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={pending}
                onClick={() => handlePrompt(p)}
                className="text-left rounded-lg border border-border bg-surface/50 px-3.5 py-2.5 text-[12px] hover:border-primary/40 hover:bg-primary/[0.06] transition disabled:opacity-50"
              >
                <span className="block text-foreground">{p.label}</span>
                <span className="block mt-0.5 text-[10.5px] font-mono text-muted-foreground">{p.zh}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
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
                  sendMessage(input);
                }
              }}
              placeholder="Ask while you fill in… · 边填边问"
              className="flex-1 min-w-0 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/70"
            />
            <button
              type="button"
              disabled={!input.trim() || pending}
              onClick={() => sendMessage(input)}
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
