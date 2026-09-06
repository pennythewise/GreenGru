import { useCallback, useRef, useState } from "react";
import { routeStrip } from "@/lib/dashboard-data";
import {
  assertCarbonPassportBackend,
  fetchGraphRagGraph,
  queryGraphRag,
  queryRag,
  runCbamScore,
  runGrantScore,
  runLoanScore,
  type CbamScoreResult,
  type GrantScoreResult,
  type GraphRagEdge,
  type GraphRagNode,
  type GraphRagQueryResult,
  type LoanScoreResult,
  type RagChannel,
  type RagQueryResult,
} from "@/lib/api";
import { MOCK_GRAPH_PAYLOAD, MOCK_QUERY_RESULT } from "@/lib/graph-rag-mock";
import { collectCbamScoreInputs } from "@/lib/cbam-score-inputs";
import { collectGrantScoreInputs } from "@/lib/grant-score-inputs";
import { collectLoanScoreInputs } from "@/lib/loan-score-inputs";

export type PipelineStageStatus = "pending" | "loading" | "done";

export type PipelineStage = {
  n: number;
  key: string;
  zh: string;
  method: string;
  status: PipelineStageStatus;
  elapsed: string | null;
};

const STAGE_DURATIONS_MS = [400, 1200, 650, 900, 4200];

const CBAM_PRESREEN_QUERY =
  "CBAM installation operator obligations monitoring methodology default values iron and steel reporting to EU importer";

const GRANT_PRESREEN_QUERY =
  "绿色工厂评价 评价指标 废钢比 绿色电力 计量覆盖 固废利用 申报材料要求";

const LOAN_PRESREEN_QUERY =
  "绿色金融支持项目目录 钢铁 废钢 绿色工厂 贷款用途 项目类别 申报材料 计量";

const GRAPH_RAG_ADVISORY_QUERY =
  "我们用宝武热轧板加工紧固件。数控切割和焊接需要核算哪些排放？最大的 CBAM 负债在哪里？镀锌如何对齐 STM BAT？";

function emptyRag(channel: RagChannel, query: string): RagQueryResult {
  return {
    channel,
    query,
    hit_count: 0,
    chunks: [],
    prompt_block: "",
    confidence_score: 0,
    threshold: 0.7,
    passes_threshold: false,
    form_chunks_scored: 0,
    upload_chunks_scored: 0,
  };
}

function readApplicationForm(slug: "loan" | "grant"): unknown | null {
  try {
    const raw = localStorage.getItem(`greengru-application-${slug}`);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function initialStages(kb: string, slug?: "loan" | "grant" | "passport"): PipelineStage[] {
  return routeStrip(kb, slug).map((s) => ({
    n: s.n,
    key: s.key,
    zh: s.zh,
    method: s.method,
    status: (s.status === "done" ? "done" : "pending") as PipelineStageStatus,
    elapsed: s.elapsed,
  }));
}

function formatElapsed(ms: number) {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export function useRoutePipeline(
  kb: string,
  slug?: "loan" | "grant" | "passport",
  uploadSessionId?: string,
) {
  const [stages, setStages] = useState<PipelineStage[]>(() => initialStages(kb, slug));
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [grantScore, setGrantScore] = useState<GrantScoreResult | null>(null);
  const [loanScore, setLoanScore] = useState<LoanScoreResult | null>(null);
  const [cbamScore, setCbamScore] = useState<CbamScoreResult | null>(null);
  const [cbamRag, setCbamRag] = useState<RagQueryResult | null>(null);
  const [grantRag, setGrantRag] = useState<RagQueryResult | null>(null);
  const [loanRag, setLoanRag] = useState<RagQueryResult | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [ragError, setRagError] = useState<string | null>(null);
  const [graphRagPhase, setGraphRagPhase] = useState<"idle" | "building" | "ready">("idle");
  const [graphRagNodes, setGraphRagNodes] = useState<GraphRagNode[]>([]);
  const [graphRagEdges, setGraphRagEdges] = useState<GraphRagEdge[]>([]);
  const [graphRagResult, setGraphRagResult] = useState<GraphRagQueryResult | null>(null);
  const abortRef = useRef(false);

  const reset = useCallback(() => {
    abortRef.current = true;
    setStages(
      routeStrip(kb, slug).map((s) => ({
        n: s.n,
        key: s.key,
        zh: s.zh,
        method: s.method,
        status: "pending" as const,
        elapsed: null,
      })),
    );
    setComplete(false);
    setRunning(false);
    setGrantScore(null);
    setLoanScore(null);
    setCbamScore(null);
    setCbamRag(null);
    setGrantRag(null);
    setLoanRag(null);
    setScoreError(null);
    setRagError(null);
    setGraphRagPhase("idle");
    setGraphRagNodes([]);
    setGraphRagEdges([]);
    setGraphRagResult(null);
  }, [kb, slug]);

  const runPipeline = useCallback(async (): Promise<PipelineStage[]> => {
    if (running) return stages;
    abortRef.current = false;
    setRunning(true);
    setComplete(false);
    setGrantScore(null);
    setLoanScore(null);
    setCbamScore(null);
    setCbamRag(null);
    setGrantRag(null);
    setLoanRag(null);
    setScoreError(null);
    setRagError(null);
    setGraphRagPhase("idle");
    setGraphRagNodes([]);
    setGraphRagEdges([]);
    setGraphRagResult(null);

    try {
      await assertCarbonPassportBackend();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Backend not reachable";
      setRagError(msg);
      setScoreError(msg);
      setRunning(false);
      return stages;
    }

    const meta = routeStrip(kb, slug);
    let current: PipelineStage[] = meta.map((s) => ({
      n: s.n,
      key: s.key,
      zh: s.zh,
      method: s.method,
      status: "pending",
      elapsed: null,
    }));
    setStages(current);

    for (let i = 0; i < meta.length; i++) {
      if (abortRef.current) break;
      const idx = i;
      const duration = STAGE_DURATIONS_MS[i] ?? 800;

      current = current.map((s, j) =>
        j === idx ? { ...s, status: "loading", elapsed: null } : s,
      );
      setStages(current);

      const start = performance.now();

      if (slug === "passport" && meta[idx]?.n === 1) {
        try {
          const rag = await queryRag({
            channel: "cbam",
            query: CBAM_PRESREEN_QUERY,
            k: 3,
            language: "en",
            uploadSessionId: uploadSessionId || null,
            source: "hybrid",
            timeoutMs: 45_000,
          });
          setCbamRag(rag);
        } catch (err) {
          setRagError(err instanceof Error ? err.message : "CBAM RAG failed");
          setCbamRag(emptyRag("cbam", CBAM_PRESREEN_QUERY));
        }
        await new Promise((r) => setTimeout(r, Math.max(duration, 400)));
      } else if (slug === "grant" && meta[idx]?.n === 1) {
        try {
          const rag = await queryRag({
            channel: "grant",
            query: GRANT_PRESREEN_QUERY,
            k: 3,
            language: "zh",
            uploadSessionId: uploadSessionId || null,
            source: "hybrid",
            applicationForm: readApplicationForm("grant"),
            timeoutMs: 90_000,
          });
          setGrantRag(rag);
        } catch (err) {
          setRagError(err instanceof Error ? err.message : "Grant RAG failed");
          setGrantRag(emptyRag("grant", GRANT_PRESREEN_QUERY));
        }
        await new Promise((r) => setTimeout(r, Math.max(duration, 400)));
      } else if (slug === "loan" && meta[idx]?.n === 1) {
        try {
          const rag = await queryRag({
            channel: "loan",
            query: LOAN_PRESREEN_QUERY,
            k: 3,
            language: "zh",
            uploadSessionId: uploadSessionId || null,
            source: "hybrid",
            applicationForm: readApplicationForm("loan"),
            timeoutMs: 90_000,
          });
          setLoanRag(rag);
        } catch (err) {
          setRagError(err instanceof Error ? err.message : "Loan RAG failed");
          setLoanRag(emptyRag("loan", LOAN_PRESREEN_QUERY));
        }
        await new Promise((r) => setTimeout(r, Math.max(duration, 400)));
      } else if (slug === "grant" && meta[idx]?.n === 3) {
        try {
          const inputs = collectGrantScoreInputs();
          const score = await runGrantScore({
            scrap_ratio_pct: inputs.scrap_ratio_pct,
            green_electricity_pct: inputs.green_electricity_pct,
            intensity_tco2e_per_t: inputs.intensity_tco2e_per_t,
            metering_pct: inputs.metering_pct,
            water_reuse_pct: inputs.water_reuse_pct,
            solid_waste_util_pct: inputs.solid_waste_util_pct,
            production_tonnes: inputs.production_tonnes,
            checklist: inputs.checklist,
            application_form: inputs.application_form,
          });
          setGrantScore(score);
        } catch (err) {
          setScoreError(err instanceof Error ? err.message : "Grant score failed");
        }
        await new Promise((r) => setTimeout(r, Math.max(duration, 600)));
      } else if (slug === "loan" && meta[idx]?.n === 3) {
        try {
          const inputs = collectLoanScoreInputs();
          const score = await runLoanScore(inputs);
          setLoanScore(score);
        } catch (err) {
          setScoreError(err instanceof Error ? err.message : "Loan score failed");
        }
        await new Promise((r) => setTimeout(r, Math.max(duration, 600)));
      } else if (slug === "passport" && meta[idx]?.n === 3) {
        try {
          const inputs = collectCbamScoreInputs();
          const score = await runCbamScore(inputs);
          setCbamScore(score);
        } catch (err) {
          setScoreError(err instanceof Error ? err.message : "CBAM score failed");
        }
        await new Promise((r) => setTimeout(r, Math.max(duration, 600)));
      } else if (slug === "passport" && meta[idx]?.n === 5) {
        setGraphRagPhase("building");
        try {
          const [graph, query] = await Promise.all([
            fetchGraphRagGraph(),
            queryGraphRag({
              query: GRAPH_RAG_ADVISORY_QUERY,
              locale: "zh",
              includeFullLayout: true,
            }),
          ]);
          setGraphRagNodes(query.full_graph?.nodes?.length ? query.full_graph.nodes : graph.nodes);
          setGraphRagEdges(query.full_graph?.edges?.length ? query.full_graph.edges : graph.edges);
          setGraphRagResult(query);
        } catch (err) {
          setRagError(err instanceof Error ? err.message : "Graph RAG failed");
          setGraphRagNodes(MOCK_GRAPH_PAYLOAD.nodes);
          setGraphRagEdges(MOCK_GRAPH_PAYLOAD.edges);
          setGraphRagResult(MOCK_QUERY_RESULT);
        }
        // Let the 3D reveal finish (~revealOrder * REVEAL_MS)
        await new Promise((r) => setTimeout(r, Math.max(duration, 3200)));
        if (!abortRef.current) setGraphRagPhase("ready");
      } else {
        await new Promise((r) => setTimeout(r, duration));
      }

      const elapsed = formatElapsed(Math.round(performance.now() - start));

      if (abortRef.current) break;

      current = current.map((s, j) =>
        j === idx ? { ...s, status: "done", elapsed } : s,
      );
      setStages(current);
    }

    if (!abortRef.current) {
      setComplete(true);
    }
    setRunning(false);
    return current;
  }, [kb, running, stages, slug, uploadSessionId]);

  return {
    stages,
    running,
    complete,
    runPipeline,
    reset,
    grantScore,
    loanScore,
    cbamScore,
    cbamRag,
    grantRag,
    loanRag,
    scoreError,
    ragError,
    graphRagPhase,
    graphRagNodes,
    graphRagEdges,
    graphRagResult,
  };
}
