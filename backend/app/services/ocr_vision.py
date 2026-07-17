"""Qwen3.7-plus OCR fallback when PaddleOCR is unavailable or times out."""

from __future__ import annotations

import asyncio
import base64
import logging
from pathlib import Path

from app.config import get_settings
from app.services.llm_client import get_client, is_mock_mode

logger = logging.getLogger(__name__)
settings = get_settings()

_VISION_PROMPT = """You are an OCR engine for Chinese VAT invoices (增值税发票).
Extract ALL visible text from the image, preserving line breaks.
Return plain text only — no JSON, no markdown fences. Include invoice code,
invoice number, dates, buyer/seller names and tax IDs, line items, amounts."""


def _mime_for_filename(filename: str) -> str:
    ext = Path(filename or "").suffix.lower()
    return {
        ".png": "image/png",
        ".webp": "image/webp",
        ".bmp": "image/bmp",
        ".gif": "image/gif",
    }.get(ext, "image/jpeg")


def _ocr_image_with_vision_sync(content: bytes, *, filename: str = "upload") -> str:
    """Blocking qwen3.7-plus vision OCR — run via asyncio.to_thread from async callers."""
    if is_mock_mode():
        return ""

    b64 = base64.b64encode(content).decode("ascii")
    mime = _mime_for_filename(filename)

    client = get_client()
    response = client.chat.completions.create(
        model=settings.model_intake_vision,
        temperature=0.0,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": _VISION_PROMPT},
                    {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
                ],
            }
        ],
    )
    return (response.choices[0].message.content or "").strip()


async def ocr_image_with_vision(content: bytes, *, filename: str = "upload") -> tuple[str, str]:
    """Run qwen3.7-plus on image bytes. Returns (ocr_text, source_label)."""
    try:
        text = await asyncio.to_thread(_ocr_image_with_vision_sync, content, filename=filename)
        if text:
            return text, "qwen3.7-plus"
    except Exception as exc:  # noqa: BLE001 — optional fallback path
        logger.warning("Qwen3.7-plus OCR failed for %s: %s", filename, exc)

    return "", "vision_unavailable"
