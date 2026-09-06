/**
 * Immersive 3D Graph RAG build-up for passport Stage 5 / Section C.
 * Reveals ontology nodes (BAT + rubric + metallurgy) then highlights the
 * evidence path — numbers stay from Graph RAG math_bridge only.
 */
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ClientOnly, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Loader2, Network } from "lucide-react";
import type { GraphRagEdge, GraphRagNode, GraphRagQueryResult } from "@/lib/api";
import { useLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

const GraphRagScene = lazy(() =>
  import("@/components/GraphRagScene").then((m) => ({ default: m.GraphRagScene })),
);

const REVEAL_MS = 55;

function buildRevealOrder(
  nodes: GraphRagNode[],
  pathIds: string[],
  endpointIds: string[],
): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  const push = (id: string) => {
    if (!seen.has(id) && nodes.some((n) => n.id === id)) {
      seen.add(id);
      order.push(id);
    }
  };
  for (const id of pathIds) push(id);
  for (const id of endpointIds) push(id);
  const layerPrefer = ["bat", "rubric", "boundary", "process", "material", "customs", "emission"];
  const rest = [...nodes].sort((a, b) => {
    const la = layerPrefer.indexOf(a.layer);
    const lb = layerPrefer.indexOf(b.layer);
    return (la < 0 ? 99 : la) - (lb < 0 ? 99 : lb);
  });
  for (const n of rest) push(n.id);
  return order;
}

export function PassportGraphRagPanel({
  phase,
  nodes,
  edges,
  result,
  className,
  compact,
}: {
  phase: "idle" | "building" | "ready";
  nodes: GraphRagNode[];
  edges: GraphRagEdge[];
  result: GraphRagQueryResult | null;
  className?: string;
  /** Shorter canvas while pipeline is still running */
  compact?: boolean;
}) {
  const { isZh } = useLocale();

  const pathIds = useMemo(() => {
    const fromPaths = (result?.paths ?? []).flatMap((p) => p.node_ids);
    return fromPaths.length
      ? fromPaths
      : [
          "proc_blast_furnace",
          "proc_bof",
          "proc_hot_rolling",
          "mat_hot_rolled_plate",
          "mat_fastener_bolt",
          "cn_7318_15_88",
        ];
  }, [result]);

  const endpointIds = result?.subgraph?.endpoint_ids ?? [
    "proc_blast_furnace",
    "cn_7318_15_88",
    "rule_3162",
  ];

  const highlightIds = useMemo(() => new Set(pathIds), [pathIds]);

  const revealOrder = useMemo(
    () => buildRevealOrder(nodes, pathIds, endpointIds),
    [nodes, pathIds, endpointIds],
  );

  const [revealCount, setRevealCount] = useState(0);

  useEffect(() => {
    if (phase === "idle") {
      setRevealCount(0);
      return;
    }
    if (phase === "ready") {
      setRevealCount(revealOrder.length);
      return;
    }
    setRevealCount(0);
    if (!revealOrder.length) return;
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setRevealCount(i);
      if (i >= revealOrder.length) window.clearInterval(timer);
    }, REVEAL_MS);
    return () => window.clearInterval(timer);
  }, [phase, revealOrder]);

  const visibleIdSet = useMemo(() => {
    if (phase === "ready") return new Set(nodes.map((n) => n.id));
    const ids = revealOrder.slice(0, Math.max(revealCount, phase === "building" ? 1 : 0));
    return new Set(ids);
  }, [phase, revealOrder, revealCount, nodes]);

  const visibleNodes = useMemo(
    () => nodes.filter((n) => visibleIdSet.has(n.id)),
    [nodes, visibleIdSet],
  );
  const visibleEdges = useMemo(
    () => edges.filter((e) => visibleIdSet.has(e.source) && visibleIdSet.has(e.target)),
    [edges, visibleIdSet],
  );

  const progress =
    revealOrder.length === 0 ? 0 : Math.min(100, Math.round((revealCount / revealOrder.length) * 100));

  const pathLine = isZh ? result?.paths?.[0]?.path_zh : result?.paths?.[0]?.path_en;
  const math = result?.math;
  const answer = isZh ? result?.answer_zh : result?.answer_en;

  if (phase === "idle" || (!nodes.length && phase !== "building")) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-border bg-surface/20 px-5 py-10 text-center",
          className,
        )}
      >
        <Network className="mx-auto h-6 w-6 text-muted-foreground/70" />
        <p className="mt-3 text-[13px] text-muted-foreground">
          {isZh
            ? "运行流水线至阶段 5（顾问）时，将在此构建 3D Graph RAG 本体（含 BAT 与阶段三评分标尺）。"
            : "When Stage 5 (Advisory) runs, a 3D Graph RAG ontology builds here — including STM BAT and Stage-3 rubrics."}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
          <Network className="h-3.5 w-3.5 text-teal" />
          {phase === "building"
            ? isZh
              ? "阶段 5 · Graph RAG 构建中"
              : "Stage 5 · Graph RAG building"
            : isZh
              ? "C 节 · Graph RAG 证据图"
              : "Section C · Graph RAG evidence map"}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10.5px] font-mono text-muted-foreground">
            {visibleNodes.length}/{nodes.length || "—"} {isZh ? "节点" : "nodes"} ·{" "}
            {visibleEdges.length} {isZh ? "边" : "edges"}
            {phase === "building" ? ` · ${progress}%` : ""}
          </span>
          <Link to="/graph-rag" className="text-[10.5px] font-mono text-primary hover:underline">
            {isZh ? "完整页 →" : "Full page →"}
          </Link>
        </div>
      </div>

      {phase === "building" && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
        </div>
      )}

      <ClientOnly
        fallback={
          <div className="flex h-[360px] items-center justify-center rounded-lg border border-border bg-[#0d1319]">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        }
      >
        <Suspense
          fallback={
            <div className="flex h-[360px] items-center justify-center rounded-lg border border-border bg-[#0d1319]">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          }
        >
          <div className={compact ? "[&>div]:h-[360px]" : "[&>div]:h-[480px]"}>
            <GraphRagScene
              nodes={visibleNodes}
              edges={visibleEdges}
              endpointIds={endpointIds}
              highlightIds={highlightIds}
              isZh={isZh}
              showAllEdgeLabels={false}
            />
          </div>
        </Suspense>
      </ClientOnly>

      <p className="text-[11px] font-mono text-teal/90 leading-snug">
        {isZh
          ? "高亮路径 = 证据链（宝武 → 板材 → 紧固件 / 边界 / BAT）。滚轮缩放 · 拖拽旋转。"
          : "Highlighted path = evidence chain (Baowu → plate → fastener / boundary / BAT). Scroll zoom · drag orbit."}
      </p>

      {pathLine && (
        <div className="rounded-md border border-border bg-surface/50 px-3 py-2 text-[11.5px] font-mono text-muted-foreground leading-relaxed">
          <span className="text-foreground">{isZh ? "证据路径" : "Evidence path"}: </span>
          {pathLine}
        </div>
      )}

      {math && (
        <div className="rounded-md border border-carbon/30 bg-carbon/5 px-3 py-2 text-[12px] leading-relaxed">
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-carbon">
            {isZh ? "确定性前体算数" : "Deterministic precursor math"}
          </span>
          <p className="mt-1 text-foreground">{isZh ? math.formula_zh : math.formula_en}</p>
          <p className="mt-1 font-mono text-[11.5px] text-muted-foreground">
            m={math.yield_factor_m} × SEE={math.see_precursor_tco2e} ={" "}
            <span className="text-carbon">{math.precursor_burden_tco2e}</span> tCO₂e/t
          </p>
        </div>
      )}

      {answer && phase === "ready" && (
        <details className="rounded-md border border-border bg-surface/40 px-3 py-2">
          <summary className="cursor-pointer text-[12px] font-medium">
            {isZh ? "顾问答复（Graph RAG）" : "Advisory answer (Graph RAG)"}
          </summary>
          <pre className="mt-2 whitespace-pre-wrap text-[11.5px] text-muted-foreground leading-relaxed font-sans">
            {answer}
          </pre>
        </details>
      )}
    </div>
  );
}
