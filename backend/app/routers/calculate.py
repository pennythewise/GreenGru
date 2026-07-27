from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.cert_price import NoCertificatePriceForQuarter
from app.db import get_session
from app.schemas import CalculateRequest, CalculationOut, SourceCitation
from app.services.pipeline import run_calculate

router = APIRouter(prefix="/api", tags=["calculate"])


@router.post("/calculate", response_model=CalculationOut)
async def calculate(payload: CalculateRequest, session: AsyncSession = Depends(get_session)):
    try:
        calc = await run_calculate(session, payload.submission_id, payload.year)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except NoCertificatePriceForQuarter as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    return CalculationOut(
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
        sources=[
            SourceCitation(
                constant="EU_BENCHMARK_TCO2E_PER_TONNE",
                value=str(calc.benchmark_tco2e_per_tonne),
                citation="Commission Implementing Regulation (EU) 2025/2620 (CBAM BM by route); cross-ref IR 2025/2621 Annex I notes",
            ),
            SourceCitation(
                constant="default_intensity_tco2e_per_tonne",
                value=str(calc.intensity_tco2e_per_tonne),
                citation=(
                    "IR (EU) 2025/2621 Annex I China×CN pre-mark-up SEE × year mark-up "
                    "(once). Not China GHG Factor DB. Measured overrides."
                    if calc.data_source == "china_default"
                    else "Verified installation-level intensity (overrides Annex I default)"
                ),
            ),
            SourceCitation(constant="CBAM_PHASE_IN_FACTOR_BY_YEAR", value=f"{calc.phase_in_factor:.4f}", citation="Regulation (EU) 2023/956 Art. 31(3); Directive 2003/87/EC Art. 10a(1a)"),
            SourceCitation(
                constant="MARKUP_BY_YEAR",
                value=f"{calc.markup_applied:.2f}",
                citation="IR 2025/2621 Annex I year columns / Annex IV 4.1 — applied to SEE once, not again to €/t",
            ),
            SourceCitation(constant="certificate price", value=f"{calc.certificate_price_eur_per_tco2e} ({calc.certificate_price_quarter})", citation="EU ETS allowance auction price, quarterly average"),
        ],
    )
