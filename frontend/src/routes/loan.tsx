import { createFileRoute } from "@tanstack/react-router";
import { RoutePage, type RouteTab } from "@/components/RoutePage";

function parseRouteTab(raw: unknown): RouteTab {
  if (raw === "pipeline") return "pipeline";
  return "form";
}

export const Route = createFileRoute("/loan")({
  validateSearch: (search: Record<string, unknown>): { tab: RouteTab } => ({
    tab: parseRouteTab(search.tab),
  }),
  head: () => ({
    meta: [
      { title: "Green loan · GreenGru" },
      {
        name: "description",
        content:
          "Green-loan application form tab and route pipeline preview on PBOC 2025 Green Finance Catalogue.",
      },
    ],
  }),
  component: LoanPage,
});

function LoanPage() {
  const { tab } = Route.useSearch();
  return <RoutePage slug="loan" routeTab={tab} />;
}
