import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGraphRagChat } from "@/hooks/useGraphRagChat";
import type { GraphRagChatContext } from "@/lib/api";
import { useLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

const STARTERS = {
  en: [
    "Why is CNC cutting excluded from CBAM pricing?",
    "Explain the precursor burden 2.5872 tCO₂e/t",
    "Where is the largest CBAM liability on this path?",
  ],
  zh: [
    "为什么数控切割不计入 CBAM 计价？",
    "解释前体负担 2.5872 tCO₂e/t",
    "这条证据链上最大的 CBAM 负债在哪里？",
  ],
} as const;

export function GraphRagChat({
  graphContext,
  className,
}: {
  graphContext: GraphRagChatContext;
  className?: string;
}) {
  const { isZh } = useLocale();
  const locale = isZh ? "zh" : "en";
  const greeting = isZh
    ? "我已读入当前 Graph RAG 证据路径与确定性前体算数。可追问边界、路径或数字含义——我不会编造新的受监管数值。"
    : "I’ve loaded this session’s Graph RAG evidence path and deterministic precursor math. Ask about boundaries, paths, or what the numbers mean — I won’t invent new regulated figures.";
  const { messages, pending, modelLabel, sendMessage } = useGraphRagChat(
    graphContext,
    locale,
    greeting,
  );
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const starters = STARTERS[locale];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  function handleSend(text: string) {
    void sendMessage(text);
    setInput("");
  }

  return (
    <div
      className={cn(
        "rounded-md border border-teal/35 bg-surface/40 flex flex-col min-h-[220px] max-h-[360px]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/80">
        <span className="text-[12px] font-medium">
          {isZh ? "Graph RAG 对话" : "Graph RAG chat"}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground truncate">{modelLabel}</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-[11.5px] leading-relaxed whitespace-pre-wrap",
              m.role === "user"
                ? "ml-6 bg-teal/10 text-foreground border border-teal/25"
                : "mr-4 bg-background/60 text-muted-foreground border border-border",
            )}
          >
            {m.text}
          </div>
        ))}
        {pending && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-teal">
            <Loader2 className="h-3 w-3 animate-spin" />
            {isZh ? "Qwen 生成中…" : "Qwen thinking…"}
          </div>
        )}
      </div>

      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
        {starters.map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending}
            onClick={() => handleSend(s)}
            className="text-[10px] font-mono px-2 py-1 rounded border border-border text-muted-foreground hover:border-teal/40 hover:text-teal transition disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        className="flex items-center gap-1.5 px-3 py-2 border-t border-border/80"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={pending}
          placeholder={
            isZh ? "就当前证据图提问…" : "Ask about this evidence graph…"
          }
          className="flex-1 min-w-0 bg-transparent text-[12px] outline-none placeholder:text-muted-foreground/70"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-teal/40 text-teal hover:bg-teal/10 disabled:opacity-40 transition"
          aria-label={isZh ? "发送" : "Send"}
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
