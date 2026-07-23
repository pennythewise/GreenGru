"""Ingest GB/T 36132 绿色工厂评价通则 into the grant-channel KB.

Pipeline: MinerU (PDF → Markdown) → LangChain math-safe chunk →
Qwen3-Embedding-8B → Supabase ``kb_chunks`` (or local JSON fallback).

Usage (from ``backend/`` with venv active)::

    python -m scripts.ingest_kb_grant
    python -m scripts.ingest_kb_grant --pdf "path/to/GB-T-36132.pdf"
    python -m scripts.ingest_kb_grant --skip-mineru

Requires: ``langchain-text-splitters``, ``LLM_API_KEY`` for real embeddings
(or ``LLM_MOCK_MODE=true`` for mock vectors). Apply
``supabase/migrations/0003_kb_chunks.sql`` for cloud storage.
"""

from __future__ import annotations

import argparse
import asyncio
import shutil
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_ROOT.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

PRIMARY_PDF = (
    REPO_ROOT
    / ".claude"
    / "skills"
    / "carbon-passport-project"
    / "references"
    / "primary-sources"
    / "GB-T-36132-2025-绿色工厂评价通则.pdf"
)
KB_DIR = REPO_ROOT / "knowledge" / "grant"
SOURCE_DIR = KB_DIR / "source"
MARKDOWN_DIR = KB_DIR / "markdown"
CANONICAL_MD_NAME = "GB-T-36132-2025-green-factory-evaluation.md"


async def _run(args: argparse.Namespace) -> int:
    from app.services.rag.embed_store import ingest_markdown_to_kb
    from app.services.rag.mineru_convert import convert_pdf_to_markdown

    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    MARKDOWN_DIR.mkdir(parents=True, exist_ok=True)

    pdf_path = Path(args.pdf).expanduser().resolve() if args.pdf else PRIMARY_PDF
    md_path = MARKDOWN_DIR / CANONICAL_MD_NAME

    convert_meta: dict = {"method": "skipped", "markdown_path": str(md_path)}

    if not args.skip_mineru:
        if not pdf_path.is_file():
            print(f"ERROR: PDF not found: {pdf_path}", file=sys.stderr)
            return 1

        dest_pdf = SOURCE_DIR / pdf_path.name
        if pdf_path.resolve() != dest_pdf.resolve():
            shutil.copy2(pdf_path, dest_pdf)
            print(f"Copied PDF -> {dest_pdf}")
        else:
            dest_pdf = pdf_path

        convert_meta = convert_pdf_to_markdown(
            dest_pdf,
            output_md_path=md_path,
            work_dir=MARKDOWN_DIR / "_mineru_work",
            lang=args.lang,
            backend=args.backend,
        )
        print(
            f"Convert method={convert_meta['method']} "
            f"chars={convert_meta['char_count']} -> {md_path}"
        )
    else:
        if not md_path.is_file():
            print(f"ERROR: --skip-mineru but missing {md_path}", file=sys.stderr)
            return 1
        print(f"Using existing markdown: {md_path}")

    markdown = md_path.read_text(encoding="utf-8")
    source_pdfs = list(SOURCE_DIR.glob("*.pdf"))
    content_hash_bytes = (
        source_pdfs[0].read_bytes() if source_pdfs else markdown.encode("utf-8")
    )

    result = await ingest_markdown_to_kb(
        markdown=markdown,
        channel="grant",
        language=args.lang,
        source_file=md_path.name,
        content_for_hash=content_hash_bytes,
    )
    print(
        f"Ingest stored={result.get('stored')} "
        f"chunks={result.get('chunk_count')} "
        f"storage={result.get('storage')} "
        f"hash={result.get('file_hash')}"
    )
    if args.query:
        from app.services.rag.retrieve import format_chunks_for_prompt, retrieve_kb

        hits = retrieve_kb(
            channel="grant", query=args.query, k=args.k, language=args.lang
        )
        print(f"\n--- Smoke retrieve ({len(hits)} hits) for: {args.query!r} ---\n")
        print(format_chunks_for_prompt(hits) or "(no hits — ingest/embeddings missing?)")

    return 0 if result.get("stored") else 2


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Ingest GB/T 36132 green factory standard into kb_chunks (channel=grant)"
    )
    parser.add_argument(
        "--pdf",
        default=None,
        help=f"Path to GB/T 36132 PDF (default: {PRIMARY_PDF})",
    )
    parser.add_argument(
        "--lang",
        default="zh",
        help="Document language code (default: zh — 通则 is Chinese)",
    )
    parser.add_argument(
        "--backend",
        default="pipeline",
        help="MinerU backend (default: pipeline — CPU-friendly)",
    )
    parser.add_argument(
        "--skip-mineru",
        action="store_true",
        help="Skip PDF convert; embed existing knowledge/grant/markdown/*.md",
    )
    parser.add_argument(
        "--query",
        default="绿色工厂 评价指标 废钢比 计量覆盖",
        help="Optional smoke-test retrieval query (empty string to skip)",
    )
    parser.add_argument("--k", type=int, default=4, help="Top-k for smoke retrieve")
    args = parser.parse_args()
    if args.query == "":
        args.query = None
    raise SystemExit(asyncio.run(_run(args)))


if __name__ == "__main__":
    main()
