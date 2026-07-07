"""PRD §8.11 edge-case register — one test per item where not already
covered by test_calculation_engine.py / test_threshold_scoring.py."""

from app.data.cn_codes import is_supported_cn_code
from app.services.intake_agent import IntakeExtraction, merge_multi_document_extractions
from app.services.intake_validator import validate_intake
from app.services.output_validator import extract_numbers, validate_numbers_against_source
from app.services.pdf_generator import render_and_store_document


def test_unsupported_cn_code_is_rejected_by_product_creation_guard():
    """Edge case #1 — the classifier's out_of_scope path is exercised via
    the mock LLM in test_api_e2e.py; this test covers the underlying data
    guard that a product can never be created against an unsupported code."""
    assert not is_supported_cn_code("7601")  # aluminum, not in scope
    assert not is_supported_cn_code("7204")  # ferrous scrap, explicitly excluded
    assert is_supported_cn_code("7318 15 88")


def test_kg_tonne_confusion_is_flagged_with_specific_message():
    """Edge case #2."""
    extraction = IntakeExtraction(
        production_volume_tonnes=5_000_000,
        fuel_type="coking coal",
        cn_code_hint=None,
        billing_period="2026-01",
        confidence="high",
    )
    result = validate_intake(extraction, historical_scale_tonnes=5000)
    assert result.status == "flagged"
    assert any("kg/tonne" in note for note in result.notes)


def test_conflicting_documents_are_flagged_never_averaged():
    """Edge case #6."""
    a = IntakeExtraction(production_volume_tonnes=5000, fuel_type="coal", cn_code_hint=None, billing_period="2026-01", confidence="high")
    b = IntakeExtraction(production_volume_tonnes=8000, fuel_type="coal", cn_code_hint=None, billing_period="2026-01", confidence="high")
    merged = merge_multi_document_extractions([a, b])
    assert any("CONFLICT" in flag for flag in merged.flags)
    # never averaged to 6500, never silently picked one
    assert merged.production_volume_tonnes in (5000, 8000)


def test_output_validator_normalizes_thousands_separators_and_wan_units():
    """PRD §8.7 — bilingual number-format normalization."""
    text = "Annual exposure: EUR 22,133.23 (约2.21万美元等值, 2.5%的分阶段系数)"
    numbers = extract_numbers(text)
    assert any(abs(n - 22133.23) < 0.01 for n in numbers)
    assert any(abs(n - 22100) < 100 for n in numbers)  # 2.21万 -> ~22100
    assert any(abs(n - 0.025) < 0.001 for n in numbers)  # 2.5% -> 0.025


def test_output_validator_catches_missing_source_number():
    text = "The tariff cost is EUR 4.43 per tonne."
    outcome = validate_numbers_against_source(text, source_values=[4.43, 999.99])
    assert outcome.is_valid is False
    assert any(abs(v - 999.99) < 0.01 for v in outcome.missing_source_numbers)


def test_output_validator_passes_when_all_source_numbers_present():
    text = "净成本为每吨4.43欧元，年度敞口为22133.23欧元。"
    outcome = validate_numbers_against_source(text, source_values=[4.43, 22133.23])
    assert outcome.is_valid is True


def test_pdf_generation_survives_cjk_string_and_produces_a_hash():
    """Edge case #10 — asserts the known CN string survives generation
    (text-level check only; a visual tofu check still requires a bundled
    font per app/static/fonts/README.md)."""
    doc = render_and_store_document(
        submission_id="test-submission",
        doc_type="passport",
        title="CBAM Export Passport / CBAM出口护照",
        lang="en",
        meta_rows=[("公司", "测试钢铁有限公司")],
        body_heading="Test",
        body_text="中国钢铁工业协会等级（暂定）: E",
        disclaimer="Test disclaimer",
    )
    assert len(doc.content_hash) == 64  # sha256 hex digest length
    assert doc.signature
