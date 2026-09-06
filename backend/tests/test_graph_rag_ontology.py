"""Graph RAG ontology & traversal — CBAM metallurgical-regulatory graph."""

from app.services.graph_rag.math_bridge import precursor_burden_tco2e
from app.services.graph_rag.store import get_graph, paths_between, local_neighborhood


def test_graph_layers_include_bat_and_rubric_not_policy():
    get_graph.cache_clear()
    g = get_graph()
    labels = {d.get("layer") for _, d in g.nodes(data=True)}
    assert {"process", "material", "customs", "boundary", "emission", "bat", "rubric"}.issubset(
        labels
    )
    assert "policy" not in labels
    assert not any(nid.startswith("policy_15_5") for nid in g.nodes)


def test_bat_nodes_cite_stm_bref_markdown():
    get_graph.cache_clear()
    g = get_graph()
    bat_nodes = [nid for nid, d in g.nodes(data=True) if d.get("layer") == "bat"]
    assert len(bat_nodes) >= 6
    zinc = g.nodes["bat_zinc_chromium_plating"]
    assert "zinc" in zinc["source_file"].lower() or "plating" in zinc["source_file"].lower()
    assert "STM BREF" in (zinc.get("document") or "")


def test_stage3_rubric_nodes_present():
    get_graph.cache_clear()
    g = get_graph()
    for nid in (
        "rubric_stage3_threshold_scoring",
        "rubric_cisa_grade_e_to_a",
        "rubric_cbam_risk_tier",
        "rubric_de_minimis_50t",
    ):
        assert nid in g.nodes
        assert g.nodes[nid]["layer"] == "rubric"
    edge = list(g.get_edge_data("rubric_stage3_threshold_scoring", "rubric_cisa_grade_e_to_a").values())[0]
    assert edge["rel"] == "INCLUDES_RUBRIC"


def test_galvanizing_guided_by_bat_and_scored_by_rubric():
    get_graph.cache_clear()
    g = get_graph()
    assert g.has_edge("proc_hot_dip_galvanizing", "bat_zinc_chromium_plating")
    assert (
        list(g.get_edge_data("proc_hot_dip_galvanizing", "bat_zinc_chromium_plating").values())[0][
            "rel"
        ]
        == "GUIDED_BY_BAT"
    )
    assert g.has_edge("mat_fastener_bolt", "rubric_stage3_threshold_scoring")


def test_baowu_bf_emits_scope1_process_reduction():
    g = get_graph()
    assert g.has_edge("proc_blast_furnace", "emis_scope1_process")
    assert list(g.get_edge_data("proc_blast_furnace", "emis_scope1_process").values())[0]["rel"] == "EMITS"


def test_cnc_cutting_direct_excluded_indirect_monitoring_only():
    """Reg (EU) 2025/2547 §3.16.2 — cutting direct excluded; electricity is not CBAM-priced for Annex II steel."""
    g = get_graph()
    edge = list(g.get_edge_data("proc_cnc_cutting", "rule_3162").values())[0]
    assert edge["rel"] == "GOVERNED_BY"
    assert edge["direct_status"] == "EXCLUDED"
    assert edge["indirect_status"] == "MONITORING_ONLY_NOT_CBAM_PRICED"


def test_galvanizing_direct_and_indirect_included():
    g = get_graph()
    edge = list(g.get_edge_data("proc_hot_dip_galvanizing", "rule_3162").values())[0]
    assert edge["direct_status"] == "INCLUDED"
    assert edge["indirect_status"] == "INCLUDED"


def test_precursor_plate_to_fastener_has_yield_factor():
    g = get_graph()
    edge = list(g.get_edge_data("mat_hot_rolled_plate", "mat_fastener_bolt").values())[0]
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


def test_local_neighborhood_includes_bat_not_policy():
    nodes, edges = local_neighborhood("cn_7318_15_88", hops=2)
    ids = {n["id"] for n in nodes}
    layers = {n.get("layer") for n in nodes}
    assert "policy" not in layers
    assert "bat_zinc_chromium_plating" in ids or "bat" in layers or "rubric" in layers
    assert edges


def test_locked_cn_codes_only():
    """Ontology customs nodes must stay within PRD §6.1 (+ optional CN 7308 structures)."""
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
        "7308",  # fabricated structures (EN 1090) — demo ontology extension
        "7318 15 42",
        "7318 15 88",
        "7326",
    }
    assert codes.issubset(allowed)
