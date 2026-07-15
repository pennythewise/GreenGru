import { Banknote, Leaf, Ship } from "lucide-react";
import { useState } from "react";
import {
  COPILOT_ROUTE_CHIPS,
  ROUTE_PROMPTS,
  type CopilotPrompt,
  type CopilotRoute,
} from "@/lib/copilot-context";
import { useLocale } from "@/lib/locale";
import { copilot } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

const ROUTE_ICONS = {
  loan: Banknote,
  grant: Leaf,
  passport: Ship,
};

const ROUTE_CHIP_ZH: Record<CopilotRoute, string> = {
  loan: "贷款",
  grant: "补贴",
  passport: "欧盟许可",
};

export function CopilotPromptBar({
  mode,
  prompts,
  disabled,
  onSendPrompt,
}: {
  mode: "routes" | "page";
  prompts?: [CopilotPrompt, CopilotPrompt, CopilotPrompt];
  disabled?: boolean;
  onSendPrompt: (prompt: CopilotPrompt) => void;
}) {
  const [selectedRoute, setSelectedRoute] = useState<CopilotRoute | null>(null);
  const { isZh, t } = useLocale();

  if (mode === "routes") {
    if (!selectedRoute) {
      return (
        <div className="flex flex-wrap gap-2">
          {COPILOT_ROUTE_CHIPS.map((c) => {
            const Icon = ROUTE_ICONS[c.key];
            return (
              <button
                key={c.key}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedRoute(c.key)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-mono hover:border-primary/40 hover:bg-primary/[0.06] transition disabled:opacity-50"
              >
                <Icon className="h-3.5 w-3.5 text-teal" /> {isZh ? ROUTE_CHIP_ZH[c.key] : c.label}
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setSelectedRoute(null)}
          className="text-[11px] font-mono text-muted-foreground hover:text-foreground transition disabled:opacity-50"
        >
          {t(copilot.allRoutes.en, copilot.allRoutes.zh)}
        </button>
        <div className="flex flex-col gap-2">
          {ROUTE_PROMPTS[selectedRoute].map((p) => (
            <PromptButton key={p.id} prompt={p} disabled={disabled} onClick={() => onSendPrompt(p)} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {(prompts ?? []).map((p) => (
        <PromptButton key={p.id} prompt={p} disabled={disabled} onClick={() => onSendPrompt(p)} />
      ))}
    </div>
  );
}

function PromptButton({
  prompt,
  disabled,
  onClick,
}: {
  prompt: CopilotPrompt;
  disabled?: boolean;
  onClick: () => void;
}) {
  const { isZh } = useLocale();
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "text-left rounded-lg border border-border bg-surface/50 px-3.5 py-2.5 text-[12px]",
        "hover:border-primary/40 hover:bg-primary/[0.06] transition disabled:opacity-50",
      )}
    >
      <span className="block text-foreground">{isZh ? prompt.zh : prompt.label}</span>
      {!isZh && <span className="block mt-0.5 text-[10.5px] font-mono text-muted-foreground">{prompt.zh}</span>}
    </button>
  );
}
