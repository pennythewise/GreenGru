import { createFileRoute } from "@tanstack/react-router";
import { ApiDocumentationArticle } from "@/components/ApiDocumentationArticle";

export const Route = createFileRoute("/cn/articles/full-api-documentation")({
  head: () => ({
    meta: [
      { title: "集成 API 完整文档 · GreenGru" },
      {
        name: "description",
        content:
          "Baowu/Ansteel developer reference — REST API for downstream SME Scope 1+2 emissions feeding anchor Scope 3 Category 10.",
      },
    ],
  }),
  component: ApiDocumentationArticle,
});
