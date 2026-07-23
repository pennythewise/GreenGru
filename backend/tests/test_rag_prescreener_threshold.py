"""Unit tests for Stage 1 RAG threshold / top-k / confidence (no network)."""

from app.services.rag.retrieve import (
    SIMILARITY_THRESHOLD,
    RetrievedChunk,
    _apply_threshold_top_k,
    _confidence,
    _cosine,
)


def test_cosine_identical():
    v = [1.0, 0.0, 0.0]
    assert abs(_cosine(v, v) - 1.0) < 1e-9


def test_threshold_keeps_only_ge_70_and_top3():
    rows = [
        RetrievedChunk("a", "", "u1", 0.91, 0, "loan", "zh", "upload"),
        RetrievedChunk("b", "", "u2", 0.85, 1, "loan", "zh", "upload"),
        RetrievedChunk("c", "", "u3", 0.72, 2, "loan", "zh", "upload"),
        RetrievedChunk("d", "", "u4", 0.69, 3, "loan", "zh", "upload"),
        RetrievedChunk("e", "", "u5", 0.95, 4, "loan", "zh", "upload"),
    ]
    top, kept = _apply_threshold_top_k(rows, k=3, threshold=SIMILARITY_THRESHOLD)
    assert len(top) == 3
    assert [round(c.similarity, 2) for c in top] == [0.95, 0.91, 0.85]
    assert len(kept) == 3
    assert all(c.similarity >= 0.70 for c in kept)


def test_confidence_is_mean_of_kept():
    rows = [
        RetrievedChunk("a", "", "u1", 0.9, 0, "loan", "zh", "upload"),
        RetrievedChunk("b", "", "u2", 0.8, 1, "loan", "zh", "upload"),
    ]
    assert abs(_confidence(rows) - 0.85) < 1e-9
    assert _confidence([]) == 0.0


def test_fixed_threshold_constant():
    assert SIMILARITY_THRESHOLD == 0.70
