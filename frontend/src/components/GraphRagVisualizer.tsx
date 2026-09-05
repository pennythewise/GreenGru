import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  GitBranch,
  Loader2,
  Play,
  Network,
  Scale,
  Calculator,
  Maximize2,
  Minimize2,
  MessageSquareText,
  ListChecks,
} from "lucide-react";
import {
  fetchGraphRagGraph,
  queryGraphRag,
  type GraphRagEdge,
  type GraphRagNode,
  type GraphRagQueryResult,
} from "@/lib/api";
import { MOCK_GRAPH_PAYLOAD, MOCK_QUERY_RESULT } from "@/lib/graph-rag-mock";
import { buildViewAdvisory, type GraphViewAlgo } from "@/lib/graph-rag-advisory";
import { useLocale } from "@/lib/locale";
import { graphRagPage } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

const GraphRagScene = lazy(() =>
  import("@/components/GraphRagScene").then((m) => ({ default: m.GraphRagScene })),
);

const LAYER_LEGEND = [
  { layer: "process", en: "Process", zh: "工艺", color: "#0d9488" },
  { layer: "material", en: "Material", zh: "物料", color: "#2563eb" },
  { layer: "customs", en: "CN code", zh: "海关编码", color: "#ca8a04" },
  { layer: "boundary", en: "CBAM boundary", zh: "CBAM 边界", color: "#dc2626" },
  { layer: "policy", en: "十五五 policy", zh: "十五五政策", color: "#7c3aed" },
  { layer: "emission", en: "Emission", zh: "排放源", color: "#64748b" },
] as const;

const DEFAULT_PATH = [
  "proc_blast_furnace",
  "proc_bof",
  "mat_crude_steel_slab",
  "proc_hot_rolling",
  "mat_hot_rolled_plate",
  "mat_fastener_bolt",
  "cn_7318_15_88",
] as const;

const LOCAL_SEEDS = ["mat_hot_rolled_plate", "proc_cnc_cutting", "cn_7318_15_88"] as const;

function SceneFallback({ isZh }: { isZh: boolean }) {
  return (
    <div className="h-[480px] rounded-lg border border-border bg-[#0d1319] flex items-center justify-center">
      <span className="text-[11px] font-mono text-muted-foreground animate-pulse">
        {isZh ? "3D 知识图谱加载中…" : "Loading 3D knowledge graph…"}
      </span>
    </div>
  );
}

/** Edges that connect consecutive nodes on any of the given paths. */
function edgesAlongPaths(
  edges: GraphRagEdge[],
  paths: Array<{ node_ids: string[] }>,
): GraphRagEdge[] {
  const pairs = new Set<string>();
  for (const p of paths) {
    const ids = p.node_ids ?? [];
    for (let i = 0; i < ids.length - 1; i++) {
      pairs.add(`${ids[i]}|${ids[i + 1]}`);
      pairs.add(`${ids[i + 1]}|${ids[i]}`);
    }
  }
  return edges.filter((e) => pairs.has(`${e.source}|${e.target}`));
}

/** Undirected k-hop neighborhood from seed ids over the full edge list. */
function localSlice(
  nodes: GraphRagNode[],
  edges: GraphRagEdge[],
  seeds: string[],
  hops: number,
): { nodes: GraphRagNode[]; edges: GraphRagEdge[] } {
  const adj = new Map<string, Set<string>>();
  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, new Set());
    if (!adj.has(e.target)) adj.set(e.target, new Set());
    adj.get(e.source)!.add(e.target);
    adj.get(e.target)!.add(e.source);
  }
  const keep = new Set<string>();
  let frontier = new Set(seeds.filter((id) => nodes.some((n) => n.id === id)));
  for (const id of frontier) keep.add(id);
  for (let h = 0; h < hops; h++) {
    const next = new Set<string>();
    for (const id of frontier) {
      for (const nb of adj.get(id) ?? []) {
        if (!keep.has(nb)) {
          keep.add(nb);
          next.add(nb);
        }
      }
    }
    frontier = next;
  }
  return {
    nodes: nodes.filter((n) => keep.has(n.id)),
    edges: edges.filter((e) => keep.has(e.source) && keep.has(e.target)),
  };
}

export function GraphRagVisualizer() {
  const { isZh, t } = useLocale();
  const [fullNodes, setFullNodes] = useState<GraphRagNode[]>([]);
  const [fullEdges, setFullEdges] = useState<GraphRagEdge[]>([]);
  const [stats, setStats] = useState<{ nodes: number; edges: number } | null>(null);
  const [result, setResult] = useState<GraphRagQueryResult | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [algo, setAlgo] = useState<GraphViewAlgo>("shortest");
  const [expanded, setExpanded] = useState(false);
  const [briefed, setBriefed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const g = await fetchGraphRagGraph();
        if (cancelled) return;
        setFullNodes(g.nodes);
        setFullEdges(g.edges);
        setStats({ nodes: g.stats.nodes, edges: g.stats.edges });
      } catch (e) {
        if (cancelled) return;
        setFullNodes(MOCK_GRAPH_PAYLOAD.nodes);
        setFullEdges(MOCK_GRAPH_PAYLOAD.edges);
        setStats({ nodes: MOCK_GRAPH_PAYLOAD.stats.nodes, edges: MOCK_GRAPH_PAYLOAD.stats.edges });
        setError(
          `${e instanceof Error ? e.message : String(e)} — showing simulated graph`,
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setQuery(
      isZh
        ? "我们用宝武热轧板加工紧固件。数控切割和焊接需要核算哪些排放？最大的 CBAM 负债在哪里？"
        : "We fabricate fasteners from Baowu hot-rolled plate. What emissions for CNC cutting and welding, and where is our biggest CBAM liability?",
    );
  }, [isZh]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  const runQuery = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await queryGraphRag({
        query,
        locale: isZh ? "zh" : "en",
        includeFullLayout: false,
      });
      setResult(out);
      setBriefed(true);
    } catch (e) {
      const mock: GraphRagQueryResult = {
        ...MOCK_QUERY_RESULT,
        query,
        locale: isZh ? "zh" : "en",
      };
      setResult(mock);
      setBriefed(true);
      setError(
        `${e instanceof Error ? e.message : String(e)} — showing simulated answer`,
      );
    } finally {
      setLoading(false);
    }
  }, [query, isZh]);

  /** Three distinct diagram slices (previously all shared one subgraph). */
  const view = useMemo(() => {
    const pos = new Map(fullNodes.map((n) => [n.id, n]));
    const withCoords = (nodes: GraphRagNode[]) =>
      nodes.map((n) => {
        const p = pos.get(n.id);
        return p ? { ...n, x: p.x, y: p.y } : n;
      });

    if (algo === "full") {
      return {
        nodes: fullNodes,
        edges: fullEdges,
        highlightIds: new Set<string>(),
        endpointIds: result?.subgraph?.endpoint_ids ?? [],
        label: isZh ? "全本体" : "Full ontology",
      };
    }

    if (algo === "shortest") {
      const paths =
        result?.paths?.length
          ? result.paths.slice(0, 2)
          : [{ node_ids: [...DEFAULT_PATH] }];
      const idSet = new Set(paths.flatMap((p) => p.node_ids ?? []));
      const fromSub = result?.subgraph?.nodes?.filter((n) => idSet.has(n.id)) ?? [];
      const nodes = withCoords(
        fromSub.length ? fromSub : fullNodes.filter((n) => idSet.has(n.id)),
      );
      const edges = edgesAlongPaths(
        fullEdges.length ? fullEdges : (result?.subgraph?.edges ?? []),
        paths,
      );
      const first = paths[0]?.node_ids ?? [];
      return {
        nodes,
        edges,
        highlightIds: idSet,
        endpointIds: [first[0], first[first.length - 1]].filter(Boolean) as string[],
        label: isZh ? "最短路径" : "Shortest path",
      };
    }

    // local subgraph — 2-hop neighborhood (query result) or client-side slice
    if (result?.subgraph?.nodes?.length) {
      return {
        nodes: withCoords(result.subgraph.nodes),
        edges: result.subgraph.edges,
        highlightIds: new Set(result.subgraph.endpoint_ids ?? []),
        endpointIds: result.subgraph.endpoint_ids ?? [],
        label: isZh ? "局部子图" : "Local subgraph",
      };
    }
    const sliced = localSlice(fullNodes, fullEdges, [...LOCAL_SEEDS], 2);
    return {
      nodes: sliced.nodes,
      edges: sliced.edges,
      highlightIds: new Set(LOCAL_SEEDS),
      endpointIds: [...LOCAL_SEEDS],
      label: isZh ? "局部子图" : "Local subgraph",
    };
  }, [algo, fullNodes, fullEdges, result, isZh]);

  const answer = result ? (isZh ? result.answer_zh : result.answer_en) : "";

  const advisory = useMemo(
    () =>
      buildViewAdvisory({
        algo,
        query,
        result,
        nodeCount: view.nodes.length,
        edgeCount: view.edges.length,
      }),
    [algo, query, result, view.nodes.length, view.edges.length],
  );

  const scene = (
    <ClientOnly fallback={<SceneFallback isZh={isZh} />}>
      <Suspense fallback={<SceneFallback isZh={isZh} />}>
        <GraphRagScene
          key={`${algo}-${view.nodes.length}-${view.edges.length}`}
          nodes={view.nodes}
          edges={view.edges}
          endpointIds={view.endpointIds}
          highlightIds={view.highlightIds}
          isZh={isZh}
          showAllEdgeLabels={algo === "shortest" || (algo === "local" && view.edges.length <= 24)}
          fullscreen={expanded}
        />
      </Suspense>
    </ClientOnly>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            <Network className="h-3.5 w-3.5 text-primary" />
            {t(graphRagPage.eyebrow.en, graphRagPage.eyebrow.zh)}
          </div>
          <h1 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight">
            {t(graphRagPage.title.en, graphRagPage.title.zh)}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground max-w-2xl leading-relaxed">
            {t(graphRagPage.subtitle.en, graphRagPage.subtitle.zh)}
          </p>
        </div>
        {stats && (
          <div className="flex gap-3 text-[11px] font-mono text-muted-foreground">
            <span>{t(graphRagPage.nodes.en, graphRagPage.nodes.zh)} {stats.nodes}</span>
            <span>{t(graphRagPage.edges.en, graphRagPage.edges.zh)} {stats.edges}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {LAYER_LEGEND.map((l) => (
          <span
            key={l.layer}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground px-2 py-1 rounded-md border border-border bg-surface"
          >
            <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
            {isZh ? l.zh : l.en}
          </span>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground">
              {t(graphRagPage.algo.en, graphRagPage.algo.zh)}
            </span>
            {(
              [
                ["shortest", graphRagPage.algoShortest],
                ["local", graphRagPage.algoLocal],
                ["full", graphRagPage.algoFull],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setAlgo(key)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[12px] border transition",
                  algo === key
                    ? "bg-primary/15 border-primary/40 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {t(label.en, label.zh)}
              </button>
            ))}
            <span className="text-[11px] font-mono text-muted-foreground px-2">
              {view.label}: {view.nodes.length} {isZh ? "节点" : "nodes"} · {view.edges.length}{" "}
              {isZh ? "边" : "edges"}
            </span>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] border border-border text-muted-foreground hover:text-foreground"
            >
              {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              {isZh ? (expanded ? "收起" : "全屏") : expanded ? "Exit" : "Fullscreen"}
            </button>
          </div>

          {expanded ? (
            <div
              className="fixed inset-0 z-50 bg-background/90 p-4 md:p-6 flex flex-col gap-3"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-mono text-muted-foreground">
                  {isZh ? "3D Graph RAG · Esc 退出" : "3D Graph RAG · Esc to exit"}
                </span>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] border border-border"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                  {isZh ? "收起" : "Exit"}
                </button>
              </div>
              <div className="flex-1 min-h-0">{scene}</div>
            </div>
          ) : (
            scene
          )}

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t(graphRagPage.canvasHint.en, graphRagPage.canvasHint.zh)}
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-[12px] font-medium text-foreground">
            {t(graphRagPage.queryLabel.en, graphRagPage.queryLabel.zh)}
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          <button
            type="button"
            onClick={runQuery}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-foreground text-background text-[13px] font-medium disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {t(graphRagPage.run.en, graphRagPage.run.zh)}
          </button>
          {error && <p className="text-[12px] text-destructive">{error}</p>}

          {briefed && (
            <motion.div
              key={algo}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="rounded-md border border-primary/30 bg-primary/5 p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                  <MessageSquareText className="h-3.5 w-3.5 text-primary" />
                  {t(graphRagPage.advisory.en, graphRagPage.advisory.zh)}
                  <span className="ml-auto normal-case tracking-normal text-foreground/80">
                    {isZh ? advisory.viewLabelZh : advisory.viewLabelEn}
                  </span>
                </div>
                <div className="rounded-md border border-border/80 bg-background/70 px-2.5 py-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {t(graphRagPage.yourQuery.en, graphRagPage.yourQuery.zh)}
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-foreground">{advisory.query}</p>
                </div>
                <h3 className="text-[13px] font-semibold text-foreground">
                  {isZh ? advisory.headlineZh : advisory.headlineEn}
                </h3>
                <pre className="whitespace-pre-wrap text-[12.5px] leading-relaxed font-sans text-foreground/95">
                  {isZh ? advisory.bodyZh : advisory.bodyEn}
                </pre>
                <div className="pt-1 border-t border-border/70">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5">
                    <ListChecks className="h-3.5 w-3.5" />
                    {t(graphRagPage.nextActions.en, graphRagPage.nextActions.zh)}
                  </div>
                  <ul className="space-y-1.5">
                    {(isZh ? advisory.actionsZh : advisory.actionsEn).map((a, i) => (
                      <li key={i} className="text-[12px] leading-snug text-muted-foreground pl-3 relative before:content-['→'] before:absolute before:left-0 before:text-primary">
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-[10.5px] text-muted-foreground/90 leading-snug">
                  {isZh
                    ? "切换上方三种视图，顾问解读会随之切换；数值仍来自确定性 Graph RAG，不会由文案改写。"
                    : "Switch the three views above to refresh this brief; numbers stay from deterministic Graph RAG."}
                </p>
              </div>

              {result && (
                <>
                  <div className="rounded-md border border-border bg-surface p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                      <Scale className="h-3.5 w-3.5" />
                      {t(graphRagPage.answer.en, graphRagPage.answer.zh)}
                    </div>
                    <pre className="whitespace-pre-wrap text-[12.5px] leading-relaxed font-sans text-foreground">
                      {answer}
                    </pre>
                  </div>

                  {result.math && (
                    <div className="rounded-md border border-border bg-surface p-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                        <Calculator className="h-3.5 w-3.5" />
                        {t(graphRagPage.math.en, graphRagPage.math.zh)}
                      </div>
                      <p className="text-[12px] font-mono">
                        m = {result.math.yield_factor_m} · SEE = {result.math.see_precursor_tco2e} →{" "}
                        <span className="text-foreground font-semibold">
                          {result.math.precursor_burden_tco2e} tCO₂e/t
                        </span>
                      </p>
                      <p className="text-[11.5px] text-muted-foreground leading-snug">
                        {isZh ? result.math.note_zh : result.math.note_en}
                      </p>
                    </div>
                  )}

                  <div className="rounded-md border border-border bg-surface p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                      <GitBranch className="h-3.5 w-3.5" />
                      {t(graphRagPage.paths.en, graphRagPage.paths.zh)}
                    </div>
                    <ul className="space-y-2">
                      {result.paths.slice(0, 3).map((p, i) => (
                        <li key={i} className="text-[11.5px] leading-relaxed text-muted-foreground font-mono">
                          <span className="text-foreground">#{i + 1} · {p.hops} hops</span>
                          <br />
                          {isZh ? p.path_zh : p.path_en}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-md border border-border bg-surface p-3 space-y-1.5">
                    <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                      {t(graphRagPage.trace.en, graphRagPage.trace.zh)}
                    </div>
                    <ol className="space-y-1.5 list-decimal list-inside">
                      {result.trace.map((tr, i) => (
                        <li key={i} className="text-[11.5px] text-muted-foreground leading-snug">
                          <span className="text-foreground font-mono">{tr.step}</span>
                          {tr.tool ? ` · ${tr.tool}` : ""} — {isZh ? tr.detail_zh : tr.detail_en}
                        </li>
                      ))}
                    </ol>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground border-t border-border pt-3 leading-relaxed">
        {t(graphRagPage.stackNote.en, graphRagPage.stackNote.zh)}
      </p>
    </div>
  );
}
