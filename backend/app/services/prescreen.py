"""Stage-0 pre-screen (PRD §4.2, §8.0) — optional, local ModelScope models,
no API cost, feature-flagged via ENABLE_MODELSCOPE_PRESCREEN. The pipeline
MUST run correctly with this stage disabled; it is an optimization, never a
dependency (hard boundary from PRD §4.2).

This module intentionally does NOT hard-depend on the `modelscope` package
at import time — it's a heavy optional dependency (multi-hundred-MB model
downloads on first use) that would otherwise block anyone from running the
rest of the backend. Install `modelscope` and flip the feature flag to
enable real pre-screening; until then, every function here is a documented
no-op that the rest of the pipeline treats identically to "pre-screen
passed."
"""

from dataclasses import dataclass

from app.config import get_settings

settings = get_settings()


@dataclass
class PrescreenResult:
    passed: bool
    reason: str | None
    ocr_text: str | None


def is_available() -> bool:
    if not settings.enable_modelscope_prescreen:
        return False
    try:
        import modelscope  # noqa: F401
    except ImportError:
        return False
    return True


def document_type_prescreen(document_bytes: bytes, expected_types: list[str]) -> PrescreenResult:
    """StructBERT zero-shot classifier
    (damo/nlp_structbert_zero-shot-classification_chinese-base) — rejects
    uploads that are not plausibly an invoice/utility bill/production
    record before any paid API call (PRD §8.0)."""
    if not is_available():
        return PrescreenResult(passed=True, reason="prescreen disabled or modelscope not installed", ocr_text=None)

    from modelscope.pipelines import pipeline  # type: ignore
    from modelscope.utils.constant import Tasks  # type: ignore

    classifier = pipeline(Tasks.zero_shot_classification, model="damo/nlp_structbert_zero-shot-classification_chinese-base")
    # A real implementation would run OCR first and classify the extracted
    # text; left as a structural stub since it requires a live model
    # download this reference implementation does not perform automatically.
    result = classifier(document_bytes, candidate_labels=expected_types)
    top_label = result["labels"][0] if result.get("labels") else None
    passed = top_label in expected_types
    return PrescreenResult(passed=passed, reason=None if passed else f"classified as '{top_label}'", ocr_text=None)


def ocr_text_layer(document_bytes: bytes) -> str | None:
    """DAMO 读光 OCR (detection + recognition pipeline) — produces a text
    layer passed alongside the image to the intake agent (§8.1); for
    born-digital PDFs whose text layer alone fills the schema, the vision
    call can be skipped entirely."""
    if not is_available():
        return None

    from modelscope.pipelines import pipeline  # type: ignore
    from modelscope.utils.constant import Tasks  # type: ignore

    detector = pipeline(Tasks.ocr_detection, model="iic/cv_resnet18_ocr-detection-line-level_damo")
    recognizer = pipeline(Tasks.ocr_recognition, model="iic/cv_convnextTiny_ocr-recognition-general_damo")
    boxes = detector(document_bytes)
    lines = [recognizer(document_bytes, box=box) for box in boxes.get("polygons", [])]
    return "\n".join(str(line) for line in lines) if lines else None
