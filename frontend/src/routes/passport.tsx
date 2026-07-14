import { createFileRoute } from "@tanstack/react-router";
import { RoutePage } from "@/components/RoutePage";

export const Route = createFileRoute("/passport")({
  head: () => ({
    meta: [
      { title: "EU license (CBAM) · GreenGru" },
      { name: "description", content: "CBAM readiness — benchmark gap, gap list, and PDF preview built on Reg (EU) 2023/956." },
    ],
  }),
  component: () => <RoutePage slug="passport" />,
});
