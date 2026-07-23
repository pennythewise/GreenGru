"""Ingest EU CBAM operator guidance PDF into the channel-scoped KB.

Pipeline: MinerU (PDF → Markdown) → LangChain math-safe chunk →
Qwen3-Embedding-8B → Supabase ``kb_chunks`` (or local JSON fallback).

Usage (from ``backend/`` with venv active)::

    python -m scripts.ingest_kb_cbam
    python -m scripts.ingest_kb_cbam --pdf "C:/Users/.../Guidance....pdf"
    python -m scripts.ingest_kb_cbam --skip-mineru   # use existing markdown only

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

# Allow ``python -m scripts.ingest_kb_cbam`` from backend/
BACKEND_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_ROOT.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

DEFAULT_PDF = Path(
    r"C:\Users\ACER\Downloads\Guidance document on CBAM implementation "
    r"for installation operators outside the EU.pdf"
)
KB_DIR = REPO_ROOT / "knowledge" / "cbam"
SOURCE_DIR = KB_DIR / "source"
MARKDOWN_DIR = KB_DIR / "markdown"
CANONICAL_MD_NAME = "cbam-installation-operator-guidance-EN.md"


async def _run(args: argparse.Namespace) -> int:
    from app.services.rag.embed_store import ingest_markdown_to_kb
    from app.services.rag.mineru_convert import convert_pdf_to_markdown

    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    MARKDOWN_DIR.mkdir(parents=True, exist_ok=True)

    pdf_path = Path(args.pdf).expanduser().resolve() if args.pdf else DEFAULT_PDF
    md_path = MARKDOWN_DIR / CANONICAL_MD_NAME

    convert_meta: dict = {"method": "skipped", "markdown_path": str(md_path)}

    if not args.skip_mineru:
        if not pdf_path.is_file():
            # Fall back to repo primary-sources copy
            alt = (
                REPO_ROOT
                / ".claude"
                / "skills"
                / "carbon-passport-project"
                / "references"
                / "primary-sources"
                / "cbam-installation-operator-guidance-EN.pdf"
            )
            if alt.is_file():
                pdf_path = alt
            else:
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
    content_hash_bytes = (
        (SOURCE_DIR / Path(args.pdf or DEFAULT_PDF).name).read_bytes()
        if (SOURCE_DIR / Path(args.pdf or DEFAULT_PDF).name).is_file()
        else markdown.encode("utf-8")
    )
    # Prefer hashing the copied source PDF if present
    source_pdfs = list(SOURCE_DIR.glob("*.pdf"))
    if source_pdfs:
        content_hash_bytes = source_pdfs[0].read_bytes()

    result = await ingest_markdown_to_kb(
        markdown=markdown,
        channel="cbam",
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

        hits = retrieve_kb(channel="cbam", query=args.query, k=args.k, language=args.lang)
        print(f"\n--- Smoke retrieve ({len(hits)} hits) for: {args.query!r} ---\n")
        print(format_chunks_for_prompt(hits) or "(no hits — ingest/embeddings missing?)")

    return 0 if result.get("stored") else 2


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest EU CBAM guidance into kb_chunks")
    parser.add_argument(
        "--pdf",
        default=None,
        help=f"Path to CBAM guidance PDF (default: {DEFAULT_PDF})",
    )
    parser.add_argument("--lang", default="en", help="Document language code (default: en)")
    parser.add_argument(
        "--backend",
        default="pipeline",
        help="MinerU backend (default: pipeline — CPU-friendly)",
    )
    parser.add_argument(
        "--skip-mineru",
        action="store_true",
        help="Skip PDF convert; embed existing knowledge/cbam/markdown/*.md",
    )
    parser.add_argument(
        "--query",
        default="default values for iron and steel",
        help="Optional smoke-test retrieval query (empty string to skip)",
    )
    parser.add_argument("--k", type=int, default=4, help="Top-k for smoke retrieve")
    args = parser.parse_args()
    if args.query == "":
        args.query = None
    raise SystemExit(asyncio.run(_run(args)))


if __name__ == "__main__":
    main()
