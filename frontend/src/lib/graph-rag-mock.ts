/**
 * Offline / demo payload for Graph RAG visualizer.
 * Shape matches GET /api/graph-rag/graph + POST /api/graph-rag/query.
 * Used when the backend proxy returns 502 or is unreachable.
 */
import type { GraphRagEdge, GraphRagNode, GraphRagQueryResult } from "@/lib/api";

const C = {
  process: "#0d9488",
  material: "#2563eb",
  customs: "#ca8a04",
  boundary: "#dc2626",
  bat: "#7c3aed",
  rubric: "#c026d3",
  emission: "#64748b",
} as const;

/** Compact Baowu plate → fastener demo graph (layout coords for SVG). */
export const MOCK_GRAPH_NODES: GraphRagNode[] = [
  { id: "proc_blast_furnace", layer: "process", name_en: "Blast Furnace (BF)", name_zh: "高炉（BF）", color: C.process, x: -0.85, y: 0.55, operator: "Baowu", stage: "upstream" },
  { id: "proc_bof", layer: "process", name_en: "Basic Oxygen Furnace (BOF)", name_zh: "转炉（BOF）", color: C.process, x: -0.55, y: 0.35, operator: "Baowu", stage: "upstream" },
  { id: "proc_hot_rolling", layer: "process", name_en: "Hot Rolling Mill", name_zh: "热轧", color: C.process, x: -0.25, y: 0.15, operator: "Baowu", stage: "upstream" },
  { id: "mat_hot_rolled_plate", layer: "material", name_en: "Hot-Rolled Plate / Coil", name_zh: "热轧板 / 卷", color: C.material, x: 0.05, y: 0.0 },
  { id: "cn_7208_10_00", layer: "customs", name_en: "CN 7208 10 00 · Hot-rolled coil", name_zh: "CN 7208 10 00 · 热轧卷板", color: C.customs, x: 0.05, y: -0.35, cn_code: "7208 10 00" },
  { id: "proc_cnc_cutting", layer: "process", name_en: "CNC Cutting", name_zh: "数控切割", color: C.process, x: 0.35, y: 0.25, operator: "SME", stage: "downstream" },
  { id: "proc_co2_welding", layer: "process", name_en: "CO₂ Shielded Welding", name_zh: "二氧化碳保护焊", color: C.process, x: 0.55, y: 0.05, operator: "SME", stage: "downstream" },
  { id: "mat_fastener_bolt", layer: "material", name_en: "Finished Fastener", name_zh: "成品紧固件", color: C.material, x: 0.8, y: -0.1 },
  { id: "cn_7318_15_42", layer: "customs", name_en: "CN 7318 15 42 · Bolts", name_zh: "CN 7318 15 42 · 螺栓", color: C.customs, x: 0.8, y: -0.4, cn_code: "7318 15 42" },
  { id: "rule_3162", layer: "boundary", name_en: "§3.16.2 steel fabrication monitoring", name_zh: "§3.16.2 · 钢铁深加工监测边界", color: C.boundary, x: 0.35, y: -0.55 },
  { id: "bound_excluded_direct", layer: "boundary", name_en: "CBAM · Excluded direct", name_zh: "CBAM 边界 · 直接排放排除", color: C.boundary, x: 0.55, y: -0.75, tag: "Excluded_Direct" },
  { id: "bound_relevant_precursor", layer: "boundary", name_en: "CBAM · Relevant precursor", name_zh: "CBAM 边界 · 相关前体", color: C.boundary, x: -0.05, y: -0.7, tag: "Relevant_Precursor" },
  { id: "emis_scope2_grid", layer: "emission", name_en: "Scope 2 · Grid electricity", name_zh: "范围二 · 电网电力", color: C.emission, x: 0.35, y: 0.55, tag: "Scope2_GridElectricity" },
  { id: "emis_scope1_combustion", layer: "emission", name_en: "Scope 1 · Combustion", name_zh: "范围一 · 燃烧", color: C.emission, x: -0.7, y: 0.75, tag: "Scope1_Combustion" },
  { id: "bat_zinc_chromium_plating", layer: "bat", name_en: "BAT · Zinc/chromium plating (fasteners)", name_zh: "BAT · 锌/铬镀层（紧固件）", color: C.bat, x: 0.95, y: 0.35 },
  { id: "rubric_stage3_threshold_scoring", layer: "rubric", name_en: "Stage 3 · Threshold scoring rubric", name_zh: "阶段三 · 阈值评分标尺", color: C.rubric, x: 0.95, y: -0.15 },
];

export const MOCK_GRAPH_EDGES: GraphRagEdge[] = [
  { source: "proc_blast_furnace", target: "proc_bof", rel: "FEEDS" },
  { source: "proc_bof", target: "proc_hot_rolling", rel: "FEEDS" },
  { source: "proc_hot_rolling", target: "mat_hot_rolled_plate", rel: "PRODUCES" },
  { source: "mat_hot_rolled_plate", target: "cn_7208_10_00", rel: "CLASSIFIED_AS" },
  { source: "mat_hot_rolled_plate", target: "proc_cnc_cutting", rel: "INPUT_TO", yield_factor_m: 1.176, scrap_pct: 15, cite: "SEE precursor × yield" },
  { source: "proc_cnc_cutting", target: "proc_co2_welding", rel: "NEXT_STEP" },
  { source: "proc_co2_welding", target: "mat_fastener_bolt", rel: "PRODUCES" },
  { source: "mat_fastener_bolt", target: "cn_7318_15_42", rel: "CLASSIFIED_AS" },
  { source: "rule_3162", target: "proc_cnc_cutting", rel: "GOVERNS", direct_status: "EXCLUDED", indirect_status: "MONITORING_ONLY_NOT_CBAM_PRICED", cite: "§3.16.2" },
  { source: "rule_3162", target: "proc_co2_welding", rel: "GOVERNS", direct_status: "EXCLUDED", indirect_status: "MONITORING_ONLY_NOT_CBAM_PRICED", cite: "§3.16.2" },
  { source: "proc_cnc_cutting", target: "bound_excluded_direct", rel: "MAPS_TO" },
  { source: "mat_hot_rolled_plate", target: "bound_relevant_precursor", rel: "MAPS_TO" },
  { source: "proc_cnc_cutting", target: "emis_scope2_grid", rel: "EMITS" },
  { source: "proc_blast_furnace", target: "emis_scope1_combustion", rel: "EMITS" },
  { source: "mat_fastener_bolt", target: "bat_zinc_chromium_plating", rel: "GUIDED_BY_BAT" },
  { source: "mat_fastener_bolt", target: "rubric_stage3_threshold_scoring", rel: "SCORED_BY" },
];

export const MOCK_GRAPH_PAYLOAD = {
  nodes: MOCK_GRAPH_NODES,
  edges: MOCK_GRAPH_EDGES,
  stats: {
    nodes: MOCK_GRAPH_NODES.length,
    edges: MOCK_GRAPH_EDGES.length,
    layers: ["process", "material", "customs", "boundary", "bat", "rubric", "emission"],
  },
};

/** Simulated POST /api/graph-rag/query for the default Baowu fastener question. */
export const MOCK_QUERY_RESULT: GraphRagQueryResult = {
  query: "我们用宝武热轧板加工紧固件。数控切割和焊接需要核算哪些排放？最大的 CBAM 负债在哪里？",
  locale: "zh",
  answer_en:
    "CNC cutting and CO₂ welding are Excluded_Direct under §3.16.2 (electricity is monitoring-only, not CBAM-priced for steel). The largest CBAM liability sits in the Baowu hot-rolled plate precursor (SEE), not in SME fabrication AE.",
  answer_zh:
    "数控切割与二氧化碳保护焊在 §3.16.2 下为「直接排放排除」；电网电力仅监测、不对钢铁 CBAM 计价。最大负债在宝武热轧板前体（SEE），而非下游加工 AE。",
  entities: [
    MOCK_GRAPH_NODES.find((n) => n.id === "mat_hot_rolled_plate")!,
    MOCK_GRAPH_NODES.find((n) => n.id === "proc_cnc_cutting")!,
    MOCK_GRAPH_NODES.find((n) => n.id === "proc_co2_welding")!,
    MOCK_GRAPH_NODES.find((n) => n.id === "rule_3162")!,
    MOCK_GRAPH_NODES.find((n) => n.id === "cn_7318_15_42")!,
  ],
  paths: [
    {
      node_ids: [
        "proc_blast_furnace",
        "proc_bof",
        "proc_hot_rolling",
        "mat_hot_rolled_plate",
        "proc_cnc_cutting",
        "proc_co2_welding",
        "mat_fastener_bolt",
        "cn_7318_15_42",
      ],
      hops: 7,
      rels: ["FEEDS", "FEEDS", "PRODUCES", "INPUT_TO", "NEXT_STEP", "PRODUCES", "CLASSIFIED_AS"],
      path_en: "BF → BOF → Hot rolling → Plate → CNC → Weld → Fastener → CN 7318",
      path_zh: "高炉 → 转炉 → 热轧 → 板材 → 数控切割 → 焊接 → 紧固件 → CN 7318",
    },
  ],
  governance: [
    {
      process_id: "proc_cnc_cutting",
      process_en: "CNC Cutting",
      process_zh: "数控切割",
      direct_status: "EXCLUDED",
      indirect_status: "MONITORING_ONLY_NOT_CBAM_PRICED",
      cite: "Reg (EU) 2025/2547 Annex I §3.16.2",
    },
    {
      process_id: "proc_co2_welding",
      process_en: "CO₂ Shielded Welding",
      process_zh: "二氧化碳保护焊",
      direct_status: "EXCLUDED",
      indirect_status: "MONITORING_ONLY_NOT_CBAM_PRICED",
      cite: "Reg (EU) 2025/2547 Annex I §3.16.2",
    },
  ],
  precursor: {
    source: "mat_hot_rolled_plate",
    target: "proc_cnc_cutting",
    rel: "INPUT_TO",
    yield_factor_m: 1.176,
    scrap_pct: 15,
    cite: "SEE precursor × yield",
    note_en: "Relevant precursor SEE dominates CBAM liability.",
    note_zh: "相关前体 SEE 主导 CBAM 负债。",
  },
  math: {
    formula_en: "precursor_burden = SEE × m; total ≈ precursor + AE_fabrication (illustrative)",
    formula_zh: "前体负担 = SEE × m；合计 ≈ 前体 + 加工 AE（示意）",
    see_precursor_tco2e: 2.2,
    yield_factor_m: 1.176,
    scrap_pct: 15,
    precursor_burden_tco2e: 2.5872,
    ae_included_fabrication_tco2e: 0.08,
    illustrative_total_tco2e: 2.6672,
    note_en: "Numbers from deterministic math bridge — LLM must not invent substitutes.",
    note_zh: "数值来自确定性数学桥接，LLM 不得改写。",
  },
  subgraph: {
    nodes: MOCK_GRAPH_NODES,
    edges: MOCK_GRAPH_EDGES,
    endpoint_ids: ["mat_hot_rolled_plate", "cn_7318_15_42", "rule_3162"],
  },
  trace: [
    { step: "plan", detail_en: "Match Baowu plate + cutting/welding + CBAM liability", detail_zh: "匹配宝武板材 + 切割/焊接 + CBAM 负债", tool: null },
    { step: "route", detail_en: "Shortest path + §3.16.2 governance", detail_zh: "最短路径 + §3.16.2 治理边", tool: "networkx" },
    { step: "execute", detail_en: "Traverse precursor → fastener path", detail_zh: "遍历前体→紧固件路径", tool: "paths_between" },
    { step: "evaluate", detail_en: "Cutting/welding EXCLUDED; precursor dominates", detail_zh: "切割/焊接排除；前体主导", tool: null },
    { step: "generate", detail_en: "Compose bilingual answer + math block", detail_zh: "生成双语回答与数学块", tool: null },
  ],
};
