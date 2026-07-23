"""CBAM passport agent (PRD §8.6) — Qwen-Plus, bilingual EN/CN prose.
Input is only already-validated calculation/score numbers, never raw
intake data. Every numeric value in its output must exactly match a value
from those tables — enforced by the output validator (§8.7), called by the
router after this agent runs, not inside this module."""

from dataclasses import dataclass

from app.calculation_engine import CBAMResult
from app.config import get_settings
from app.services.llm_client import call_prose
from app.services.threshold_scoring import ScoringResult

settings = get_settings()

PASSPORT_SYSTEM_PROMPT = """You are writing a bilingual (English primary, Chinese secondary) CBAM export
passport for a Chinese steel SME. You may ONLY restate the numeric values given to you — never compute,
round differently, or estimate a new number. Every EUR and tCO2e figure you write must appear verbatim
(at the stated rounding) in the input. Include: company/product info, production route, intensity and its
data source (measured vs China default), taxable emissions, BOTH the net (phase-in adjusted, current-year)
and gross (fully phased-in, 2034 steady-state) tariff estimates per-tonne and annual, the CBAM phase-in
factor for the current year, certificate price and quarter, de minimis status worded as "possible" not
"exempt", a note that the EU importer (not the SME) must hold Authorized CBAM Declarant status, and the
mandatory disclaimer verbatim: "Generated using published default values and public regulatory benchmarks.
Not a substitute for a licensed customs broker, tax advisor, or financial advisor." """


@dataclass
class PassportContent:
    text: str
    source_numbers: list[float]


def generate_passport(
    *,
    company_name: str,
    cn_code: str,
    production_route: str,
    year: int,
    calc: CBAMResult,
    score: ScoringResult,
) -> PassportContent:
    source_numbers = [
        calc.intensity_tco2e_per_tonne,
        calc.benchmark_tco2e_per_tonne,
        calc.taxable_emissions_tco2e_per_tonne,
        calc.certificate_price_eur_per_tco2e,
        calc.phase_in_factor,
        calc.tariff_cost_eur_per_tonne,
        calc.gross_tariff_cost_eur_per_tonne,
        calc.annual_exposure_eur,
    ]

    user_prompt = (
        f"Company: {company_name}\nCN code: {cn_code}\nProduction route: {production_route}\nYear: {year}\n\n"
        f"Intensity: {calc.intensity_tco2e_per_tonne} tCO2e/t (source: {calc.data_source})\n"
        f"EU benchmark: {calc.benchmark_tco2e_per_tonne} tCO2e/t\n"
        f"Taxable emissions: {calc.taxable_emissions_tco2e_per_tonne} tCO2e/t\n"
        f"Certificate price: EUR {calc.certificate_price_eur_per_tco2e} per tCO2e\n"
        f"Default-value markup applied: {calc.markup_applied * 100:.0f}%\n"
        f"CBAM phase-in factor for {year}: {calc.phase_in_factor * 100:.1f}%\n"
        f"Net tariff cost (this year): EUR {calc.tariff_cost_eur_per_tonne:.2f} per tonne, "
        f"EUR {calc.annual_exposure_eur:,.2f} annual\n"
        f"Gross tariff cost (2034 steady-state): EUR {calc.gross_tariff_cost_eur_per_tonne:.2f} per tonne\n"
        f"CISA grade: {score.cisa_grade} (provisional: {score.cisa_grade_is_provisional})\n"
        f"CBAM risk tier: {score.cbam_risk_tier}\n"
        f"De minimis possible: {score.de_minimis_possible}\n"
    )

    mock_text = (
        f"[MOCK PASSPORT — configure LLM_API_KEY for real output]\n\n"
        f"CBAM EXPORT PASSPORT / CBAM出口护照\n"
        f"Company / 公司: {company_name}\nCN code / 税则号: {cn_code}\n"
        f"Production route / 生产工艺: {production_route}\n\n"
        f"Embedded emissions intensity / 隐含碳排放强度: {calc.intensity_tco2e_per_tonne} tCO2e/t "
        f"(source / 数据来源: {calc.data_source})\n"
        f"EU benchmark / 欧盟基准值: {calc.benchmark_tco2e_per_tonne} tCO2e/t\n"
        f"Taxable emissions / 应税排放: {calc.taxable_emissions_tco2e_per_tonne:.4f} tCO2e/t\n"
        f"CBAM phase-in factor for {year} / {year}年分阶段系数: {calc.phase_in_factor * 100:.1f}%\n"
        f"Net tariff cost (this year) / 本年度净关税成本: EUR {calc.tariff_cost_eur_per_tonne:.2f}/t "
        f"(annual / 年度: EUR {calc.annual_exposure_eur:,.2f})\n"
        f"Gross tariff cost (2034 steady-state) / 2034年满负荷成本: EUR {calc.gross_tariff_cost_eur_per_tonne:.2f}/t\n"
        f"Certificate price / 碳证书价格: EUR {calc.certificate_price_eur_per_tco2e}/tCO2e "
        f"({settings.cbam_certificate_price_quarter})\n"
        f"De minimis possible / 微量豁免可能性: {score.de_minimis_possible} "
        f"(assessed per EU importer, not per exporter — not a guarantee)\n"
        f"CISA grade (provisional) / 中国钢铁工业协会等级（暂定）: {score.cisa_grade}\n\n"
        f"IMPORTANT: The EU importer (or its EU-established indirect customs representative), not this "
        f"SME, must hold Authorized CBAM Declarant status.\n\n"
        f"Disclaimer / 免责声明: Generated using published default values and public regulatory benchmarks. "
        f"Not a substitute for a licensed customs broker, tax advisor, or financial advisor."
    )

    text = call_prose(
        model=settings.model_writing,
        system_prompt=PASSPORT_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        mock_response=mock_text,
    )
    return PassportContent(text=text, source_numbers=source_numbers)
