import { createFileRoute } from "@tanstack/react-router";
import { UpstreamDashboard } from "@/components/UpstreamDashboard";

export const Route = createFileRoute("/upstream")({
  head: () => ({
    meta: [
      { title: "Upstream portfolio · GreenGru" },
      { name: "description", content: "Baowu/Ansteel account-manager view — aggregate CISA tier and verified totals across downstream suppliers." },
    ],
  }),
  component: UpstreamDashboard,
});
