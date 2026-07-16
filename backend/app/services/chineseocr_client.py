"""HTTP client for the chineseocr service (YOLO3 + CRNN).

The upstream project exposes POST /ocr with a base64 image payload:
https://github.com/chineseocr/chineseocr

When the service is unreachable, callers should fall back to mock invoice
data — this module never raises on connection failure.
"""

from __future__ import annotations

import base64
import logging
from typing import Literal

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

OcrSource = Literal["chineseocr", "unavailable"]


async def ocr_image_bytes(
    content: bytes,
    *,
    filename: str = "upload",
    timeout_s: float | None = None,
) -> tuple[list[str], OcrSource]:
    """Run chineseocr on image bytes. Returns (text_lines, source)."""
    if not settings.chinese_ocr_url:
        return [], "unavailable"

    b64 = base64.b64encode(content).decode("ascii")
    payload = {
        "imgString": f"data:image/jpeg;base64,{b64}",
        "billModel": "通用OCR",
        "textAngle": True,
        "textLine": False,
    }

    http_timeout = timeout_s if timeout_s is not None else settings.chinese_ocr_timeout_s

    try:
        async with httpx.AsyncClient(timeout=http_timeout) as client:
            resp = await client.post(settings.chinese_ocr_url, json=payload)
            resp.raise_for_status()
            data = resp.json()
    except Exception as exc:  # noqa: BLE001 — graceful degradation for optional OCR service
        logger.warning("chineseocr request failed for %s: %s", filename, exc)
        return [], "unavailable"

    lines: list[str] = []
    for item in data.get("res") or []:
        text = (item.get("text") or "").strip()
        if text:
            lines.append(text)

    if not lines:
        return [], "unavailable"

    return lines, "chineseocr"
