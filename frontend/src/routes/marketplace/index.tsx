import { createFileRoute } from "@tanstack/react-router";
import { MarketplaceDashboard } from "@/components/MarketplaceDashboard";

export const Route = createFileRoute("/marketplace/")({
  head: () => ({
    meta: [
      { title: "Marketplace · GreenGru" },
      {
        name: "description",
        content:
          "Procurement recommendations ranked against your factory's own carbon gap analysis.",
      },
    ],
  }),
  component: MarketplaceDashboard,
});
