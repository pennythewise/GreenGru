"""Ingest loan-channel KB: 绿色金融支持项目目录 + GB/T 36132 绿色工厂评价通则.

Pipeline: MinerU (PDF → Markdown) → LangChain math-safe chunk →
Qwen3-Embedding-8B → Supabase ``kb_chunks`` (channel=loan) or local JSON.

Usage (from ``backend/`` with venv active)::

    python -m scripts.ingest_kb_loan
    python -m scripts.ingest_kb_loan --skip-mineru
    python -m scripts.ingest_kb_loan --only catalogue   # 目录 only
    python -m scripts.ingest_kb_loan --only factory     # 通则 only

Requires: ``langchain-text-splitters``, ``LLM_API_KEY`` for real embeddings
(or ``LLM_MOCK_MODE=true`` for mock vectors). Apply
``supabase/migrations/0003_kb_chunks.sql`` for cloud storage.
"""

from __future__ import annotations

import argparse
import asyncio
import shutil
import sys
from dataclasses import dataclass
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_ROOT.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

PRIMARY_SOURCES = (
    REPO_ROOT
    / ".claude"
    / "skills"
    / "carbon-passport-project"
    / "references"
    / "primary-sources"
)

KB_DIR = REPO_ROOT / "knowledge" / "loan"
SOURCE_DIR = KB_DIR / "source"
MARKDOWN_DIR = KB_DIR / "markdown"

# Optional reuse of grant convert output to skip a second MinerU/pypdf pass.
GRANT_FACTORY_MD = (
    REPO_ROOT
    / "knowledge"
    / "grant"
    / "markdown"
    / "GB-T-36132-2025-green-factory-evaluation.md"
)


@dataclass(frozen=True)
class LoanSource:
    key: str
    pdf_name: str
    md_name: str
    label: str


SOURCES: tuple[LoanSource, ...] = (
    LoanSource(
        key="catalogue",
        pdf_name="绿色金融支持项目目录-2025年版.pdf",
        md_name="green-finance-catalogue-2025.md",
        label="绿色金融支持项目目录（2025）",
    ),
    LoanSource(
        key="factory",
        pdf_name="GB-T-36132-2025-绿色工厂评价通则.pdf",
        md_name="GB-T-36132-2025-green-factory-evaluation.md",
        label="GB/T 36132 绿色工厂评价通则",
    ),
)


async def _ingest_one(
    src: LoanSource,
    *,
    skip_mineru: bool,
    lang: str,
    backend: str,
) -> dict:
    from app.services.rag.embed_store import ingest_markdown_to_kb
    from app.services.rag.mineru_convert import convert_pdf_to_markdown

    pdf_path = PRIMARY_SOURCES / src.pdf_name
    md_path = MARKDOWN_DIR / src.md_name

    if not skip_mineru:
        # Prefer existing grant markdown for factory to avoid a slow re-convert.
        if (
            src.key == "factory"
            and GRANT_FACTORY_MD.is_file()
            and not md_path.is_file()
        ):
            shutil.copy2(GRANT_FACTORY_MD, md_path)
            print(f"Reused grant markdown -> {md_path}")
        elif not pdf_path.is_file():
            raise FileNotFoundError(f"PDF not found: {pdf_path}")
        else:
            dest_pdf = SOURCE_DIR / pdf_path.name
            if pdf_path.resolve() != dest_pdf.resolve():
                shutil.copy2(pdf_path, dest_pdf)
                print(f"Copied PDF -> {dest_pdf}")
            else:
                dest_pdf = pdf_path

            convert_meta = convert_pdf_to_markdown(
                dest_pdf,
                output_md_path=md_path,
                work_dir=MARKDOWN_DIR / f"_mineru_work_{src.key}",
                lang=lang,
                backend=backend,
            )
            print(
                f"[{src.key}] Convert method={convert_meta['method']} "
                f"chars={convert_meta['char_count']} -> {md_path}"
            )
    else:
        if not md_path.is_file() and src.key == "factory" and GRANT_FACTORY_MD.is_file():
            shutil.copy2(GRANT_FACTORY_MD, md_path)
            print(f"Reused grant markdown -> {md_path}")
        if not md_path.is_file():
            raise FileNotFoundError(f"--skip-mineru but missing {md_path}")
        print(f"[{src.key}] Using existing markdown: {md_path}")

    markdown = md_path.read_text(encoding="utf-8")
    content_for_hash = (
        pdf_path.read_bytes() if pdf_path.is_file() else markdown.encode("utf-8")
    )

    result = await ingest_markdown_to_kb(
        markdown=markdown,
        channel="loan",
        language=lang,
        source_file=md_path.name,
        content_for_hash=content_for_hash,
    )
    print(
        f"[{src.key}] Ingest stored={result.get('stored')} "
        f"chunks={result.get('chunk_count')} "
        f"storage={result.get('storage')} "
        f"hash={result.get('file_hash')}"
    )
    return result


async def _run(args: argparse.Namespace) -> int:
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    MARKDOWN_DIR.mkdir(parents=True, exist_ok=True)

    selected = [
        s
        for s in SOURCES
        if args.only in (None, "all", s.key)
    ]
    if not selected:
        print(f"ERROR: unknown --only={args.only!r}", file=sys.stderr)
        return 1

    any_ok = False
    for src in selected:
        try:
            result = await _ingest_one(
                src,
                skip_mineru=args.skip_mineru,
                lang=args.lang,
                backend=args.backend,
            )
            any_ok = any_ok or bool(result.get("stored"))
        except Exception as exc:  # noqa: BLE001
            print(f"ERROR [{src.key}] {exc}", file=sys.stderr)
            return 1

    if args.query:
        from app.services.rag.retrieve import format_chunks_for_prompt, retrieve_kb

        hits = retrieve_kb(
            channel="loan", query=args.query, k=args.k, language=args.lang
        )
        print(f"\n--- Smoke retrieve ({len(hits)} hits) for: {args.query!r} ---\n")
        print(format_chunks_for_prompt(hits) or "(no hits — ingest/embeddings missing?)")

    return 0 if any_ok else 2


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Ingest 绿色金融支持项目目录 + GB/T 36132 into kb_chunks (channel=loan)"
        )
    )
    parser.add_argument(
        "--only",
        choices=("all", "catalogue", "factory"),
        default="all",
        help="Which source(s) to ingest (default: all)",
    )
    parser.add_argument(
        "--lang",
        default="zh",
        help="Document language code (default: zh)",
    )
    parser.add_argument(
        "--backend",
        default="pipeline",
        help="MinerU backend (default: pipeline — CPU-friendly)",
    )
    parser.add_argument(
        "--skip-mineru",
        action="store_true",
        help="Skip PDF convert; embed existing knowledge/loan/markdown/*.md",
    )
    parser.add_argument(
        "--query",
        default="绿色金融 支持项目 钢铁 废钢 绿色工厂 贷款用途 目录",
        help="Optional smoke-test retrieval query (empty string to skip)",
    )
    parser.add_argument("--k", type=int, default=4, help="Top-k for smoke retrieve")
    args = parser.parse_args()
    if args.query == "":
        args.query = None
    raise SystemExit(asyncio.run(_run(args)))


if __name__ == "__main__":
    main()
