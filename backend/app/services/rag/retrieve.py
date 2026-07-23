"""Retrieve channel-scoped KB / upload / form chunks for Stage 1 pre-screener RAG.

Stage 1 hybrid (default):
  1. Load Section A upload + application-form embeddings + regulatory KB
  2. Cosine-compare each user chunk to the KB
  3. Keep scores ≥ SIMILARITY_THRESHOLD (70%)
  4. Return top-k (default 3) by relevancy + confidence_score
"""

from __future__ import annotations

import json
import logging
import math
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Literal

from app.config import get_settings
from app.services.pdf_embedding import embed_texts
from app.services.supabase_store import _get_supabase_client

logger = logging.getLogger(__name__)
settings = get_settings()

Channel = Literal["cbam", "loan", "grant"]
RagSource = Literal["uploads", "kb", "hybrid"]

SIMILARITY_THRESHOLD = 0.70
DEFAULT_TOP_K = 3
_MAX_UPLOAD_LOAD = 200
_MAX_KB_LOAD = 800


@dataclass
class RetrievedChunk:
    chunk_text: str
    heading_path: str
    source_file: str
    similarity: float
    chunk_index: int
    channel: str
    language: str
    corpus: str = "kb"  # "kb" | "upload" | "form"
    matched_kb_file: str = ""
    matched_kb_heading: str = ""
    checklist_item: str = ""


@dataclass
class PrescreenerResult:
    chunks: list[RetrievedChunk]
    confidence_score: float
    threshold: float = SIMILARITY_THRESHOLD
    passes_threshold: bool = False
    ranked_pool_size: int = 0
    upload_chunks_scored: int = 0
    form_chunks_scored: int = 0
    kb_chunks_compared: int = 0
    matched_kb_files: list[str] = field(default_factory=list)


@dataclass
class _EmbeddedRow:
    chunk_text: str
    heading_path: str
    source_file: str
    chunk_index: int
    channel: str
    language: str
    corpus: str
    embedding: list[float]
    checklist_item: str = ""


def _cosine(a: list[float], b: list[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b, strict=True))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def _as_vec(raw: Any) -> list[float]:
    if raw is None:
        return []
    if isinstance(raw, str):
        try:
            raw = json.loads(raw)
        except json.JSONDecodeError:
            return []
    if not isinstance(raw, (list, tuple)):
        return []
    try:
        return [float(x) for x in raw]
    except (TypeError, ValueError):
        return []


def _corpus_for(checklist_item: str, source_file: str, default: str = "upload") -> str:
    item = (checklist_item or "").strip().lower()
    src = (source_file or "").strip().lower()
    if item == "application_form" or "application-form" in src:
        return "form"
    return default


def _confidence(chunks: list[RetrievedChunk]) -> float:
    if not chunks:
        return 0.0
    return sum(c.similarity for c in chunks) / len(chunks)


def _apply_threshold_top_k(
    scored: list[RetrievedChunk],
    *,
    k: int,
    threshold: float = SIMILARITY_THRESHOLD,
) -> tuple[list[RetrievedChunk], list[RetrievedChunk]]:
    """Return (top_k_overall, those_among_them_meeting_threshold)."""
    ranked = sorted(scored, key=lambda c: c.similarity, reverse=True)
    top = ranked[: max(k, 1)]
    kept = [c for c in top if c.similarity >= threshold]
    return top, kept


def _search_local_kb(
    *,
    channel: Channel,
    query_vec: list[float],
    k: int,
    language: str | None,
) -> list[RetrievedChunk]:
    root = Path(settings.local_storage_dir) / "kb_embeddings" / channel
    if not root.is_dir():
        return []

    scored: list[RetrievedChunk] = []
    for path in root.glob("*.json"):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except Exception:  # noqa: BLE001
            continue
        if language and payload.get("language") and payload["language"] != language:
            continue
        for row in payload.get("chunks") or []:
            emb = _as_vec(row.get("embedding"))
            sim = _cosine(query_vec, emb)
            scored.append(
                RetrievedChunk(
                    chunk_text=row.get("chunk_text") or "",
                    heading_path=row.get("heading_path") or "",
                    source_file=payload.get("source_file") or path.name,
                    similarity=sim,
                    chunk_index=int(row.get("chunk_index") or 0),
                    channel=channel,
                    language=payload.get("language") or "en",
                    corpus="kb",
                )
            )
    scored.sort(key=lambda c: c.similarity, reverse=True)
    return scored[:k]


def _search_local_uploads(
    *,
    channel: Channel,
    upload_session_id: str,
    query_vec: list[float],
    k: int,
    language: str | None,
) -> list[RetrievedChunk]:
    root = (
        Path(settings.local_storage_dir)
        / "upload_embeddings"
        / channel
        / upload_session_id
    )
    if not root.is_dir():
        return []

    scored: list[RetrievedChunk] = []
    for path in root.glob("*.json"):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except Exception:  # noqa: BLE001
            continue
        if language and payload.get("language") and payload["language"] != language:
            continue
        checklist = payload.get("checklist_item") or ""
        src = payload.get("source_file") or path.name
        for row in payload.get("chunks") or []:
            emb = _as_vec(row.get("embedding"))
            sim = _cosine(query_vec, emb)
            scored.append(
                RetrievedChunk(
                    chunk_text=row.get("chunk_text") or "",
                    heading_path=row.get("heading_path") or "",
                    source_file=src,
                    similarity=sim,
                    chunk_index=int(row.get("chunk_index") or 0),
                    channel=channel,
                    language=payload.get("language") or "en",
                    corpus=_corpus_for(checklist, src),
                    checklist_item=checklist,
                )
            )
    scored.sort(key=lambda c: c.similarity, reverse=True)
    return scored[:k]


def _rpc_kb(
    *,
    client: Any,
    query_vec: list[float],
    channel: Channel,
    k: int,
    language: str | None,
) -> list[RetrievedChunk]:
    params: dict[str, Any] = {
        "query_embedding": query_vec,
        "match_channel": channel,
        "match_count": k,
    }
    if language:
        params["match_language"] = language
    resp = client.rpc("match_kb_chunks", params).execute()
    rows = resp.data or []
    return [
        RetrievedChunk(
            chunk_text=r.get("chunk_text") or "",
            heading_path=r.get("heading_path") or "",
            source_file=r.get("source_file") or "",
            similarity=float(r.get("similarity") or 0.0),
            chunk_index=int(r.get("chunk_index") or 0),
            channel=r.get("channel") or channel,
            language=r.get("language") or "en",
            corpus="kb",
        )
        for r in rows
    ]


def _rpc_uploads(
    *,
    client: Any,
    query_vec: list[float],
    channel: Channel,
    upload_session_id: str,
    k: int,
    language: str | None,
) -> list[RetrievedChunk]:
    params: dict[str, Any] = {
        "query_embedding": query_vec,
        "match_channel": channel,
        "match_session": upload_session_id,
        "match_count": k,
    }
    if language:
        params["match_language"] = language
    resp = client.rpc("match_upload_chunks", params).execute()
    rows = resp.data or []
    return [
        RetrievedChunk(
            chunk_text=r.get("chunk_text") or "",
            heading_path=r.get("heading_path") or "",
            source_file=r.get("source_file") or "",
            similarity=float(r.get("similarity") or 0.0),
            chunk_index=int(r.get("chunk_index") or 0),
            channel=r.get("channel") or channel,
            language=r.get("language") or "en",
            corpus=_corpus_for(r.get("checklist_item") or "", r.get("source_file") or ""),
            checklist_item=r.get("checklist_item") or "",
        )
        for r in rows
    ]


def _load_local_embedded(
    *,
    root: Path,
    channel: Channel,
    language: str | None,
    corpus: str,
    limit: int,
) -> list[_EmbeddedRow]:
    if not root.is_dir():
        return []
    out: list[_EmbeddedRow] = []
    for path in sorted(root.glob("*.json")):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except Exception:  # noqa: BLE001
            continue
        if language and payload.get("language") and payload["language"] != language:
            continue
        src = payload.get("source_file") or path.name
        lang = payload.get("language") or "en"
        checklist = payload.get("checklist_item") or ""
        row_corpus = _corpus_for(checklist, src, corpus)
        for row in payload.get("chunks") or []:
            emb = _as_vec(row.get("embedding"))
            if not emb:
                continue
            out.append(
                _EmbeddedRow(
                    chunk_text=row.get("chunk_text") or "",
                    heading_path=row.get("heading_path") or "",
                    source_file=src,
                    chunk_index=int(row.get("chunk_index") or 0),
                    channel=channel,
                    language=lang,
                    corpus=row_corpus,
                    embedding=emb,
                    checklist_item=checklist,
                )
            )
            if len(out) >= limit:
                return out
    return out


def _load_upload_embedded(
    *,
    channel: Channel,
    upload_session_id: str,
    language: str | None,
) -> list[_EmbeddedRow]:
    session = (upload_session_id or "").strip()
    if not session:
        return []

    client = _get_supabase_client()
    if client is not None:
        try:
            q = (
                client.table("upload_chunks")
                .select(
                    "chunk_text,heading_path,source_file,chunk_index,"
                    "channel,language,embedding,checklist_item"
                )
                .eq("channel", channel)
                .eq("upload_session_id", session)
                .limit(_MAX_UPLOAD_LOAD)
            )
            if language:
                q = q.eq("language", language)
            rows = q.execute().data or []
            loaded: list[_EmbeddedRow] = []
            for r in rows:
                emb = _as_vec(r.get("embedding"))
                if not emb:
                    continue
                checklist = r.get("checklist_item") or ""
                src = r.get("source_file") or ""
                loaded.append(
                    _EmbeddedRow(
                        chunk_text=r.get("chunk_text") or "",
                        heading_path=r.get("heading_path") or "",
                        source_file=src,
                        chunk_index=int(r.get("chunk_index") or 0),
                        channel=r.get("channel") or channel,
                        language=r.get("language") or "en",
                        corpus=_corpus_for(checklist, src, "upload"),
                        embedding=emb,
                        checklist_item=checklist,
                    )
                )
            if loaded:
                return loaded
        except Exception as exc:  # noqa: BLE001
            logger.warning("load upload_chunks embeddings failed: %s", exc)

    root = (
        Path(settings.local_storage_dir)
        / "upload_embeddings"
        / channel
        / session
    )
    return _load_local_embedded(
        root=root,
        channel=channel,
        language=language,
        corpus="upload",
        limit=_MAX_UPLOAD_LOAD,
    )


def _load_channel_pdf_uploads(
    *,
    channel: Channel,
    exclude_session: str,
    limit: int = 120,
) -> list[_EmbeddedRow]:
    """Fallback: Section A PDFs from other sessions when current session has none."""
    client = _get_supabase_client()
    if client is None:
        return []
    try:
        rows = (
            client.table("upload_chunks")
            .select(
                "chunk_text,heading_path,source_file,chunk_index,"
                "channel,language,embedding,checklist_item,upload_session_id"
            )
            .eq("channel", channel)
            .neq("checklist_item", "application_form")
            .limit(limit)
            .execute()
            .data
            or []
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("load channel PDF uploads failed: %s", exc)
        return []

    out: list[_EmbeddedRow] = []
    for r in rows:
        if (r.get("upload_session_id") or "") == exclude_session:
            continue
        if (r.get("checklist_item") or "") == "application_form":
            continue
        emb = _as_vec(r.get("embedding"))
        if not emb:
            continue
        checklist = r.get("checklist_item") or ""
        src = r.get("source_file") or ""
        out.append(
            _EmbeddedRow(
                chunk_text=r.get("chunk_text") or "",
                heading_path=r.get("heading_path") or "",
                source_file=src,
                chunk_index=int(r.get("chunk_index") or 0),
                channel=r.get("channel") or channel,
                language=r.get("language") or "en",
                corpus=_corpus_for(checklist, src, "upload"),
                embedding=emb,
                checklist_item=checklist,
            )
        )
    return out


def _load_kb_embedded(
    *,
    channel: Channel,
    language: str | None,
) -> list[_EmbeddedRow]:
    client = _get_supabase_client()
    if client is not None:
        try:
            q = (
                client.table("kb_chunks")
                .select(
                    "chunk_text,heading_path,source_file,chunk_index,"
                    "channel,language,embedding"
                )
                .eq("channel", channel)
                .limit(_MAX_KB_LOAD)
            )
            if language:
                q = q.eq("language", language)
            rows = q.execute().data or []
            loaded: list[_EmbeddedRow] = []
            for r in rows:
                emb = _as_vec(r.get("embedding"))
                if not emb:
                    continue
                loaded.append(
                    _EmbeddedRow(
                        chunk_text=r.get("chunk_text") or "",
                        heading_path=r.get("heading_path") or "",
                        source_file=r.get("source_file") or "",
                        chunk_index=int(r.get("chunk_index") or 0),
                        channel=r.get("channel") or channel,
                        language=r.get("language") or "en",
                        corpus="kb",
                        embedding=emb,
                    )
                )
            if loaded:
                return loaded
        except Exception as exc:  # noqa: BLE001
            logger.warning("load kb_chunks embeddings failed: %s", exc)

    root = Path(settings.local_storage_dir) / "kb_embeddings" / channel
    return _load_local_embedded(
        root=root,
        channel=channel,
        language=language,
        corpus="kb",
        limit=_MAX_KB_LOAD,
    )


def _best_kb_match(
    upload_vec: list[float],
    kb_rows: list[_EmbeddedRow],
) -> tuple[float, _EmbeddedRow | None]:
    best_sim = 0.0
    best: _EmbeddedRow | None = None
    for kb in kb_rows:
        sim = _cosine(upload_vec, kb.embedding)
        if sim > best_sim:
            best_sim = sim
            best = kb
    return best_sim, best


def _score_uploads_against_kb(
    uploads: list[_EmbeddedRow],
    kb_rows: list[_EmbeddedRow],
) -> list[RetrievedChunk]:
    scored: list[RetrievedChunk] = []
    for up in uploads:
        sim, kb = _best_kb_match(up.embedding, kb_rows)
        heading = up.heading_path or ""
        if kb:
            kb_tag = kb.source_file or "kb"
            heading = (
                f"{heading} · ↔ KB:{kb_tag}".strip(" ·")
                if heading
                else f"↔ KB:{kb_tag}"
            )
        scored.append(
            RetrievedChunk(
                chunk_text=up.chunk_text,
                heading_path=heading,
                source_file=up.source_file,
                similarity=sim,
                chunk_index=up.chunk_index,
                channel=up.channel,
                language=up.language,
                corpus=up.corpus,
                matched_kb_file=kb.source_file if kb else "",
                matched_kb_heading=kb.heading_path if kb else "",
                checklist_item=up.checklist_item,
            )
        )
    scored.sort(key=lambda c: c.similarity, reverse=True)
    return scored


def retrieve_uploads(
    *,
    channel: Channel,
    query: str,
    upload_session_id: str,
    k: int = 3,
    language: str | None = "en",
    query_vec: list[float] | None = None,
) -> list[RetrievedChunk]:
    q = (query or "").strip()
    session = (upload_session_id or "").strip()
    if not q or not session:
        return []

    vec = query_vec if query_vec is not None else embed_texts([q])[0]
    client = _get_supabase_client()
    if client is not None:
        try:
            rows = _rpc_uploads(
                client=client,
                query_vec=vec,
                channel=channel,
                upload_session_id=session,
                k=k,
                language=language,
            )
            if rows:
                return rows
        except Exception as exc:  # noqa: BLE001
            logger.warning("match_upload_chunks RPC failed, local fallback: %s", exc)

    return _search_local_uploads(
        channel=channel,
        upload_session_id=session,
        query_vec=vec,
        k=k,
        language=language,
    )


def retrieve_kb(
    *,
    channel: Channel,
    query: str,
    k: int = 6,
    language: str | None = "en",
    query_vec: list[float] | None = None,
) -> list[RetrievedChunk]:
    q = (query or "").strip()
    if not q:
        return []

    logger.info(
        "RAG retrieve · channel=%s · lang=%s · k=%s · query_chars=%s",
        channel,
        language,
        k,
        len(q),
    )
    vec = query_vec if query_vec is not None else embed_texts([q])[0]
    client = _get_supabase_client()
    if client is not None:
        try:
            rows = _rpc_kb(
                client=client,
                query_vec=vec,
                channel=channel,
                k=k,
                language=language,
            )
            if rows:
                return rows
        except Exception as exc:  # noqa: BLE001
            logger.warning("match_kb_chunks RPC failed, local fallback: %s", exc)

    return _search_local_kb(channel=channel, query_vec=vec, k=k, language=language)


def retrieve_prescreener(
    *,
    channel: Channel,
    query: str,
    k: int = DEFAULT_TOP_K,
    language: str | None = "en",
    upload_session_id: str | None = None,
    source: RagSource = "hybrid",
    threshold: float = SIMILARITY_THRESHOLD,
) -> PrescreenerResult:
    """Stage 1: form+Section A uploads ↔ KB cosine, ≥70% gate, top-k + confidence."""
    q = (query or "").strip()
    top_k = max(int(k or DEFAULT_TOP_K), 1)
    empty = PrescreenerResult(
        chunks=[],
        confidence_score=0.0,
        threshold=threshold,
        passes_threshold=False,
    )
    if not q:
        return empty

    logger.info(
        "RAG prescreener · channel=%s · source=%s · session=%s · k=%s · thr=%.2f",
        channel,
        source,
        (upload_session_id or "")[:8] or "-",
        top_k,
        threshold,
    )

    if source == "hybrid" and upload_session_id:
        # Do not language-filter session chunks: Section A may be `ch` while
        # the application form is stored as `zh`.
        uploads = _load_upload_embedded(
            channel=channel,
            upload_session_id=upload_session_id,
            language=None,
        )
        if uploads and not any(u.corpus == "upload" for u in uploads):
            extras = _load_channel_pdf_uploads(
                channel=channel,
                exclude_session=upload_session_id,
            )
            if extras:
                logger.info(
                    "RAG hybrid: session has form only — adding %s channel PDF chunks",
                    len(extras),
                )
                uploads = list(uploads) + extras

        kb_rows = _load_kb_embedded(channel=channel, language=language)
        if not kb_rows and language:
            kb_rows = _load_kb_embedded(channel=channel, language=None)

        if uploads and kb_rows:
            scored = _score_uploads_against_kb(uploads, kb_rows)
            top, kept = _apply_threshold_top_k(
                scored, k=top_k, threshold=threshold
            )
            conf = _confidence(top)
            max_sim = max((c.similarity for c in scored), default=0.0)
            kb_files = sorted({c.matched_kb_file for c in top if c.matched_kb_file})
            n_form = sum(1 for u in uploads if u.corpus == "form")
            n_upload = sum(1 for u in uploads if u.corpus == "upload")
            logger.info(
                "RAG hybrid form+upload↔KB · form=%s · uploads=%s · scored=%s · "
                "top=%s · ge_thr=%s · conf=%.3f · max=%.3f · thr=%.2f",
                n_form,
                n_upload,
                len(scored),
                len(top),
                len(kept),
                conf,
                max_sim,
                threshold,
            )
            return PrescreenerResult(
                chunks=top,
                confidence_score=round(conf, 4),
                threshold=threshold,
                passes_threshold=len(kept) >= top_k and conf >= threshold,
                ranked_pool_size=len(scored),
                upload_chunks_scored=n_upload,
                form_chunks_scored=n_form,
                kb_chunks_compared=len(kb_rows),
                matched_kb_files=kb_files,
            )
        logger.info(
            "RAG hybrid: user_chunks=%s kb=%s — falling back to query↔KB",
            len(uploads),
            len(kb_rows),
        )

    query_vec = embed_texts([q])[0]

    if source == "uploads":
        pool = retrieve_uploads(
            channel=channel,
            query=q,
            upload_session_id=upload_session_id or "",
            k=max(top_k * 5, 15),
            language=language,
            query_vec=query_vec,
        )
        top, kept = _apply_threshold_top_k(pool, k=top_k, threshold=threshold)
        conf = _confidence(top)
        return PrescreenerResult(
            chunks=top,
            confidence_score=round(conf, 4),
            threshold=threshold,
            passes_threshold=len(kept) >= top_k and conf >= threshold,
            ranked_pool_size=len(pool),
            upload_chunks_scored=sum(1 for c in pool if c.corpus != "form"),
            form_chunks_scored=sum(1 for c in pool if c.corpus == "form"),
            kb_chunks_compared=0,
        )

    pool = retrieve_kb(
        channel=channel,
        query=q,
        k=max(top_k * 5, 15),
        language=language,
        query_vec=query_vec,
    )
    top, kept = _apply_threshold_top_k(pool, k=top_k, threshold=threshold)
    conf = _confidence(top)
    return PrescreenerResult(
        chunks=top,
        confidence_score=round(conf, 4),
        threshold=threshold,
        passes_threshold=len(kept) >= top_k and conf >= threshold,
        ranked_pool_size=len(pool),
        upload_chunks_scored=0,
        form_chunks_scored=0,
        kb_chunks_compared=len(pool),
        matched_kb_files=sorted({c.source_file for c in top if c.source_file}),
    )


def format_chunks_for_prompt(chunks: list[RetrievedChunk], *, max_chars: int = 6000) -> str:
    parts: list[str] = []
    used = 0
    for i, c in enumerate(chunks, start=1):
        kb_note = f" · matched_kb={c.matched_kb_file}" if c.matched_kb_file else ""
        block = (
            f"[{i}] ({c.source_file} · {c.heading_path or 'section'} · "
            f"sim={c.similarity:.3f} · {c.corpus}{kb_note})\n"
            f"{c.chunk_text.strip()}"
        )
        if used + len(block) > max_chars:
            break
        parts.append(block)
        used += len(block)
    return "\n\n---\n\n".join(parts)
