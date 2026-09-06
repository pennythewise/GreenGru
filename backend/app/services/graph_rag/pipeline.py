"""LangGraph-orchestrated Graph RAG cycle.

Plan → Route → Execute → Evaluate → (optional one back-edge) → PrecursorMath → Generate.

Numbers always come from math_bridge — never from LLM synthesis.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from functools import lru_cache
from typing import Any, Literal, TypedDict

from langgraph.graph import END, StateGraph

from app.services.graph_rag.math_bridge import precursor_burden_tco2e
from app.services.graph_rag.store import (
    governance_for_processes,
    local_neighborhood,
    match_entities,
    node_payload,
    paths_between,
    precursor_edge,
    serialize_full_graph,
)

ToolName = Literal["semantic_entry", "local_hop", "path_search", "structured_boundary", "precursor_math"]

DEMO_QUERY_ZH = (
    "我们用宝武热轧板加工紧固件。数控切割和焊接需要核算哪些排放？"
    "最大的 CBAM 负债在哪里？"
)
DEMO_QUERY_EN = (
    "We fabricate fasteners from Baowu hot-rolled plate. "
    "What emissions must we calculate for CNC cutting and welding, "
    "and where is our biggest CBAM liability?"
)

MAX_BACK_EDGES = 1


@dataclass
class GraphRagTrace:
    step: str
    detail_en: str
    detail_zh: str
    tool: str | None = None


@dataclass
class GraphRagResult:
    query: str
    locale: str
    answer_en: str = ""
    answer_zh: str = ""
    entities: list[dict[str, Any]] = field(default_factory=list)
    paths: list[dict[str, Any]] = field(default_factory=list)
    governance: list[dict[str, Any]] = field(default_factory=list)
    precursor: dict[str, Any] | None = None
    math: dict[str, Any] | None = None
    subgraph_nodes: list[dict[str, Any]] = field(default_factory=list)
    subgraph_edges: list[dict[str, Any]] = field(default_factory=list)
    endpoint_ids: list[str] = field(default_factory=list)
    trace: list[GraphRagTrace] = field(default_factory=list)
    vector_cites: list[dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "query": self.query,
            "locale": self.locale,
            "answer_en": self.answer_en,
            "answer_zh": self.answer_zh,
            "entities": self.entities,
            "paths": self.paths,
            "governance": self.governance,
            "precursor": self.precursor,
            "math": self.math,
            "subgraph": {
                "nodes": self.subgraph_nodes,
                "edges": self.subgraph_edges,
                "endpoint_ids": self.endpoint_ids,
            },
            "trace": [
                {
                    "step": t.step,
                    "detail_en": t.detail_en,
                    "detail_zh": t.detail_zh,
                    "tool": t.tool,
                }
                for t in self.trace
            ],
            "vector_cites": self.vector_cites,
        }


class GraphRagState(TypedDict, total=False):
    query: str
    locale: str
    see_precursor_tco2e: float
    fabrication_ae_tco2e: float
    q: str
    entities: list[dict[str, Any]]
    endpoint_ids: list[str]
    node_map: dict[str, dict[str, Any]]
    merged_edges: list[dict[str, Any]]
    paths: list[dict[str, Any]]
    governance: list[dict[str, Any]]
    precursor: dict[str, Any] | None
    math: dict[str, Any] | None
    answer_en: str
    answer_zh: str
    trace: list[dict[str, Any]]
    back_edge_count: int
    needs_back_edge: bool
    execute_pass: int


def _append_trace(
    state: GraphRagState,
    *,
    step: str,
    detail_en: str,
    detail_zh: str,
    tool: str | None = None,
) -> list[dict[str, Any]]:
    trace = list(state.get("trace") or [])
    trace.append(
        {
            "step": step,
            "detail_en": detail_en,
            "detail_zh": detail_zh,
            "tool": tool,
        }
    )
    return trace


def _merge_neighborhood(
    node_map: dict[str, dict[str, Any]],
    merged_edges: list[dict[str, Any]],
    center: str,
    hops: int = 2,
) -> tuple[dict[str, dict[str, Any]], list[dict[str, Any]]]:
    nodes, edges = local_neighborhood(center, hops=hops)
    nm = dict(node_map)
    me = list(merged_edges)
    existing = {(e["source"], e["target"], e["rel"]) for e in me}
    for n in nodes:
        nm[n["id"]] = n
    for e in edges:
        key = (e["source"], e["target"], e["rel"])
        if key not in existing:
            me.append(e)
            existing.add(key)
    return nm, me


def plan_node(state: GraphRagState) -> dict[str, Any]:
    return {
        "trace": _append_trace(
            state,
            step="plan",
            detail_en=(
                "Decompose: (a) cutting/welding CBAM boundary (b) Baowu precursor burden "
                "(c) scrap yield m_i (d) STM BAT plating guidance (e) Stage-3 scoring rubric."
            ),
            detail_zh=(
                "拆解子问题：(a) 切割/焊接 CBAM 边界 (b) 宝武前体碳负 "
                "(c) 废料倍率 m_i (d) STM BAT 镀层指引 (e) 阶段三评分标尺。"
            ),
        ),
        "back_edge_count": 0,
        "execute_pass": 0,
        "needs_back_edge": False,
        "node_map": {},
        "merged_edges": [],
    }


def route_node(state: GraphRagState) -> dict[str, Any]:
    """Select graph entry tools / centers for this pass."""
    pass_n = int(state.get("execute_pass") or 0)
    if pass_n == 0:
        detail_en = "Route: semantic_entry → local_hop(plate/CNC/CN) → path_search → structured_boundary."
        detail_zh = "路由：语义入口 → 局部跳（板材/切割/CN）→ 路径搜索 → 结构化边界。"
    else:
        detail_en = "Back-edge route: expand INCLUDED galvanizing neighborhood."
        detail_zh = "回边路由：扩展计入工艺（镀锌）邻域。"
    return {
        "trace": _append_trace(
            state,
            step="route",
            detail_en=detail_en,
            detail_zh=detail_zh,
            tool="langgraph_route",
        ),
    }


def execute_node(state: GraphRagState) -> dict[str, Any]:
    q = state["q"]
    pass_n = int(state.get("execute_pass") or 0)
    node_map = dict(state.get("node_map") or {})
    merged_edges = list(state.get("merged_edges") or [])
    trace = list(state.get("trace") or [])

    if pass_n == 0:
        entities = match_entities(q, limit=8)
        endpoint_ids = _pick_endpoints(entities, q)
        trace.append(
            {
                "step": "execute",
                "tool": "semantic_entry",
                "detail_en": f"Matched {len(entities)} seed entities as graph entry points.",
                "detail_zh": f"匹配到 {len(entities)} 个图入口实体。",
            }
        )

        for center in ("proc_cnc_cutting", "mat_hot_rolled_plate", "cn_7318_15_88"):
            node_map, merged_edges = _merge_neighborhood(node_map, merged_edges, center, hops=2)
        trace.append(
            {
                "step": "execute",
                "tool": "local_hop",
                "detail_en": "Expanded 2-hop neighborhoods around CNC cutting, hot-rolled plate, and CN 7318.",
                "detail_zh": "围绕数控切割、热轧板、CN 7318 做 2 跳邻域展开。",
            }
        )

        paths = paths_between("proc_blast_furnace", "cn_7318_15_88", max_hops=8, limit=4)
        if not paths:
            paths = paths_between("proc_bof", "mat_fastener_bolt", max_hops=6, limit=4)
        trace.append(
            {
                "step": "execute",
                "tool": "path_search",
                "detail_en": f"Found {len(paths)} multi-hop path(s) Baowu BF → fastener CN.",
                "detail_zh": f"找到 {len(paths)} 条宝武高炉 → 紧固件 CN 的多跳路径。",
            }
        )

        gov = governance_for_processes(
            ["proc_cnc_cutting", "proc_co2_welding", "proc_hot_dip_galvanizing", "proc_assembly"]
        )
        trace.append(
            {
                "step": "execute",
                "tool": "structured_boundary",
                "detail_en": "Read GOVERNED_BY edges for cutting / welding / galvanizing / assembly.",
                "detail_zh": "读取切割 / 焊接 / 镀锌 / 装配的 GOVERNED_BY 边。",
            }
        )

        return {
            "entities": entities,
            "endpoint_ids": endpoint_ids,
            "node_map": node_map,
            "merged_edges": merged_edges,
            "paths": paths,
            "governance": gov,
            "trace": trace,
            "execute_pass": pass_n + 1,
        }

    # Back-edge execute: galvanizing neighborhood only
    node_map, merged_edges = _merge_neighborhood(
        node_map, merged_edges, "proc_hot_dip_galvanizing", hops=2
    )
    trace.append(
        {
            "step": "execute",
            "tool": "local_hop",
            "detail_en": "Back-edge execute: 2-hop around hot-dip galvanizing (INCLUDED).",
            "detail_zh": "回边执行：热浸镀锌（计入）2 跳邻域。",
        }
    )
    return {
        "node_map": node_map,
        "merged_edges": merged_edges,
        "trace": trace,
        "execute_pass": pass_n + 1,
        "needs_back_edge": False,
    }


def evaluate_node(state: GraphRagState) -> dict[str, Any]:
    paths = state.get("paths") or []
    gov = state.get("governance") or []
    prec = precursor_edge()
    back_edge_count = int(state.get("back_edge_count") or 0)
    need_math = prec is not None
    incomplete = need_math and (not paths or not gov)
    can_retry = incomplete and back_edge_count < MAX_BACK_EDGES

    if can_retry:
        return {
            "precursor": prec,
            "needs_back_edge": True,
            "back_edge_count": back_edge_count + 1,
            "trace": _append_trace(
                state,
                step="evaluate",
                detail_en="Evidence incomplete → one LangGraph back-edge hop to galvanizing (INCLUDED process).",
                detail_zh="证据不足 → LangGraph 回边再跳一层到镀锌（计入工艺）。",
            ),
        }

    return {
        "precursor": prec,
        "needs_back_edge": False,
        "trace": _append_trace(
            state,
            step="evaluate",
            detail_en="Boundary + path evidence sufficient; run deterministic precursor math.",
            detail_zh="边界与路径证据充足；执行确定性前体倍率计算。",
        ),
    }


def should_retry(state: GraphRagState) -> Literal["route", "precursor_math"]:
    if state.get("needs_back_edge"):
        return "route"
    return "precursor_math"


def precursor_math_node(state: GraphRagState) -> dict[str, Any]:
    prec = state.get("precursor")
    if prec is None:
        prec = precursor_edge()
    see = float(state.get("see_precursor_tco2e", 2.2))
    ae = float(state.get("fabrication_ae_tco2e", 0.08))
    math_block: dict[str, Any] | None = None
    trace = list(state.get("trace") or [])

    if prec:
        m = float(prec["yield_factor_m"])
        burden = precursor_burden_tco2e(see_precursor=see, yield_factor_m=m)
        total_illustrative = round(burden + ae, 6)
        math_block = {
            "formula_en": "SEE_fastener ~= ae_included_fabrication + (m_plate * SEE_Baowu_plate)",
            "formula_zh": "SEE_紧固件 ~= ae_计入加工 + (m_板 * SEE_宝武板)",
            "see_precursor_tco2e": see,
            "yield_factor_m": m,
            "scrap_pct": prec.get("scrap_pct"),
            "precursor_burden_tco2e": burden,
            "ae_included_fabrication_tco2e": ae,
            "illustrative_total_tco2e": total_illustrative,
            "note_en": (
                "Numbers from math_bridge only. Annex II iron/steel CBAM prices direct emissions; "
                "cutting/welding flame & shielding CO₂ are EXCLUDED per §3.16.2; "
                "grid electricity is not CBAM-priced (financing / monitoring only)."
            ),
            "note_zh": (
                "数值仅来自 math_bridge。附件二钢铁 CBAM 计价直接排放；"
                "切割/焊接火焰与保护气 CO₂ 按 §3.16.2 排除；"
                "电网电力不进入 CBAM 计价（仅监测/融资）。"
            ),
        }
        trace.append(
            {
                "step": "execute",
                "tool": "precursor_math",
                "detail_en": f"Deterministic: m={m} × SEE={see} → precursor burden {burden} tCO₂e/t.",
                "detail_zh": f"确定性计算：m={m} × SEE={see} → 前体负担 {burden} tCO₂e/t。",
            }
        )

    node_map = dict(state.get("node_map") or {})
    for p in state.get("paths") or []:
        for nid in p.get("node_ids") or []:
            if nid not in node_map:
                node_map[nid] = node_payload(nid)

    return {
        "precursor": prec,
        "math": math_block,
        "node_map": node_map,
        "trace": trace,
    }


def generate_node(state: GraphRagState) -> dict[str, Any]:
    gov = state.get("governance") or []
    math_block = state.get("math")
    paths = state.get("paths") or []
    answer_en, answer_zh = _synthesize_answers(gov, math_block, paths)
    return {
        "answer_en": answer_en,
        "answer_zh": answer_zh,
        "trace": _append_trace(
            state,
            step="generate",
            detail_en="Synthesized bilingual answer with graph-path citations; no LLM-invented numbers.",
            detail_zh="生成中英双语答复并附路径引用；无 LLM 编造数值。",
            tool="langgraph_generate",
        ),
    }


def _build_graph():
    g = StateGraph(GraphRagState)
    g.add_node("plan", plan_node)
    g.add_node("route", route_node)
    g.add_node("execute", execute_node)
    g.add_node("evaluate", evaluate_node)
    g.add_node("precursor_math", precursor_math_node)
    g.add_node("generate", generate_node)

    g.set_entry_point("plan")
    g.add_edge("plan", "route")
    g.add_edge("route", "execute")
    g.add_edge("execute", "evaluate")
    g.add_conditional_edges(
        "evaluate",
        should_retry,
        {
            "route": "route",
            "precursor_math": "precursor_math",
        },
    )
    g.add_edge("precursor_math", "generate")
    g.add_edge("generate", END)
    return g.compile()


@lru_cache(maxsize=1)
def get_graph_rag_langgraph():
    """Compiled LangGraph app for Graph RAG (cached)."""
    return _build_graph()


def run_graph_rag(
    query: str,
    *,
    locale: str = "zh",
    see_precursor_tco2e: float = 2.2,
    fabrication_ae_tco2e: float = 0.08,
    include_full_layout: bool = False,
) -> dict[str, Any]:
    """LangGraph five-step cycle with at most one evaluate→route back-edge."""
    q = query.strip() or (DEMO_QUERY_ZH if locale == "zh" else DEMO_QUERY_EN)
    app = get_graph_rag_langgraph()
    final: GraphRagState = app.invoke(
        {
            "query": query,
            "locale": locale,
            "see_precursor_tco2e": see_precursor_tco2e,
            "fabrication_ae_tco2e": fabrication_ae_tco2e,
            "q": q,
            "trace": [],
            "back_edge_count": 0,
            "execute_pass": 0,
            "needs_back_edge": False,
            "node_map": {},
            "merged_edges": [],
        }
    )

    result = GraphRagResult(
        query=query,
        locale=locale,
        answer_en=final.get("answer_en") or "",
        answer_zh=final.get("answer_zh") or "",
        entities=list(final.get("entities") or []),
        paths=list(final.get("paths") or []),
        governance=list(final.get("governance") or []),
        precursor=final.get("precursor"),
        math=final.get("math"),
        subgraph_nodes=list((final.get("node_map") or {}).values()),
        subgraph_edges=list(final.get("merged_edges") or []),
        endpoint_ids=list(final.get("endpoint_ids") or []),
        vector_cites=[],
    )
    for t in final.get("trace") or []:
        result.trace.append(
            GraphRagTrace(
                step=t["step"],
                detail_en=t["detail_en"],
                detail_zh=t["detail_zh"],
                tool=t.get("tool"),
            )
        )

    payload = result.to_dict()
    payload["engine"] = "langgraph"
    if include_full_layout:
        payload["full_graph"] = serialize_full_graph()
    return payload


def _pick_endpoints(entities: list[dict[str, Any]], query: str) -> list[str]:
    defaults = [
        "proc_blast_furnace",
        "mat_hot_rolled_plate",
        "proc_cnc_cutting",
        "proc_co2_welding",
        "cn_7318_15_88",
        "rule_3162",
        "bat_zinc_chromium_plating",
        "rubric_stage3_threshold_scoring",
    ]
    ids = [e["id"] for e in entities[:5]]
    for d in defaults:
        if d not in ids:
            ids.append(d)
    return ids[:7]


def _synthesize_answers(
    governance: list[dict[str, Any]],
    math: dict[str, Any] | None,
    paths: list[dict[str, Any]],
) -> tuple[str, str]:
    cut = next((g for g in governance if g["process_id"] == "proc_cnc_cutting"), None)
    weld = next((g for g in governance if g["process_id"] == "proc_co2_welding"), None)
    galv = next((g for g in governance if g["process_id"] == "proc_hot_dip_galvanizing"), None)

    path_line_en = paths[0]["path_en"] if paths else "(no path)"
    path_line_zh = paths[0]["path_zh"] if paths else "（无路径）"

    en_parts = [
        "① Boundary (graph GOVERNED_BY):",
        f"  • CNC cutting — direct {cut['direct_status'] if cut else 'n/a'}; "
        f"electricity {cut['indirect_status'] if cut else 'n/a'} "
        f"(cite: {cut.get('cite') if cut else '§3.16.2'}).",
        f"  • CO₂ welding — direct {weld['direct_status'] if weld else 'n/a'}; "
        f"electricity {weld['indirect_status'] if weld else 'n/a'}.",
        f"  • Hot-dip galvanizing — direct {galv['direct_status'] if galv else 'n/a'} "
        f"(must monitor).",
        "② Biggest CBAM liability: upstream Baowu BF-BOF precursor plate, scaled by scrap yield m_i.",
    ]
    if math:
        en_parts.append(
            f"③ Deterministic math: precursor burden = {math['yield_factor_m']} × "
            f"{math['see_precursor_tco2e']} = {math['precursor_burden_tco2e']} tCO₂e/t; "
            f"illustrative total with included fabrication ae = {math['illustrative_total_tco2e']} tCO₂e/t."
        )
    en_parts.append(f"④ Graph path: {path_line_en}")
    en_parts.append(
        "⑤ BAT: fastener zinc/chromium plating guided by STM BREF Draft 1 "
        "(citation KB under knowledge/bat/ — not a regulated-number source)."
    )
    en_parts.append(
        "⑥ Stage-3 rubric: CISA E→A (provisional), CBAM risk tier, de minimis ≤50 t — "
        "marks come from threshold_scoring.py only."
    )

    zh_parts = [
        "① 边界（图 GOVERNED_BY）：",
        f"  • 数控切割 — 直接排放 {cut['direct_status'] if cut else '无'}；"
        f"电力 {cut['indirect_status'] if cut else '无'} "
        f"（引用：{cut.get('cite') if cut else '§3.16.2'}）。",
        f"  • 二氧化碳保护焊 — 直接排放 {weld['direct_status'] if weld else '无'}；"
        f"电力 {weld['indirect_status'] if weld else '无'}。",
        f"  • 热浸镀锌 — 直接排放 {galv['direct_status'] if galv else '无'}（必须监测）。",
        "② 最大 CBAM 负债：上游宝武 BF-BOF 前体板材，经废料倍率 m_i 放大。",
    ]
    if math:
        zh_parts.append(
            f"③ 确定性计算：前体负担 = {math['yield_factor_m']} × "
            f"{math['see_precursor_tco2e']} = {math['precursor_burden_tco2e']} tCO₂e/t；"
            f"含计入加工 ae 的示意合计 = {math['illustrative_total_tco2e']} tCO₂e/t。"
        )
    zh_parts.append(f"④ 图路径：{path_line_zh}")
    zh_parts.append(
        "⑤ BAT：紧固件锌/铬镀层引用 STM BREF 草案1（knowledge/bat/ 引用库 — 非管制数值来源）。"
    )
    zh_parts.append(
        "⑥ 阶段三评分标尺：CISA E→A（暂行）、CBAM 风险档、微量豁免≤50 t — "
        "档位仅由 threshold_scoring.py 计算。"
    )

    return "\n".join(en_parts), "\n".join(zh_parts)


def format_advisory_graph_context(payload: dict[str, Any]) -> str:
    """Plain-text block injected into the advisory agent — citations only, numbers pre-computed."""
    lines = [
        "=== Graph RAG context (read-only; do not invent numbers) ===",
        payload.get("answer_en", ""),
        "",
        "Governance edges:",
    ]
    for g in payload.get("governance") or []:
        lines.append(
            f"- {g.get('process_en')}: direct={g.get('direct_status')} "
            f"indirect={g.get('indirect_status')} cite={g.get('cite')}"
        )
    math = payload.get("math")
    if math:
        lines.append(
            f"Precursor math (deterministic): m={math['yield_factor_m']} "
            f"SEE={math['see_precursor_tco2e']} burden={math['precursor_burden_tco2e']} tCO2e/t"
        )
    if payload.get("paths"):
        lines.append(f"Primary path: {payload['paths'][0].get('path_en')}")
    lines.append("=== end Graph RAG context ===")
    return "\n".join(lines)
