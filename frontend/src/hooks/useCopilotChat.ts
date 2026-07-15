import { useCallback, useState } from "react";
import { sendCopilotChat } from "@/lib/api";
import { getCopilotReply, type CopilotPage } from "@/lib/copilot-context";

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

export function useCopilotChat(page: CopilotPage, greeting: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [modelLabel, setModelLabel] = useState("qwen3.7-plus");

  const reset = useCallback(() => {
    setMessages([{ id: `greeting-${page}`, role: "assistant", text: greeting }]);
    setPending(false);
  }, [page, greeting]);

  const sendMessage = useCallback(
    async (text: string, promptId: string | null = null) => {
      const trimmed = text.trim();
      if (!trimmed || pending) return;

      const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: trimmed };
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.text,
      }));

      setMessages((prev) => [...prev, userMsg]);
      setPending(true);

      try {
        const result = await sendCopilotChat({
          page,
          message: trimmed,
          promptId,
          history: history.slice(0, -1),
        });
        setModelLabel(result.mock ? `${result.model} · mock` : result.model);
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: "assistant", text: result.reply },
        ]);
      } catch {
        const fallback = getCopilotReply(page, promptId, trimmed);
        setModelLabel("qwen3.7-plus · offline fallback");
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: "assistant", text: fallback },
        ]);
      } finally {
        setPending(false);
      }
    },
    [messages, page, pending],
  );

  return { messages, pending, modelLabel, sendMessage, reset };
}
