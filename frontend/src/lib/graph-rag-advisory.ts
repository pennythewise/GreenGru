/**
 * View-scoped Graph RAG advisory briefs.
 * Numbers come only from run_graph_rag / math_bridge — never invented here.
 */
import type { GraphRagQueryResult } from "@/lib/api";

export type GraphViewAlgo = "shortest" | "local" | "full";

export type ViewAdvisory = {
  viewKey: GraphViewAlgo;
  viewLabelEn: string;
  viewLabelZh: string;
  query: string;
  headlineEn: string;
  headlineZh: string;
  bodyEn: string;
  bodyZh: string;
  actionsEn: string[];
  actionsZh: string[];
};

const VIEW_LABEL = {
  shortest: { en: "Shortest path", zh: "最短路径" },
  local: { en: "Local subgraph", zh: "局部子图" },
  full: { en: "Full ontology", zh: "全本体" },
} as const;

function mathLine(result: GraphRagQueryResult | null, isZh: boolean): string | null {
  const m = result?.math;
  if (!m) return null;
  if (isZh) {
    return (
      `确定性前体：m=${m.yield_factor_m} × SEE=${m.see_precursor_tco2e} ` +
      `= ${m.precursor_burden_tco2e} tCO₂e/t` +
      `（示意合计含计入加工 ae ${m.ae_included_fabrication_tco2e} → ${m.illustrative_total_tco2e}）。`
    );
  }
  return (
    `Deterministic precursor: m=${m.yield_factor_m} × SEE=${m.see_precursor_tco2e} ` +
    `= ${m.precursor_burden_tco2e} tCO₂e/t` +
    ` (illustrative total with included ae ${m.ae_included_fabrication_tco2e} → ${m.illustrative_total_tco2e}).`
  );
}

function pathLine(result: GraphRagQueryResult | null, isZh: boolean): string | null {
  const p = result?.paths?.[0];
  if (!p) return null;
  return isZh ? p.path_zh : p.path_en;
}

function governanceBullets(result: GraphRagQueryResult | null, isZh: boolean): string[] {
  const gov = result?.governance ?? [];
  return gov.slice(0, 4).map((g) => {
    if (isZh) {
      return `${g.process_zh}：直接 ${g.direct_status}；间接 ${g.indirect_status}` +
        (g.cite ? `（${g.cite}）` : "");
    }
    return `${g.process_en}: direct ${g.direct_status}; indirect ${g.indirect_status}` +
      (g.cite ? ` (${g.cite})` : "");
  });
}

export function buildViewAdvisory(opts: {
  algo: GraphViewAlgo;
  query: string;
  result: GraphRagQueryResult | null;
  nodeCount: number;
  edgeCount: number;
}): ViewAdvisory {
  const { algo, query, result, nodeCount, edgeCount } = opts;
  const labels = VIEW_LABEL[algo];
  const path = pathLine(result, false);
  const pathZh = pathLine(result, true);
  const mathEn = mathLine(result, false);
  const mathZh = mathLine(result, true);
  const govEn = governanceBullets(result, false);
  const govZh = governanceBullets(result, true);

  if (algo === "shortest") {
    return {
      viewKey: algo,
      viewLabelEn: labels.en,
      viewLabelZh: labels.zh,
      query,
      headlineEn: "Path advisory — where CBAM liability travels",
      headlineZh: "路径顾问 — CBAM 负债沿哪条链传递",
      bodyEn: [
        `You asked: “${query}”`,
        `This view keeps only the multi-hop chain (${nodeCount} nodes / ${edgeCount} edges) from Baowu ironmaking to the fastener CN code.`,
        path ? `Evidence path: ${path}` : "Evidence path: run Graph RAG to extract BF → fastener hops.",
        mathEn ?? "Precursor math appears after a successful Graph RAG cycle.",
        "Advisory read: cutting/welding sit downstream of the plate precursor — they are usually boundary-excluded for direct CBAM pricing; the liability is dominated by upstream SEE × yield m.",
      ].join("\n\n"),
      bodyZh: [
        `您的问题：“${query}”`,
        `本视图只保留多跳证据链（${nodeCount} 节点 / ${edgeCount} 边）：宝武炼铁 → 紧固件海关编码。`,
        pathZh ? `证据路径：${pathZh}` : "证据路径：请先运行 Graph RAG 以提取高炉→紧固件跳数。",
        mathZh ?? "成功运行 Graph RAG 后显示前体倍率。",
        "顾问解读：切割/焊接位于板材前体下游，通常不进入直接 CBAM 计价边界；负债主要由上游 SEE × 倍率 m 主导。",
      ].join("\n\n"),
      actionsEn: [
        "Keep Baowu plate SEE as the primary CBAM cost driver in the passport.",
        "Do not add CNC/weld Scope-2 electricity into the CBAM-priced steel total (Annex II).",
        "Cite this path in the advisory note for operator review.",
      ],
      actionsZh: [
        "护照中把宝武板材 SEE 作为 CBAM 成本主驱动。",
        "勿把数控/焊接的范围二电力计入钢铁 CBAM 计价合计（附件二）。",
        "在顾问备注中引用本路径，供操作员复核。",
      ],
    };
  }

  if (algo === "local") {
    return {
      viewKey: algo,
      viewLabelEn: labels.en,
      viewLabelZh: labels.zh,
      query,
      headlineEn: "Neighborhood advisory — what to monitor next to the plate",
      headlineZh: "邻域顾问 — 板材周围要监测什么",
      bodyEn: [
        `You asked: “${query}”`,
        `Local 2-hop subgraph (${nodeCount} nodes / ${edgeCount} edges) around hot-rolled plate, CNC cutting, and CN 7318.`,
        govEn.length
          ? `§3.16.2 governance on this neighborhood:\n${govEn.map((b) => `• ${b}`).join("\n")}`
          : "Run Graph RAG to load GOVERNED_BY statuses for cutting / welding / galvanizing.",
        mathEn ?? "",
        "Advisory read: use this view to explain monitoring scope — included processes (e.g. galvanizing) vs excluded fabrication steps — without drowning the operator in the full ontology.",
      ]
        .filter(Boolean)
        .join("\n\n"),
      bodyZh: [
        `您的问题：“${query}”`,
        `局部 2 跳子图（${nodeCount} 节点 / ${edgeCount} 边）围绕热轧板、数控切割与 CN 7318。`,
        govZh.length
          ? `本邻域的 §3.16.2 治理边：\n${govZh.map((b) => `• ${b}`).join("\n")}`
          : "请运行 Graph RAG 以加载切割/焊接/镀锌的 GOVERNED_BY 状态。",
        mathZh ?? "",
        "顾问解读：用本视图向操作员说明监测范围——计入工艺（如镀锌）与排除的深加工步骤——而不展开全本体。",
      ]
        .filter(Boolean)
        .join("\n\n"),
      actionsEn: [
        "Flag galvanizing (INCLUDED) for metering / evidence pack.",
        "Mark cutting & welding as EXCLUDED_DIRECT but keep electricity for financing scores only.",
        "Attach neighborhood screenshot to the Stage-5 advisory brief.",
      ],
      actionsZh: [
        "将镀锌（INCLUDED）标记为需计量/取证。",
        "切割与焊接标为直接排放排除，电力仅进入融资评分。",
        "将邻域截图附入阶段 5 顾问简报。",
      ],
    };
  }

  // full ontology
  return {
    viewKey: algo,
    viewLabelEn: labels.en,
    viewLabelZh: labels.zh,
    query,
    headlineEn: "Ontology advisory — map the full CBAM story",
    headlineZh: "本体顾问 — 展开完整 CBAM 叙事",
    bodyEn: [
      `You asked: “${query}”`,
      `Full seeded ontology (${nodeCount} nodes / ${edgeCount} edges): process → material → CN code → §3.16.2 boundary → STM BAT → Stage-3 rubric → emission tags.`,
      "Advisory read: this is the teaching / audit map. Pick a path (shortest) or neighborhood (local) when writing the operator-facing answer; keep numbers from the deterministic math block only.",
      mathEn ?? "Run Graph RAG so precursor burden is computed before any tariff narrative.",
      result?.answer_en
        ? `Cycle answer (shared evidence):\n${result.answer_en.split("\n").slice(0, 4).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    bodyZh: [
      `您的问题：“${query}”`,
      `完整种子本体（${nodeCount} 节点 / ${edgeCount} 边）：工艺 → 物料 → 海关编码 → §3.16.2 边界 → STM BAT → 阶段三评分标尺 → 排放标签。`,
      "顾问解读：这是教学/审计总图。面向操作员答复时改用最短路径或局部子图；数值只取自确定性数学块。",
      mathZh ?? "请先运行 Graph RAG，再叙述任何关税含义。",
      result?.answer_zh
        ? `循环答复（共享证据）：\n${result.answer_zh.split("\n").slice(0, 4).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    actionsEn: [
      "Switch to Shortest path when drafting the liability sentence.",
      "Switch to Local subgraph when listing monitoring obligations.",
      "Never let the LLM invent tCO₂e — paste math_bridge figures only.",
    ],
    actionsZh: [
      "起草负债结论时切到「最短路径」。",
      "罗列监测义务时切到「局部子图」。",
      "禁止 LLM 编造 tCO₂e — 只粘贴 math_bridge 数值。",
    ],
  };
}
