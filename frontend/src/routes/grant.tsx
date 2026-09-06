import { createFileRoute } from "@tanstack/react-router";
import { RoutePage, type RouteTab } from "@/components/RoutePage";

function parseRouteTab(raw: unknown): RouteTab {
  if (raw === "pipeline") return "pipeline";
  return "form";
}

export const Route = createFileRoute("/grant")({
  validateSearch: (search: Record<string, unknown>): { tab: RouteTab } => ({
    tab: parseRouteTab(search.tab),
  }),
  head: () => ({
    meta: [
      { title: "Green factory grant · GreenGru" },
      {
        name: "description",
        content:
          "Green factory grant application form tab and route pipeline on GB/T 36132 and 工信部联节〔2026〕13号.",
      },
    ],
  }),
  component: GrantPage,
});

function GrantPage() {
  const { tab } = Route.useSearch();
  return <RoutePage slug="grant" routeTab={tab} />;
}
