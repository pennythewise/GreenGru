"""Shared pipeline step implementations — the actual DB-touching logic
behind each API contract endpoint (PRD §7). Routers are thin wrappers
around these functions; the `/api/submissions/{id}/process` convenience
orchestrator (app/routers/submissions.py) calls the same functions in
sequence. This is still "plain Python function calls in FastAPI route
handlers, nothing more" (PRD §4) — no agent decides what runs next, this
module just avoids duplicating the same DB-write logic in two places.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.calculation_engine import CBAMInput, ProductionRoute, calculate_cbam_exposure
from app.data.cert_price import get_certificate_price
from app.data.cn_codes import default_route_for
from app.data.subsidy_programs import match_programs
from app.models_orm import (
    AdvisoryPlan,
    Calculation,
    Document,
    IntakeRecord,
    Product,
    Score,
    Submission,
    SubsidyMatch,
)
from app.services.advisory_agent import generate_advisory_plan
from app.services.classifier_agent import classify_product
from app.services.financing_agent import generate_financing_report
from app.services.intake_agent import IntakeExtraction
from app.services.intake_validator import validate_intake
from app.services.passport_agent import generate_passport
from app.services.path_ranker import rank_paths
from app.services.pdf_generator import DISCLAIMER_CN, DISCLAIMER_EN, render_and_store_document
from app.services.threshold_scoring import score_calculation


async def _get_submission_with_product(session: AsyncSession, submission_id: str) -> tuple[Submission, Product]:
    submission = await session.get(Submission, submission_id)
    if submission is None:
        raise ValueError(f"submission {submission_id} not found")
    product = await session.get(Product, submission.product_id)
    if product is None:
        raise ValueError(f"product {submission.product_id} not found for submission {submission_id}")
    return submission, product


async def run_intake(
    session: AsyncSession,
    submission_id: str,
    extraction: IntakeExtraction,
    historical_scale_tonnes: float | None = None,
) -> IntakeRecord:
    submission, product = await _get_submission_with_product(session, submission_id)

    validation = validate_intake(extraction, historical_scale_tonnes=historical_scale_tonnes)

    record = IntakeRecord(
        submission_id=submission_id,
        extracted_json={
            "production_volume_tonnes": extraction.production_volume_tonnes,
            "fuel_type": extraction.fuel_type,
            "cn_code_hint": extraction.cn_code_hint,
            "billing_period": extraction.billing_period,
            "confidence": extraction.confidence,
        },
        validator_status=validation.status,
        validator_notes=validation.notes,
    )
    session.add(record)
    submission.status = "intake_done" if validation.status != "rejected" else "manual_review"
    await session.commit()
    await session.refresh(record)
    return record


async def run_classify(session: AsyncSession, submission_id: str, product_description: str):
    submission, product = await _get_submission_with_product(session, submission_id)
    result = classify_product(product_description, cn_code_hint=None)

    if not result.requires_manual_confirmation and result.cn_code != "out_of_scope":
        product.cn_code = result.cn_code
        submission.status = "classified"
    else:
        submission.status = "manual_review"
    await session.commit()
    return result


async def run_calculate(session: AsyncSession, submission_id: str, year: int) -> Calculation:
    submission, product = await _get_submission_with_product(session, submission_id)

    route = ProductionRoute(product.production_route) if product.production_route else default_route_for(product.cn_code)
    price_entry = get_certificate_price(_current_quarter_or_configured())

    # Measured intensity, if the SME supplied one via the intake record, wins
    # over the China default — read the most recent intake record for this
    # submission (PRD §8.4 step 1).
    intake_stmt = select(IntakeRecord).where(IntakeRecord.submission_id == submission_id).order_by(IntakeRecord.created_at.desc())
    intake_record = (await session.execute(intake_stmt)).scalars().first()
    measured_intensity = None
    if intake_record and intake_record.extracted_json.get("measured_intensity_tco2e_per_tonne"):
        measured_intensity = intake_record.extracted_json["measured_intensity_tco2e_per_tonne"]

    cbam_input = CBAMInput(
        cn_code=product.cn_code,
        route=route,
        annual_export_tonnes=product.annual_export_tonnes,
        year=year,
        measured_intensity_tco2e_per_tonne=measured_intensity,
    )
    result = calculate_cbam_exposure(cbam_input, certificate_price_eur_per_tco2e=price_entry.price_eur_per_tco2e)

    calc = Calculation(
        submission_id=submission_id,
        intensity_tco2e_per_tonne=result.intensity_tco2e_per_tonne,
        data_source=result.data_source,
        benchmark_tco2e_per_tonne=result.benchmark_tco2e_per_tonne,
        taxable_emissions_tco2e_per_tonne=result.taxable_emissions_tco2e_per_tonne,
        certificate_price_eur_per_tco2e=result.certificate_price_eur_per_tco2e,
        certificate_price_quarter=price_entry.quarter,
        markup_applied=result.markup_applied,
        phase_in_factor=result.phase_in_factor,
        tariff_cost_eur_per_tonne=result.tariff_cost_eur_per_tonne,
        gross_tariff_cost_eur_per_tonne=result.gross_tariff_cost_eur_per_tonne,
        annual_exposure_eur=result.annual_exposure_eur,
    )
    session.add(calc)
    submission.status = "calculated"
    await session.commit()
    await session.refresh(calc)
    return calc


def _current_quarter_or_configured() -> str:
    from app.config import get_settings

    return get_settings().cbam_certificate_price_quarter


async def run_score(session: AsyncSession, calculation_id: str) -> Score:
    calc = await session.get(Calculation, calculation_id)
    if calc is None:
        raise ValueError(f"calculation {calculation_id} not found")
    submission = await session.get(Submission, calc.submission_id)
    product = await session.get(Product, submission.product_id)

    from app.calculation_engine import CBAMResult

    result = CBAMResult(
        intensity_tco2e_per_tonne=calc.intensity_tco2e_per_tonne,
        data_source=calc.data_source,
        benchmark_tco2e_per_tonne=calc.benchmark_tco2e_per_tonne,
        taxable_emissions_tco2e_per_tonne=calc.taxable_emissions_tco2e_per_tonne,
        certificate_price_eur_per_tco2e=calc.certificate_price_eur_per_tco2e,
        markup_applied=calc.markup_applied,
        phase_in_factor=calc.phase_in_factor,
        tariff_cost_eur_per_tonne=calc.tariff_cost_eur_per_tonne,
        gross_tariff_cost_eur_per_tonne=calc.gross_tariff_cost_eur_per_tonne,
        annual_exposure_eur=calc.annual_exposure_eur,
    )
    route = ProductionRoute(product.production_route) if product.production_route else default_route_for(product.cn_code)
    scoring = score_calculation(result, annual_export_tonnes=product.annual_export_tonnes, route=route.value)

    score = Score(
        calculation_id=calculation_id,
        cisa_grade=scoring.cisa_grade,
        cisa_grade_is_provisional=scoring.cisa_grade_is_provisional,
        cbam_risk_tier=scoring.cbam_risk_tier,
        gap_to_next_tier_tco2e=scoring.gap_to_next_tier_tco2e,
        de_minimis_possible=scoring.de_minimis_possible,
    )
    session.add(score)
    submission.status = "scored"
    await session.commit()
    await session.refresh(score)

    matched = match_programs(scoring.cisa_grade, has_retrofit_plan=False)
    for program in matched:
        session.add(
            SubsidyMatch(
                score_id=score.id,
                program_name=program.program_name_cn,
                program_name_en=program.program_name_en,
                amount_estimate_cny=None,
                is_green_specific=program.is_green_specific,
                source_citation=program.source_citation,
            )
        )
    await session.commit()
    return score


async def _load_score_context(session: AsyncSession, score_id: str):
    score = await session.get(Score, score_id)
    if score is None:
        raise ValueError(f"score {score_id} not found")
    calc = await session.get(Calculation, score.calculation_id)
    submission = await session.get(Submission, calc.submission_id)
    product = await session.get(Product, submission.product_id)
    from app.models_orm import Company

    company = await session.get(Company, product.company_id)
    return score, calc, submission, product, company


async def run_passport_document(session: AsyncSession, score_id: str) -> Document:
    score, calc, submission, product, company = await _load_score_context(session, score_id)

    from app.calculation_engine import CBAMResult
    from app.services.threshold_scoring import ScoringResult

    calc_result = CBAMResult(
        intensity_tco2e_per_tonne=calc.intensity_tco2e_per_tonne,
        data_source=calc.data_source,
        benchmark_tco2e_per_tonne=calc.benchmark_tco2e_per_tonne,
        taxable_emissions_tco2e_per_tonne=calc.taxable_emissions_tco2e_per_tonne,
        certificate_price_eur_per_tco2e=calc.certificate_price_eur_per_tco2e,
        markup_applied=calc.markup_applied,
        phase_in_factor=calc.phase_in_factor,
        tariff_cost_eur_per_tonne=calc.tariff_cost_eur_per_tonne,
        gross_tariff_cost_eur_per_tonne=calc.gross_tariff_cost_eur_per_tonne,
        annual_exposure_eur=calc.annual_exposure_eur,
    )
    score_result = ScoringResult(
        cisa_grade=score.cisa_grade,
        cisa_grade_is_provisional=score.cisa_grade_is_provisional,
        cbam_risk_tier=score.cbam_risk_tier,
        gap_to_next_tier_tco2e=score.gap_to_next_tier_tco2e,
        de_minimis_possible=score.de_minimis_possible,
    )

    content = generate_passport(
        company_name=company.name,
        cn_code=product.cn_code,
        production_route=product.production_route,
        year=2026,
        calc=calc_result,
        score=score_result,
    )

    generated = render_and_store_document(
        submission_id=submission.id,
        doc_type="passport",
        title="CBAM Export Passport / CBAM出口护照",
        lang="en",
        meta_rows=[
            ("Company / 公司", company.name),
            ("CN code / 税则号", product.cn_code),
            ("Production route / 生产工艺", product.production_route),
            ("Certificate price quarter / 证书价格季度", calc.certificate_price_quarter),
        ],
        body_heading="Passport content / 护照内容",
        body_text=content.text,
        disclaimer=DISCLAIMER_EN,
    )

    doc = Document(
        submission_id=submission.id,
        doc_type="passport",
        language="en_cn",
        content_hash=generated.content_hash,
        signature=generated.signature,
        pdf_storage_path=generated.storage_path,
    )
    session.add(doc)
    submission.status = "documents_generated"
    await session.commit()
    await session.refresh(doc)
    return doc


async def run_financing_document(session: AsyncSession, score_id: str) -> Document:
    score, calc, submission, product, company = await _load_score_context(session, score_id)

    matches_stmt = select(SubsidyMatch).where(SubsidyMatch.score_id == score_id)
    matches = (await session.execute(matches_stmt)).scalars().all()
    from app.data.subsidy_programs import PROGRAMS

    matched_programs = [p for p in PROGRAMS if p.program_name_cn in {m.program_name for m in matches}]

    from app.services.threshold_scoring import ScoringResult

    score_result = ScoringResult(
        cisa_grade=score.cisa_grade,
        cisa_grade_is_provisional=score.cisa_grade_is_provisional,
        cbam_risk_tier=score.cbam_risk_tier,
        gap_to_next_tier_tco2e=score.gap_to_next_tier_tco2e,
        de_minimis_possible=score.de_minimis_possible,
    )

    content = generate_financing_report(company_name=company.name, score=score_result, matched_programs=matched_programs)

    generated = render_and_store_document(
        submission_id=submission.id,
        doc_type="financing_report",
        title="绿色金融准备度报告",
        lang="zh",
        meta_rows=[("公司", company.name), ("CISA等级（暂定）", score.cisa_grade)],
        body_heading="报告内容",
        body_text=content.text,
        disclaimer=DISCLAIMER_CN,
    )

    doc = Document(
        submission_id=submission.id,
        doc_type="financing_report",
        language="cn",
        content_hash=generated.content_hash,
        signature=generated.signature,
        pdf_storage_path=generated.storage_path,
    )
    session.add(doc)
    await session.commit()
    await session.refresh(doc)
    return doc


async def run_advisory(session: AsyncSession, score_id: str) -> AdvisoryPlan:
    score, calc, submission, product, company = await _load_score_context(session, score_id)

    ranked = rank_paths(score.gap_to_next_tier_tco2e)
    gross_vs_net_note = (
        f"Your current-year net cost is EUR {calc.tariff_cost_eur_per_tonne:.2f}/t, but the fully "
        f"phased-in (2034) figure is EUR {calc.gross_tariff_cost_eur_per_tonne:.2f}/t — plan for the "
        f"escalation, not just today's number."
    )
    plan = generate_advisory_plan(
        company_name=company.name,
        ranked_paths=ranked,
        cbam_risk_tier=score.cbam_risk_tier,
        gross_vs_net_note=gross_vs_net_note,
    )

    # plan_text is stored alongside the structured actions in the same JSON
    # column (rather than a second column) since it's agent prose tied 1:1
    # to this one ranked-actions payload, not an independently queryable field.
    advisory = AdvisoryPlan(
        score_id=score_id,
        ranked_actions_json={"actions": plan.ranked_actions, "plan_text": plan.text},
    )
    session.add(advisory)
    submission.status = "advisory_generated"
    await session.commit()
    await session.refresh(advisory)
    return advisory
