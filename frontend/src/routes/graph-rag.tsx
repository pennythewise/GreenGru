import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { GraphRagVisualizer } from "@/components/GraphRagVisualizer";
import { useLocale } from "@/lib/locale";
import { crumbs } from "@/lib/ui-strings";

export const Route = createFileRoute("/graph-rag")({
  head: () => ({
    meta: [
      { title: "Graph RAG · GreenGru" },
      {
        name: "description",
        content:
          "Industrial metallurgical & regulatory Graph RAG for CBAM advisory — Baowu lineage, §3.16.2 boundaries, 十五五 policy.",
      },
    ],
  }),
  component: GraphRagPage,
});

function GraphRagPage() {
  const { t } = useLocale();
  return (
    <AppShell crumb={t(crumbs.graphRag.en, crumbs.graphRag.zh)}>
      <GraphRagVisualizer />
    </AppShell>
  );
}
