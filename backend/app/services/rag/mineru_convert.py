"""Convert PDF/Office docs to Markdown via MinerU, with Qwen-VL then layout fallbacks.

Order (Stage 1 CBAM / loan / grant pre-screener uploads + KB ingest):
  1. MinerU Python API (``third_party/MinerU`` or installed ``mineru``)
  2. MinerU CLI
  3. OpenRouter Qwen-VL (screenshots / scanned pages — when MinerU missing)
  4. PyMuPDF (layout / table-aware text) then pypdf text layer
"""

from __future__ import annotations

import logging
import re
import shutil
import subprocess
import sys
from pathlib import Path

from pypdf import PdfReader

logger = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).resolve().parents[4]
MINERU_ROOT = REPO_ROOT / "third_party" / "MinerU"


def _ensure_mineru_on_path() -> None:
    root = str(MINERU_ROOT)
    if MINERU_ROOT.is_dir() and root not in sys.path:
        sys.path.insert(0, root)


def _find_md_outputs(search_root: Path, stem: str) -> list[Path]:
    if not search_root.is_dir():
        return []
    matches = sorted(search_root.rglob(f"{stem}.md"))
    if matches:
        return matches
    return sorted(p for p in search_root.rglob("*.md") if p.is_file())


def _pymupdf_fallback(pdf_path: Path) -> str:
    """Layout-aware text extract (tables/blocks) via PyMuPDF when available."""
    try:
        import fitz  # PyMuPDF
    except ImportError:
        return ""

    parts: list[str] = []
    doc = fitz.open(str(pdf_path))
    try:
        for i, page in enumerate(doc, start=1):
            # "text" preserves reading order; tables often survive better than pypdf
            text = (page.get_text("text") or "").strip()
            if not text:
                # blocks give coarser layout when plain text is empty
                blocks = page.get_text("blocks") or []
                lines = []
                for b in blocks:
                    if len(b) >= 5 and isinstance(b[4], str) and b[4].strip():
                        lines.append(b[4].strip())
                text = "\n".join(lines).strip()
            if text:
                parts.append(f"## Page {i}\n\n{text}")
    finally:
        doc.close()
    return "\n\n".join(parts).strip()


def _pypdf_fallback(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    parts: list[str] = []
    for i, page in enumerate(reader.pages, start=1):
        text = (page.extract_text() or "").strip()
        if text:
            parts.append(f"## Page {i}\n\n{text}")
    return "\n\n".join(parts).strip()


def _layout_fallback(pdf_path: Path) -> tuple[str, str]:
    """Prefer PyMuPDF for structure; fall back to pypdf."""
    md = _pymupdf_fallback(pdf_path)
    if md.strip():
        return md, "pymupdf_fallback"
    md = _pypdf_fallback(pdf_path)
    return md, "pypdf_fallback"


def _qwen_vl_fallback(pdf_path: Path, *, lang: str) -> str:
    from app.services.rag.qwen_vl_pdf import convert_pdf_with_qwen_vl

    return convert_pdf_with_qwen_vl(pdf_path, lang=lang)


def _normalize_mineru_lang(lang: str) -> str:
    """MinerU pipeline accepts ``ch`` / ``en`` / ``korean`` / ``japan`` — not ``zh``."""
    m = (lang or "en").lower().strip()
    if m in ("zh", "cn", "chinese", "ch_sim", "zh-cn", "zh_cn"):
        return "ch"
    if m in ("ch", "en", "korean", "japan"):
        return m
    return "en"


def convert_pdf_to_markdown(
    pdf_path: Path,
    *,
    output_md_path: Path,
    work_dir: Path | None = None,
    lang: str = "en",
    backend: str = "pipeline",
    formula_enable: bool = True,
    table_enable: bool = True,
    allow_vision: bool = True,
) -> dict:
    """Convert ``pdf_path`` → Markdown at ``output_md_path``.

    Returns metadata including ``method``:
    ``mineru_api`` | ``mineru_cli`` | ``qwen_vl`` | ``pymupdf_fallback`` | ``pypdf_fallback``.

    When ``allow_vision`` is False (Section A uploads + application-form ingest),
    skip Qwen-VL and use MinerU → PyMuPDF → pypdf only.
    """
    pdf_path = pdf_path.resolve()
    if not pdf_path.is_file():
        raise FileNotFoundError(pdf_path)

    output_md_path = output_md_path.resolve()
    output_md_path.parent.mkdir(parents=True, exist_ok=True)
    work_dir = (work_dir or output_md_path.parent / "_mineru_work").resolve()
    work_dir.mkdir(parents=True, exist_ok=True)

    stem = pdf_path.stem
    method = "pypdf_fallback"
    markdown = ""
    lang = _normalize_mineru_lang(lang)

    # --- 1) Python API from cloned / installed MinerU ---------------------
    _ensure_mineru_on_path()
    try:
        from mineru.cli.common import do_parse, read_fn  # type: ignore

        do_parse(
            str(work_dir),
            [stem],
            [read_fn(pdf_path)],
            [lang],
            backend=backend,
            formula_enable=formula_enable,
            table_enable=table_enable,
            f_draw_layout_bbox=False,
            f_draw_span_bbox=False,
            f_dump_md=True,
            f_dump_middle_json=False,
            f_dump_model_output=False,
            f_dump_orig_pdf=False,
            f_dump_content_list=False,
        )
        found = _find_md_outputs(work_dir, stem)
        if found:
            markdown = found[0].read_text(encoding="utf-8", errors="replace")
            method = "mineru_api"
    except Exception as exc:  # noqa: BLE001
        logger.warning("MinerU Python API failed (%s); trying CLI…", exc)

    # --- 2) CLI -----------------------------------------------------------
    if not markdown.strip():
        cli = shutil.which("mineru")
        cmd: list[str] | None = None
        if cli:
            cmd = [
                cli,
                "-p",
                str(pdf_path),
                "-o",
                str(work_dir),
                "-b",
                backend,
                "-l",
                lang,
            ]
        elif MINERU_ROOT.is_dir():
            cmd = [
                sys.executable,
                "-m",
                "mineru.cli.client",
                "-p",
                str(pdf_path),
                "-o",
                str(work_dir),
                "-b",
                backend,
                "-l",
                lang,
            ]

        if cmd:
            try:
                import os

                env = os.environ.copy()
                if MINERU_ROOT.is_dir():
                    prev = env.get("PYTHONPATH", "")
                    env["PYTHONPATH"] = (
                        str(MINERU_ROOT) + (os.pathsep + prev if prev else "")
                    )
                subprocess.run(
                    cmd,
                    check=True,
                    cwd=str(MINERU_ROOT) if MINERU_ROOT.is_dir() else None,
                    env=env,
                    capture_output=True,
                    text=True,
                    timeout=3600,
                )
                found = _find_md_outputs(work_dir, stem)
                if found:
                    markdown = found[0].read_text(encoding="utf-8", errors="replace")
                    method = "mineru_cli"
            except Exception as exc:  # noqa: BLE001
                logger.warning(
                    "MinerU CLI failed (%s); trying %s…",
                    exc,
                    "Qwen-VL" if allow_vision else "PyMuPDF",
                )

    # --- 3) OpenRouter Qwen-VL (screenshots / scans) ----------------------
    if not markdown.strip() and allow_vision:
        try:
            markdown = _qwen_vl_fallback(pdf_path, lang=lang)
            if markdown.strip():
                method = "qwen_vl"
                logger.info("PDF convert via Qwen-VL fallback")
        except Exception as exc:  # noqa: BLE001
            logger.warning("Qwen-VL PDF fallback failed (%s); using layout extractors", exc)

    # --- 4) PyMuPDF → pypdf -----------------------------------------------
    if not markdown.strip():
        markdown, method = _layout_fallback(pdf_path)
        if not markdown.strip():
            raise RuntimeError(f"No extractable text from {pdf_path}")

    markdown = re.sub(r"\n{4,}", "\n\n\n", markdown).strip() + "\n"
    output_md_path.write_text(markdown, encoding="utf-8")

    return {
        "method": method,
        "pdf_path": str(pdf_path),
        "markdown_path": str(output_md_path),
        "char_count": len(markdown),
        "mineru_root": str(MINERU_ROOT) if MINERU_ROOT.is_dir() else None,
    }
