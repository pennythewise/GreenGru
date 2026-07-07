"""Financing report agent (PRD §8.8) — Qwen-Plus, Chinese-only output.
Subsidy amounts must be pulled via structured reference from
subsidy_matches, never paraphrased freely — if a program isn't in that
list, the agent doesn't mention a number for it."""

from dataclasses import dataclass

from app.config import get_settings
from app.data.subsidy_programs import SubsidyProgram
from app.services.llm_client import call_prose
from app.services.threshold_scoring import ScoringResult

settings = get_settings()

FINANCING_SYSTEM_PROMPT = """You are writing a Chinese-only green financing readiness report for a Chinese
steel SME. Output ONLY in Chinese — this document is read exclusively by Chinese banks/subsidy
administrators, never translate to English. You may cite ONLY the subsidy programs and amounts given to
you verbatim; if no programs are given for a category, say so plainly rather than inventing or recalling a
program from general knowledge. Include: CISA grade and gap to next tier (labeled provisional), matched
programs with amounts and citations, credit/rate implications, and the mandatory disclaimer verbatim:
"本报告基于已公开的默认值和公共监管基准生成，不能替代持牌海关经纪人、税务顾问或财务顾问的专业意见。" """


@dataclass
class FinancingContent:
    text: str


def generate_financing_report(
    *,
    company_name: str,
    score: ScoringResult,
    matched_programs: list[SubsidyProgram],
) -> FinancingContent:
    if matched_programs:
        programs_text = "\n".join(
            f"- {p.program_name_cn} ({p.program_name_en}): {p.amount_or_benefit} "
            f"[来源: {p.source_citation}] [绿色专项: {p.is_green_specific}]"
            for p in matched_programs
        )
    else:
        programs_text = "(no programs matched — the report must say so explicitly, not invent one)"

    user_prompt = (
        f"公司 / Company: {company_name}\n"
        f"CISA等级（暂定）/ CISA grade (provisional): {score.cisa_grade}\n"
        f"距离下一等级的差距 / gap to next tier: {score.gap_to_next_tier_tco2e}\n"
        f"匹配的项目 / matched programs:\n{programs_text}\n"
    )

    mock_programs_lines = "\n".join(f"  - {p.program_name_cn}：{p.amount_or_benefit}" for p in matched_programs) or "  (暂无匹配项目)"
    mock_text = (
        f"【模拟生成 — 配置 DASHSCOPE_API_KEY 后将输出真实内容】\n\n"
        f"绿色金融准备度报告\n"
        f"公司: {company_name}\n"
        f"中国钢铁工业协会低碳等级（暂定）: {score.cisa_grade}\n"
        f"距离下一等级差距: {score.gap_to_next_tier_tco2e} tCO2e/吨\n\n"
        f"匹配的融资/补贴项目:\n{mock_programs_lines}\n\n"
        f"免责声明: 本报告基于已公开的默认值和公共监管基准生成，"
        f"不能替代持牌海关经纪人、税务顾问或财务顾问的专业意见。"
    )

    text = call_prose(
        model=settings.model_writing,
        system_prompt=FINANCING_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        mock_response=mock_text,
    )
    return FinancingContent(text=text)
