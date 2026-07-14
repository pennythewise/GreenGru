import { createFileRoute } from "@tanstack/react-router";
import { RoutePage } from "@/components/RoutePage";

export const Route = createFileRoute("/loan")({
  head: () => ({
    meta: [
      { title: "Green loan · GreenGru" },
      { name: "description", content: "Green-loan preview and advisory built on PBOC 2025 Green Finance Catalogue." },
    ],
  }),
  component: () => <RoutePage slug="loan" />,
});
