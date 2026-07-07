from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.cert_price import NoCertificatePriceForQuarter
from app.db import get_session
from app.models_orm import AdvisoryPlan, Calculation, Document, IntakeRecord, Score, Submission
from app.schemas import (
    AdvisoryOut,
    CalculationOut,
    DocumentOut,
    IntakeRecordOut,
    ProcessSubmissionRequest,
    RankedAction,
    ScoreOut,
    SubmissionCreate,
    SubmissionFullState,
    SubmissionOut,
)
from app.services.pipeline import (
    run_advisory,
    run_calculate,
    run_classify,
    run_financing_document,
    run_passport_document,
    run_score,
)

router = APIRouter(prefix="/api", tags=["submissions"])


@router.post("/submissions", response_model=SubmissionOut)
async def create_submission(payload: SubmissionCreate, session: AsyncSession = Depends(get_session)):
    submission = Submission(product_id=payload.product_id, source_type=payload.source_type)
    session.add(submission)
    await session.commit()
    await session.refresh(submission)
    return SubmissionOut(id=submission.id, product_id=submission.product_id, status=submission.status)


@router.get("/submissions/{submission_id}", response_model=SubmissionFullState)
async def get_submission(submission_id: str, session: AsyncSession = Depends(get_session)):
    submission = await session.get(Submission, submission_id)
    if submission is None:
        raise HTTPException(status_code=404, detail=f"submission {submission_id} not found")

    intake_stmt = select(IntakeRecord).where(IntakeRecord.submission_id == submission_id).order_by(IntakeRecord.created_at.desc())
    intake_record = (await session.execute(intake_stmt)).scalars().first()

    calc_stmt = select(Calculation).where(Calculation.submission_id == submission_id).order_by(Calculation.calculated_at.desc())
    calc = (await session.execute(calc_stmt)).scalars().first()

    score = None
    advisory_plan = None
    if calc:
        score_stmt = select(Score).where(Score.calculation_id == calc.id).order_by(Score.created_at.desc())
        score = (await session.execute(score_stmt)).scalars().first()
        if score:
            adv_stmt = select(AdvisoryPlan).where(AdvisoryPlan.score_id == score.id).order_by(AdvisoryPlan.generated_at.desc())
            advisory_plan = (await session.execute(adv_stmt)).scalars().first()

    docs_stmt = select(Document).where(Document.submission_id == submission_id)
    documents = (await session.execute(docs_stmt)).scalars().all()

    return SubmissionFullState(
        submission=SubmissionOut(id=submission.id, product_id=submission.product_id, status=submission.status),
        intake=IntakeRecordOut(
            id=intake_record.id,
            submission_id=intake_record.submission_id,
            extracted_json=intake_record.extracted_json,
            validator_status=intake_record.validator_status,
            validator_notes=intake_record.validator_notes or [],
        )
        if intake_record
        else None,
        calculation=CalculationOut(
            id=calc.id,
            submission_id=calc.submission_id,
            intensity_tco2e_per_tonne=calc.intensity_tco2e_per_tonne,
            data_source=calc.data_source,
            benchmark_tco2e_per_tonne=calc.benchmark_tco2e_per_tonne,
            taxable_emissions_tco2e_per_tonne=calc.taxable_emissions_tco2e_per_tonne,
            certificate_price_eur_per_tco2e=calc.certificate_price_eur_per_tco2e,
            certificate_price_quarter=calc.certificate_price_quarter,
            markup_applied=calc.markup_applied,
            phase_in_factor=calc.phase_in_factor,
            tariff_cost_eur_per_tonne=calc.tariff_cost_eur_per_tonne,
            gross_tariff_cost_eur_per_tonne=calc.gross_tariff_cost_eur_per_tonne,
            annual_exposure_eur=calc.annual_exposure_eur,
        )
        if calc
        else None,
        score=ScoreOut(
            id=score.id,
            calculation_id=score.calculation_id,
            cisa_grade=score.cisa_grade,
            cisa_grade_is_provisional=score.cisa_grade_is_provisional,
            cbam_risk_tier=score.cbam_risk_tier,
            gap_to_next_tier_tco2e=score.gap_to_next_tier_tco2e,
            de_minimis_possible=score.de_minimis_possible,
        )
        if score
        else None,
        documents=[
            DocumentOut(
                id=d.id,
                submission_id=d.submission_id,
                doc_type=d.doc_type,
                language=d.language,
                content_hash=d.content_hash,
                signature=d.signature,
                pdf_storage_path=d.pdf_storage_path,
                used_pdf_fallback_html=d.pdf_storage_path.endswith(".fallback.html"),
            )
            for d in documents
        ],
        advisory=AdvisoryOut(
            id=advisory_plan.id,
            score_id=advisory_plan.score_id,
            ranked_actions=[RankedAction(**a) for a in advisory_plan.ranked_actions_json["actions"]],
            plan_text=advisory_plan.ranked_actions_json["plan_text"],
        )
        if advisory_plan
        else None,
    )


@router.post("/submissions/{submission_id}/process", response_model=SubmissionFullState)
async def process_submission(
    submission_id: str, payload: ProcessSubmissionRequest, session: AsyncSession = Depends(get_session)
):
    """Convenience orchestrator: runs classify -> calculate -> score ->
    passport doc -> financing doc -> advisory in one fixed sequence.
    Requires that /api/intake already ran for this submission. Still a
    fixed, code-orchestrated pipeline (PRD §4) — no agent decides what runs
    next; this is exactly the stage order specified in PRD §5, just called
    from one route handler instead of six separate frontend round-trips.
    """
    try:
        classification = await run_classify(session, submission_id, payload.product_description)
        if classification.requires_manual_confirmation:
            raise HTTPException(
                status_code=409,
                detail=f"Classification requires manual confirmation: {classification.reason}",
            )

        calc = await run_calculate(session, submission_id, payload.year)
        score = await run_score(session, calc.id)
        await run_passport_document(session, score.id)
        await run_financing_document(session, score.id)
        await run_advisory(session, score.id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except NoCertificatePriceForQuarter as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    return await get_submission(submission_id, session)
