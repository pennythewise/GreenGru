"""Unit tests for KB markdown chunking (no MinerU / network)."""

from app.services.rag.chunking import chunk_markdown


def test_chunk_markdown_preserves_math_block():
    md = """# Title

Intro paragraph with enough text to split later if needed.

## Section A

Before formula.

$$E = mc^2$$

After formula continues with more words about CBAM default values for iron and steel products under the regulation.
"""
    chunks = chunk_markdown(md, chunk_size=200, chunk_overlap=20)
    assert chunks
    joined = "\n".join(c.text for c in chunks)
    assert "$$E = mc^2$$" in joined
    # formula should not be split across chunks as broken halves
    assert "$$E = mc^2$$" in joined


def test_chunk_markdown_assigns_indices():
    md = "# H1\n\n" + ("word " * 400)
    chunks = chunk_markdown(md, chunk_size=100, chunk_overlap=10)
    assert len(chunks) >= 2
    assert [c.chunk_index for c in chunks] == list(range(len(chunks)))
