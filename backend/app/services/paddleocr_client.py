"""In-process PaddleOCR for Chinese VAT invoice photos (Stage-1 intake).

Uses PP-OCRv4 with lang='ch' — simplified Chinese + English on the same model.
Models auto-download on first run (~20s) into ~/.paddlex/official_models/.

https://github.com/PaddlePaddle/PaddleOCR
"""

from __future__ import annotations

import asyncio
import io
import logging
import os
from typing import Literal

import numpy as np
from PIL import Image

from app.config import get_settings

logger = logging.getLogger(__name__)

# Skip slow model-host connectivity checks; models download from ModelScope mirror.
os.environ.setdefault("PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK", "True")

OcrSource = Literal["paddleocr", "unavailable"]

_engine = None
_engine_lock = asyncio.Lock()


def _build_engine():
    from paddleocr import PaddleOCR

    settings = get_settings()
    return PaddleOCR(
        lang=settings.paddleocr_lang,
        ocr_version=settings.paddleocr_version,
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=True,
        enable_mkldnn=settings.paddleocr_enable_mkldnn,
    )


def _get_engine():
    global _engine
    if _engine is None:
        logger.info(
            "Loading PaddleOCR (%s, lang=%s) — first run downloads models",
            get_settings().paddleocr_version,
            get_settings().paddleocr_lang,
        )
        _engine = _build_engine()
    return _engine


def _lines_from_result(result) -> list[str]:
    """Parse PaddleOCR 3.x predict() output into plain text lines."""
    lines: list[str] = []
    if not result:
        return lines

    for page in result:
        if isinstance(page, dict):
            for text in page.get("rec_texts") or []:
                t = str(text).strip()
                if t:
                    lines.append(t)
            continue
        if isinstance(page, list):
            for item in page:
                if not item or len(item) < 2:
                    continue
                payload = item[1]
                if isinstance(payload, (list, tuple)) and payload:
                    t = str(payload[0]).strip()
                else:
                    t = str(payload).strip()
                if t:
                    lines.append(t)
    return lines


def _ocr_sync(content: bytes) -> list[str]:
    engine = _get_engine()
    img = Image.open(io.BytesIO(content))
    img = img.convert("RGB")
    arr = np.array(img)
    result = list(engine.predict(arr))
    return _lines_from_result(result)


async def ocr_image_bytes(
    content: bytes,
    *,
    filename: str = "upload",
    timeout_s: float | None = None,
) -> tuple[list[str], OcrSource]:
    """Run PaddleOCR on image bytes. Returns (text_lines, source). Never raises."""
    settings = get_settings()
    if not settings.paddleocr_enabled:
        return [], "unavailable"

    limit = timeout_s if timeout_s is not None else settings.paddleocr_timeout_s

    try:
        lines = await asyncio.wait_for(asyncio.to_thread(_ocr_sync, content), timeout=limit)
        if lines:
            return lines, "paddleocr"
        return [], "unavailable"
    except TimeoutError:
        logger.warning("PaddleOCR timed out after %ss for %s", limit, filename)
        return [], "unavailable"
    except Exception as exc:  # noqa: BLE001 — optional OCR; fall back to qwen/mock
        logger.warning("PaddleOCR failed for %s: %s", filename, exc)
        return [], "unavailable"
