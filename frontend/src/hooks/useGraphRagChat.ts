import { useCallback, useEffect, useState } from "react";
import {
  sendGraphRagChat,
  type GraphRagChatContext,
  type GraphRagChatMessage,
} from "@/lib/api";

export type GraphRagChatUiMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

function offlineFallback(locale: "zh" | "en", graphContext: GraphRagChatContext, question: string): string {
  const burden = graphContext.math?.precursor_burden_tco2e ?? "—";
  const m = graphContext.math?.yield_factor_m ?? "—";
  const see = graphContext.math?.see_precursor_tco2e ?? "—";
  const gov = graphContext.governance?.[0];
  const govLine = gov
    ? `${gov.process_en}: direct=${gov.direct_status} (${gov.cite ?? "§3.16.2"})`
    : "";
  if (locale === "zh") {
    return (
      `（离线回退）关于「${question}」：\n` +
      `- 确定性前体负担 = ${burden} tCO₂e/t（m=${m} × SEE=${see}）。\n` +
      (govLine ? `- 治理：${govLine}。\n` : "") +
      `请启动后端以使用 Qwen 3.7 Plus 实答。`
    );
  }
  return (
    `(Offline fallback) Re: “${question}”:\n` +
    `- Deterministic precursor burden = ${burden} tCO₂e/t (m=${m} × SEE=${see}).\n` +
    (govLine ? `- Governance: ${govLine}.\n` : "") +
    `Start the backend for live Qwen 3.7 Plus replies.`
  );
}

export function useGraphRagChat(
  graphContext: GraphRagChatContext | null,
  locale: "zh" | "en",
  greeting: string,
) {
  const [messages, setMessages] = useState<GraphRagChatUiMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [modelLabel, setModelLabel] = useState("qwen/qwen3.7-plus");

  const reset = useCallback(() => {
    setMessages([{ id: `greeting-${locale}`, role: "assistant", text: greeting }]);
    setPending(false);
    setModelLabel("qwen/qwen3.7-plus");
  }, [greeting, locale]);

  useEffect(() => {
    reset();
  }, [reset, graphContext?.query, graphContext?.math?.precursor_burden_tco2e]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || pending || !graphContext) return;

      const userMsg: GraphRagChatUiMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        text: trimmed,
      };
      const history: GraphRagChatMessage[] = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.text,
      }));

      setMessages((prev) => [...prev, userMsg]);
      setPending(true);

      try {
        const result = await sendGraphRagChat({
          messages: history,
          locale,
          graphContext,
        });
        setModelLabel(result.mock ? `${result.model} · mock` : result.model);
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: "assistant", text: result.reply },
        ]);
      } catch {
        setModelLabel("qwen/qwen3.7-plus · offline");
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            text: offlineFallback(locale, graphContext, trimmed),
          },
        ]);
      } finally {
        setPending(false);
      }
    },
    [graphContext, locale, messages, pending],
  );

  return { messages, pending, modelLabel, sendMessage, reset };
}
