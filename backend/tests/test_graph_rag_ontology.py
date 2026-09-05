"""Graph RAG ontology & traversal — CBAM metallurgical-regulatory graph."""

from app.services.graph_rag.math_bridge import precursor_burden_tco2e
from app.services.graph_rag.store import get_graph, paths_between, local_neighborhood


def test_graph_has_four_layers():
    g = get_graph()
    labels = {d.get("layer") for _, d in g.nodes(data=True)}
    assert {"process", "material", "customs", "boundary", "policy", "emission"}.issubset(labels)


def _first_edge(g, u: str, v: str) -> dict:
    data = g.get_edge_data(u, v)
    assert data, f"missing edge {u} → {v}"
    return list(data.values())[0]


def test_baowu_bf_emits_scope1_process_reduction():
    g = get_graph()
    assert g.has_edge("proc_blast_furnace", "emis_scope1_process")
    assert _first_edge(g, "proc_blast_furnace", "emis_scope1_process")["rel"] == "EMITS"


def test_cnc_cutting_direct_excluded_indirect_monitoring_only():
    """Reg (EU) 2025/2547 §3.16.2 — cutting direct excluded; electricity is not CBAM-priced for Annex II steel."""
    g = get_graph()
    edge = _first_edge(g, "proc_cnc_cutting", "rule_3162")
    assert edge["rel"] == "GOVERNED_BY"
    assert edge["direct_status"] == "EXCLUDED"
    assert edge["indirect_status"] == "MONITORING_ONLY_NOT_CBAM_PRICED"


def test_galvanizing_direct_and_indirect_included():
    g = get_graph()
    edge = _first_edge(g, "proc_hot_dip_galvanizing", "rule_3162")
    assert edge["direct_status"] == "INCLUDED"
    assert edge["indirect_status"] == "INCLUDED"


def test_precursor_plate_to_fastener_has_yield_factor():
    g = get_graph()
    edge = _first_edge(g, "mat_hot_rolled_plate", "mat_fastener_bolt")
    assert edge["rel"] == "PRECURSOR_OF"
    assert abs(edge["yield_factor_m"] - 1.176) < 1e-3  # 15% scrap → 1/0.85


def test_precursor_burden_is_deterministic():
    # 1.176 × 2.2 = 2.5872 — code only, never LLM
    assert abs(precursor_burden_tco2e(see_precursor=2.2, yield_factor_m=1.176) - 2.5872) < 1e-6


def test_multi_hop_path_baowu_to_fastener_cn():
    paths = paths_between("proc_blast_furnace", "cn_7318_15_88", max_hops=8)
    assert paths, "expected at least one multi-hop path BF → fastener CN"
    joined = " → ".join(paths[0]["node_ids"])
    assert "mat_hot_rolled_plate" in joined or "cn_7208_10_00" in joined


def test_local_neighborhood_includes_policy_alignment():
    nodes, edges = local_neighborhood("cn_7318_15_88", hops=2)
    ids = {n["id"] for n in nodes}
    assert "policy_15_5_ch21_s2" in ids or any(n.get("layer") == "policy" for n in nodes)
    assert edges


def test_locked_cn_codes_only():
    """Ontology customs nodes must stay within PRD §6.1 eight codes (no CN 7308 expansion)."""
    g = get_graph()
    codes = {
        d["cn_code"]
        for _, d in g.nodes(data=True)
        if d.get("layer") == "customs" and d.get("cn_code")
    }
    allowed = {
        "7207",
        "7208 10 00",
        "7213",
        "7214",
        "7301",
        "7302",
        "7318 15 42",
        "7318 15 88",
        "7326",
    }
    assert codes.issubset(allowed)
