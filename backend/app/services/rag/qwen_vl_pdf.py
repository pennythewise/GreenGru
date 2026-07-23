"""OpenRouter Qwen-VL PDF → Markdown fallback when MinerU is unavailable.

Renders pages with pypdfium2, then OCR/describes each page via a vision model
(default: ``qwen/qwen3-vl-235b-a22b-thinking``). Prose/tables/screenshots only —
never invents regulated numbers for CBAM/grant/loan scoring.
"""

from __future__ import annotations

import base64
import io
import logging
import re
from pathlib import Path

from app.config import get_settings
from app.services.llm_client import get_client, is_mock_mode

logger = logging.getLogger(__name__)
settings = get_settings()

_PAGE_PROMPT = """You are a document OCR + layout engine for industrial compliance PDFs
(CBAM, green factory, electricity / metering evidence, Chinese policy docs).

Extract ALL readable content from this page image into clean Markdown:
- Preserve headings, lists, tables (as Markdown tables when possible)
- Transcribe numbers, units, meters, charts labels, and screenshot UI text exactly
- Keep Chinese and English as shown
- Do NOT invent missing values; if unreadable write [illegible]
- Return Markdown only — no preamble, no code fences wrapping the whole page
"""


def _strip_thinking(text: str) -> str:
    """Drop common thinking / reasoning wrappers if the model emits them."""
    t = (text or "").strip()
    t = re.sub(r"<think>[\s\S]*?</think>", "", t, flags=re.IGNORECASE)
    t = re.sub(r"<thinking>[\s\S]*?</thinking>", "", t, flags=re.IGNORECASE)
    return t.strip()


def _render_pdf_pages_png(pdf_path: Path, *, max_pages: int, dpi: int) -> list[bytes]:
    try:
        import pypdfium2 as pdfium
    except ImportError as exc:
        raise RuntimeError("pypdfium2 required for Qwen-VL PDF fallback") from exc

    doc = pdfium.PdfDocument(str(pdf_path))
    scale = max(dpi, 72) / 72.0
    n = min(len(doc), max_pages)
    out: list[bytes] = []
    for i in range(n):
        page = doc[i]
        bitmap = page.render(scale=scale)
        pil = bitmap.to_pil()
        buf = io.BytesIO()
        pil.save(buf, format="PNG")
        out.append(buf.getvalue())
    return out


def _ocr_page_png(png: bytes, *, page_no: int, lang: str) -> str:
    model = settings.model_pdf_vision
    b64 = base64.b64encode(png).decode("ascii")
    lang_hint = "Prefer Chinese if the page is Chinese." if lang in ("zh", "ch", "cn") else ""
    timeout = float(getattr(settings, "pdf_vl_timeout_s", 180.0) or 180.0)
    client = get_client(role="pdf_vision", timeout=timeout)
    response = client.chat.completions.create(
        model=model,
        temperature=0.0,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"{_PAGE_PROMPT}\nPage number: {page_no}. {lang_hint}",
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{b64}"},
                    },
                ],
            }
        ],
    )
    msg = response.choices[0].message
    content = getattr(msg, "content", None) or ""
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                parts.append(block.get("text") or "")
            elif isinstance(block, str):
                parts.append(block)
        content = "\n".join(parts)
    return _strip_thinking(str(content))


def convert_pdf_with_qwen_vl(
    pdf_path: Path,
    *,
    lang: str = "en",
    max_pages: int | None = None,
    dpi: int | None = None,
) -> str:
    """Render PDF pages and OCR via OpenRouter Qwen-VL. Returns Markdown."""
    if is_mock_mode(role="pdf_vision"):
        logger.warning("Qwen-VL PDF skipped (LLM mock mode / no vision API key)")
        return ""

    pdf_path = Path(pdf_path)
    max_pages = max_pages or int(settings.pdf_vl_max_pages)
    dpi = dpi or int(settings.pdf_vl_dpi)

    pages = _render_pdf_pages_png(pdf_path, max_pages=max_pages, dpi=dpi)
    if not pages:
        return ""

    parts: list[str] = []
    model = settings.model_pdf_vision
    for i, png in enumerate(pages, start=1):
        try:
            body = _ocr_page_png(png, page_no=i, lang=lang)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Qwen-VL page %s failed (%s): %s", i, model, exc)
            body = ""
        if body.strip():
            parts.append(f"## Page {i}\n\n{body.strip()}")
        else:
            parts.append(f"## Page {i}\n\n_[no text extracted]_")

    logger.info(
        "Qwen-VL PDF convert · model=%s · pages=%s/%s · chars=%s",
        model,
        len(pages),
        max_pages,
        sum(len(p) for p in parts),
    )
    return "\n\n".join(parts).strip()
