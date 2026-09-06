import { createFileRoute } from "@tanstack/react-router";
import { RoutePage, type RouteTab } from "@/components/RoutePage";

function parseRouteTab(raw: unknown): RouteTab {
  if (raw === "pipeline") return "pipeline";
  return "form";
}

export const Route = createFileRoute("/passport")({
  validateSearch: (search: Record<string, unknown>): { tab: RouteTab } => ({
    tab: parseRouteTab(search.tab),
  }),
  head: () => ({
    meta: [
      { title: "EU license (CBAM) · GreenGru" },
      {
        name: "description",
        content:
          "CBAM EU license — evaluation form tab and route pipeline / Graph RAG tab.",
      },
    ],
  }),
  component: PassportPage,
});

function PassportPage() {
  const { tab } = Route.useSearch();
  return <RoutePage slug="passport" routeTab={tab} />;
}
