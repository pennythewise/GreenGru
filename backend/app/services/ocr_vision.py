"""Qwen-VL OCR fallback when PaddleOCR is unavailable or returns empty text.

New Submission images: PaddleOCR → ``MODEL_INTAKE_VISION``
(default ``qwen/qwen3-vl-235b-a22b-thinking``).
"""

from __future__ import annotations

import asyncio
import base64
import logging
import re
from pathlib import Path

from app.config import get_settings
from app.services.llm_client import get_client, is_mock_mode

logger = logging.getLogger(__name__)
settings = get_settings()

VISION_SOURCE = "qwen3-vl"

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


def _strip_thinking(text: str) -> str:
    t = (text or "").strip()
    t = re.sub(r"<think>[\s\S]*?</think>", "", t, flags=re.IGNORECASE)
    t = re.sub(r"<thinking>[\s\S]*?</thinking>", "", t, flags=re.IGNORECASE)
    return t.strip()


def _ocr_image_with_vision_sync(content: bytes, *, filename: str = "upload") -> str:
    """Blocking Qwen-VL OCR — run via asyncio.to_thread from async callers."""
    if is_mock_mode(role="vision"):
        return ""

    b64 = base64.b64encode(content).decode("ascii")
    mime = _mime_for_filename(filename)
    timeout = float(settings.ocr_intake_timeout_s or 90.0)

    client = get_client(role="vision", timeout=timeout)
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
    return _strip_thinking(response.choices[0].message.content or "")


async def ocr_image_with_vision(content: bytes, *, filename: str = "upload") -> tuple[str, str]:
    """Run intake vision model on image bytes. Returns (ocr_text, source_label)."""
    try:
        text = await asyncio.to_thread(_ocr_image_with_vision_sync, content, filename=filename)
        if text:
            return text, VISION_SOURCE
    except Exception as exc:  # noqa: BLE001 — optional fallback path
        logger.warning("Qwen-VL OCR failed for %s: %s", filename, exc)

    return "", "vision_unavailable"
