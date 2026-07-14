import { createFileRoute } from "@tanstack/react-router";
import { RoutePage } from "@/components/RoutePage";

export const Route = createFileRoute("/grant")({
  head: () => ({
    meta: [
      { title: "Green factory grant · GreenGru" },
      { name: "description", content: "Zero-carbon factory grant preview built on GB/T 36132 and 工信部联节〔2026〕13号." },
    ],
  }),
  component: () => <RoutePage slug="grant" />,
});
