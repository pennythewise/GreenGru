"""NetworkX-backed knowledge graph store (LightRAG-style: no Leiden communities).

Defensible stack choice for MVP:
- NetworkX for multi-hop / path algorithms (proven, local, zero ops)
- Existing Supabase pgvector for semantic entry (already in GreenGru)
- Fixed Python orchestration — LangGraph StateGraph with ≤1 evaluate→route back-edge
"""

from __future__ import annotations

from functools import lru_cache
from typing import Any

import networkx as nx

from app.services.graph_rag.ontology import EDGES, NODES

LAYER_COLORS = {
    "process": "#0d9488",
    "material": "#2563eb",
    "customs": "#ca8a04",
    "boundary": "#dc2626",
    "bat": "#7c3aed",
    "rubric": "#c026d3",
    "emission": "#64748b",
}


@lru_cache(maxsize=1)
def get_graph() -> nx.MultiDiGraph:
    g = nx.MultiDiGraph()
    for node in NODES:
        nid = node["id"]
        g.add_node(nid, **{k: v for k, v in node.items() if k != "id"})
    for i, edge in enumerate(EDGES):
        attrs = {k: v for k, v in edge.items() if k not in ("source", "target")}
        g.add_edge(edge["source"], edge["target"], key=i, **attrs)
    return g


def node_payload(nid: str, data: dict[str, Any] | None = None) -> dict[str, Any]:
    g = get_graph()
    d = data if data is not None else dict(g.nodes[nid])
    layer = d.get("layer", "process")
    return {
        "id": nid,
        "layer": layer,
        "name_en": d.get("name_en", nid),
        "name_zh": d.get("name_zh", nid),
        "color": LAYER_COLORS.get(layer, "#94a3b8"),
        "cn_code": d.get("cn_code"),
        "stage": d.get("stage"),
        "operator": d.get("operator"),
        "tag": d.get("tag"),
        "document": d.get("document"),
        "source_file": d.get("source_file"),
        "section": d.get("section"),
        "emission_tier": d.get("emission_tier"),
        "marks": d.get("marks"),
        "is_provisional": d.get("is_provisional"),
    }


def edge_payload(u: str, v: str, data: dict[str, Any]) -> dict[str, Any]:
    return {
        "source": u,
        "target": v,
        "rel": data.get("rel", ""),
        "direct_status": data.get("direct_status"),
        "indirect_status": data.get("indirect_status"),
        "yield_factor_m": data.get("yield_factor_m"),
        "scrap_pct": data.get("scrap_pct"),
        "cite": data.get("cite"),
        "note_en": data.get("note_en"),
        "note_zh": data.get("note_zh"),
    }


def serialize_full_graph(*, seed: int = 42) -> dict[str, Any]:
    """Spring layout positions for the visualizer."""
    g = get_graph()
    # Undirected view for nicer layout
    pos = nx.spring_layout(g.to_undirected(), seed=seed, k=1.8 / max(g.number_of_nodes(), 1) ** 0.5)
    nodes = []
    for nid, data in g.nodes(data=True):
        payload = node_payload(nid, data)
        x, y = pos[nid]
        payload["x"] = float(x)
        payload["y"] = float(y)
        nodes.append(payload)
    edges = [edge_payload(u, v, d) for u, v, d in g.edges(data=True)]
    return {
        "nodes": nodes,
        "edges": edges,
        "stats": {
            "nodes": g.number_of_nodes(),
            "edges": g.number_of_edges(),
            "layers": sorted({d.get("layer") for _, d in g.nodes(data=True)}),
        },
    }


def paths_between(source: str, target: str, *, max_hops: int = 8, limit: int = 6) -> list[dict[str, Any]]:
    g = get_graph()
    if source not in g or target not in g:
        return []
    undirected = g.to_undirected()
    try:
        raw = list(nx.all_simple_paths(undirected, source, target, cutoff=max_hops))
    except (nx.NetworkXError, nx.NodeNotFound):
        return []
    raw = sorted(raw, key=len)[:limit]
    out: list[dict[str, Any]] = []
    for path in raw:
        labels_en: list[str] = []
        labels_zh: list[str] = []
        edge_rels: list[str] = []
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            rel = _best_rel(g, u, v)
            edge_rels.append(rel)
            nu, nv = g.nodes[u], g.nodes[v]
            if i == 0:
                labels_en.append(nu.get("name_en", u))
                labels_zh.append(nu.get("name_zh", u))
            labels_en.append(f"—[{rel}]→ {nv.get('name_en', v)}")
            labels_zh.append(f"—[{rel}]→ {nv.get('name_zh', v)}")
        out.append(
            {
                "node_ids": path,
                "hops": len(path) - 1,
                "rels": edge_rels,
                "path_en": " ".join(labels_en) if labels_en else path[0],
                "path_zh": " ".join(labels_zh) if labels_zh else path[0],
            }
        )
    return out


def _best_rel(g: nx.MultiDiGraph, u: str, v: str) -> str:
    if g.has_edge(u, v):
        data = list(g.get_edge_data(u, v).values())[0]
        return str(data.get("rel", "RELATED"))
    if g.has_edge(v, u):
        data = list(g.get_edge_data(v, u).values())[0]
        return str(data.get("rel", "RELATED"))
    return "RELATED"


def local_neighborhood(center: str, *, hops: int = 2) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    g = get_graph()
    if center not in g:
        return [], []
    undirected = g.to_undirected()
    lengths = nx.single_source_shortest_path_length(undirected, center, cutoff=hops)
    keep = set(lengths.keys())
    nodes = [node_payload(nid) for nid in keep]
    edges = [
        edge_payload(u, v, d)
        for u, v, d in g.edges(data=True)
        if u in keep and v in keep
    ]
    return nodes, edges


def match_entities(query: str, *, limit: int = 8) -> list[dict[str, Any]]:
    """Lightweight keyword entity match (semantic entry without embedding dependency)."""
    q = query.lower().strip()
    if not q:
        return []
    tokens = [t for t in q.replace("，", " ").replace(",", " ").split() if len(t) >= 2]
    g = get_graph()
    scored: list[tuple[float, str]] = []
    for nid, data in g.nodes(data=True):
        blob = " ".join(
            str(data.get(k, ""))
            for k in (
                "name_en",
                "name_zh",
                "cn_code",
                "tag",
                "document",
                "operator",
                "stage",
                "id",
                "source_file",
            )
        ).lower()
        score = 0.0
        if q in blob:
            score += 5.0
        for t in tokens:
            if t in blob:
                score += 1.0
        # bilingual / domain aliases
        aliases = {
            "baowu": "proc_blast_furnace",
            "宝武": "proc_blast_furnace",
            "高炉": "proc_blast_furnace",
            "bf": "proc_blast_furnace",
            "bof": "proc_bof",
            "转炉": "proc_bof",
            "切割": "proc_cnc_cutting",
            "cutting": "proc_cnc_cutting",
            "welding": "proc_co2_welding",
            "焊接": "proc_co2_welding",
            "镀锌": "proc_hot_dip_galvanizing",
            "galvaniz": "proc_hot_dip_galvanizing",
            "bat": "bat_stm_bref_root",
            "bref": "bat_stm_bref_root",
            "电镀": "bat_zinc_chromium_plating",
            "plating": "bat_zinc_chromium_plating",
            "酸洗": "bat_pretreatment_pickling",
            "pickling": "bat_pretreatment_pickling",
            "六价铬": "bat_cross_cutting_crvi_substitution",
            "cr(vi)": "bat_cross_cutting_crvi_substitution",
            "crvi": "bat_cross_cutting_crvi_substitution",
            "cisa": "rubric_cisa_grade_e_to_a",
            "评分": "rubric_stage3_threshold_scoring",
            "rubric": "rubric_stage3_threshold_scoring",
            "de minimis": "rubric_de_minimis_50t",
            "微量": "rubric_de_minimis_50t",
            "cbam": "rule_3162",
            "7318": "cn_7318_15_88",
            "7208": "cn_7208_10_00",
            "7308": "cn_7308",
            "钢结构": "cn_7308",
            "结构件": "cn_7308",
            "structure": "cn_7308",
            "beam": "mat_steel_structure",
            "梁": "mat_steel_structure",
            "螺栓": "cn_7318_15_42",
            "螺钉": "cn_7318_15_88",
            "废料": "mat_hot_rolled_plate",
            "scrap": "mat_hot_rolled_plate",
            "前体": "mat_hot_rolled_plate",
            "precursor": "mat_hot_rolled_plate",
        }
        for alias, target in aliases.items():
            if alias in q and nid == target:
                score += 4.0
        if score > 0:
            scored.append((score, nid))
    scored.sort(key=lambda x: (-x[0], x[1]))
    return [node_payload(nid) for _, nid in scored[:limit]]


def governance_for_processes(process_ids: list[str]) -> list[dict[str, Any]]:
    g = get_graph()
    out: list[dict[str, Any]] = []
    for pid in process_ids:
        if pid not in g:
            continue
        for _, v, d in g.out_edges(pid, data=True):
            if d.get("rel") == "GOVERNED_BY":
                out.append(
                    {
                        "process_id": pid,
                        "process_en": g.nodes[pid].get("name_en"),
                        "process_zh": g.nodes[pid].get("name_zh"),
                        "rule_id": v,
                        "rule_en": g.nodes[v].get("name_en"),
                        "rule_zh": g.nodes[v].get("name_zh"),
                        "direct_status": d.get("direct_status"),
                        "indirect_status": d.get("indirect_status"),
                        "cite": d.get("cite"),
                    }
                )
    return out


def precursor_edge(
    source_material: str = "mat_hot_rolled_plate",
    target_material: str = "mat_fastener_bolt",
) -> dict[str, Any] | None:
    g = get_graph()
    if not g.has_edge(source_material, target_material):
        return None
    d = list(g.get_edge_data(source_material, target_material).values())[0]
    if d.get("rel") != "PRECURSOR_OF":
        return None
    return edge_payload(source_material, target_material, d)


def get_compliance_cypher(
    source_id: str = "proc_blast_furnace",
    target_id: str = "cn_7308",
    max_hops: int = 8,
) -> str:
    """Canonical Cypher pattern matching query (matching Slide 13).

    Directly traces multi-hop path from upstream Baowu Blast Furnace through
    materials and fabrication processes down to official CBAM CN code,
    inspecting §3.16.2 regulatory boundaries along the way.
    """
    return f"""// GreenGru Metallurgical & CBAM Regulatory Multi-Hop Query
// Problem: Trace lineage from Baowu upstream down to target product and inspect CBAM exclusions
MATCH p = (source:Entity {{id: '{source_id}'}})-[:FEEDS|PRODUCES|PRECURSOR_OF|HAS_CN_CODE*1..{max_hops}]->(target:Entity {{id: '{target_id}'}})
OPTIONAL MATCH (sme:Entity)-[gov:GOVERNED_BY]->(rule:Entity {{id: 'rule_3162'}})
RETURN p AS supply_chain_path,
       length(p) AS hop_count,
       collect(DISTINCT {{
           process: sme.id,
           direct_status: gov.direct_status,
           scope2_status: gov.indirect_status,
           legal_basis: gov.cite
       }}) AS regulatory_boundaries
ORDER BY length(p) ASC
LIMIT 5;"""
