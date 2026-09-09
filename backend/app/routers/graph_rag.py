"""Graph RAG API — metallurgical / regulatory knowledge graph for CBAM advisory."""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.services.graph_rag import DEMO_QUERY_EN, DEMO_QUERY_ZH, run_graph_rag, serialize_full_graph
from app.services.graph_rag.chat import chat_graph_rag
from app.services.graph_rag.store import local_neighborhood, match_entities, paths_between

router = APIRouter(prefix="/api/graph-rag", tags=["graph-rag"])


class GraphRagQueryRequest(BaseModel):
    query: str = Field(default="", description="Natural-language compliance question (zh or en)")
    locale: str = Field(default="zh", pattern="^(zh|en)$")
    see_precursor_tco2e: float = Field(
        default=2.2,
        ge=0,
        description="Already-computed Baowu plate SEE (tCO2e/t) — never invented by LLM",
    )
    fabrication_ae_tco2e: float = Field(
        default=0.08,
        ge=0,
        description="Included fabrication direct ae only (e.g. galvanizing) — not Scope 2 for steel CBAM",
    )
    include_full_layout: bool = False


class GraphRagChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant|system)$")
    content: str = Field(min_length=1)


class GraphRagChatRequest(BaseModel):
    messages: list[GraphRagChatMessage] = Field(min_length=1)
    locale: str = Field(default="zh", pattern="^(zh|en)$")
    graph_context: dict = Field(
        default_factory=dict,
        description="On-screen Graph RAG result (live or mock) — numbers already computed",
    )


@router.get("/graph")
async def get_full_graph():
    """Full seeded ontology with spring-layout coordinates for the visualizer."""
    return serialize_full_graph()


@router.get("/demo-query")
async def demo_query(locale: str = Query(default="zh", pattern="^(zh|en)$")):
    return {
        "locale": locale,
        "query": DEMO_QUERY_ZH if locale == "zh" else DEMO_QUERY_EN,
    }


@router.post("/query")
async def query_graph_rag(payload: GraphRagQueryRequest):
    """Plan → Route → Execute → Evaluate → Generate (code-orchestrated, max 1 back-edge)."""
    q = payload.query.strip()
    if not q:
        q = DEMO_QUERY_ZH if payload.locale == "zh" else DEMO_QUERY_EN
    return run_graph_rag(
        q,
        locale=payload.locale,
        see_precursor_tco2e=payload.see_precursor_tco2e,
        fabrication_ae_tco2e=payload.fabrication_ae_tco2e,
        include_full_layout=payload.include_full_layout,
    )


@router.post("/chat")
async def chat_with_graph_rag(payload: GraphRagChatRequest):
    """Section C follow-up chat — Qwen explains injected Graph RAG context only."""
    try:
        return chat_graph_rag(
            messages=[m.model_dump() for m in payload.messages],
            graph_context=payload.graph_context or {},
            locale=payload.locale,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/paths")
async def get_paths(
    source: str = Query(default="proc_blast_furnace"),
    target: str = Query(default="cn_7318_15_88"),
    max_hops: int = Query(default=8, ge=1, le=12),
):
    return {"source": source, "target": target, "paths": paths_between(source, target, max_hops=max_hops)}


@router.get("/neighborhood")
async def get_neighborhood(
    center: str = Query(default="mat_hot_rolled_plate"),
    hops: int = Query(default=2, ge=1, le=4),
):
    nodes, edges = local_neighborhood(center, hops=hops)
    return {"center": center, "hops": hops, "nodes": nodes, "edges": edges}


@router.get("/entities")
async def get_entities(q: str = Query(min_length=1)):
    return {"query": q, "entities": match_entities(q)}
