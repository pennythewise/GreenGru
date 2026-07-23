"""LangChain markdown chunking with math-safe boundaries for KB ingest."""

from __future__ import annotations

import re
from dataclasses import dataclass

from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter

# Protect display/inline math and fenced math from mid-formula splits.
_MATH_BLOCK_RE = re.compile(
    r"(\$\$.*?\$\$|\\\[.*?\\\]|```(?:math|latex)?\n.*?```)",
    re.DOTALL,
)
_PLACEHOLDER = "⟦MATHBLOCK_{i}⟧"


@dataclass
class KbChunk:
    text: str
    heading_path: str
    chunk_index: int


def _protect_math(text: str) -> tuple[str, list[str]]:
    blocks: list[str] = []

    def _repl(match: re.Match[str]) -> str:
        blocks.append(match.group(0))
        return _PLACEHOLDER.format(i=len(blocks) - 1)

    return _MATH_BLOCK_RE.sub(_repl, text), blocks


def _restore_math(text: str, blocks: list[str]) -> str:
    out = text
    for i, block in enumerate(blocks):
        out = out.replace(_PLACEHOLDER.format(i=i), block)
    return out


def chunk_markdown(
    markdown: str,
    *,
    chunk_size: int = 1200,
    chunk_overlap: int = 150,
) -> list[KbChunk]:
    """Split markdown by headers, then recursively, without breaking math blocks."""
    text = markdown.strip()
    if not text:
        return []

    protected, math_blocks = _protect_math(text)

    headers_to_split_on = [
        ("#", "h1"),
        ("##", "h2"),
        ("###", "h3"),
    ]
    md_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=headers_to_split_on,
        strip_headers=False,
    )
    try:
        docs = md_splitter.split_text(protected)
    except Exception:  # noqa: BLE001 — malformed md → single doc
        docs = []

    if not docs:
        from langchain_core.documents import Document

        docs = [Document(page_content=protected, metadata={})]

    char_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks: list[KbChunk] = []
    idx = 0
    for doc in docs:
        meta = doc.metadata or {}
        heading_parts = [meta[k] for k in ("h1", "h2", "h3") if meta.get(k)]
        heading_path = " > ".join(heading_parts)
        for piece in char_splitter.split_text(doc.page_content):
            restored = _restore_math(piece, math_blocks).strip()
            if not restored:
                continue
            chunks.append(
                KbChunk(text=restored, heading_path=heading_path, chunk_index=idx)
            )
            idx += 1
    return chunks
