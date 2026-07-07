"""Green financing / subsidy program reference table — deterministic lookup
only (PRD §8.8's program matcher). The financing report agent may only cite
amounts and program names that come from this table; it never paraphrases
a number freely.

Every entry must carry a real source_citation. See primary-sources/
INVENTORY.md items 5, 6, 11 for verification status of each program below.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class SubsidyProgram:
    program_name_cn: str
    program_name_en: str
    is_green_specific: bool
    description_cn: str
    amount_or_benefit: str
    eligibility_note: str
    source_citation: str
    # Minimum CISA grade to plausibly qualify (grades ordered A best..E worst).
    # None means not CISA-grade-gated (eligibility depends on other factors,
    # e.g. loan type / industry chain, not carbon performance).
    min_cisa_grade: str | None


_GRADE_ORDER = ["A", "B", "C", "D", "E"]


PROGRAMS: list[SubsidyProgram] = [
    SubsidyProgram(
        program_name_cn="衢州碳账户金融（深绿/浅绿/黄/红四级授信）",
        program_name_en="Quzhou Carbon Account Financing (4-tier credit model)",
        is_green_specific=True,
        description_cn="按碳账户等级给予差异化授信额度与利率优惠，最高等级（深绿）可获最高1.5倍授信额度及50-100bp利率折扣。",
        amount_or_benefit="up to 1.5x credit limit; 50-100bp rate discount for top tier",
        eligibility_note="Best fit for CISA grade A/B submissions — the tiering logic maps naturally onto the top carbon-account tiers.",
        source_citation="Quzhou 碳账户金融模式 (公开政策文件/行业报道)",
        min_cisa_grade="B",
    ),
    SubsidyProgram(
        program_name_cn="国家级零碳工厂建设奖补（工信部联节〔2026〕13号）",
        program_name_en="National Zero-Carbon Factory construction subsidy",
        is_green_specific=True,
        description_cn="对通过零碳工厂评价的企业，中央财政给予最高200万元奖补，省市配套50-100万元。",
        amount_or_benefit="up to CNY 2,000,000 national + CNY 500,000-1,000,000 provincial/municipal matching",
        eligibility_note="Requires passing a formal zero-carbon factory evaluation — best suited to CISA grade A/B submissions pursuing certification, not an automatic award for any submission.",
        source_citation="工业和信息化部等部门, 工信部联节〔2026〕13号 — 零碳工厂建设工作指导意见",
        min_cisa_grade="B",
    ),
    SubsidyProgram(
        program_name_cn="中国人民银行碳减排支持工具（2026年扩容）",
        program_name_en="PBOC Carbon Emission Reduction Facility (CERF), 2026 expansion",
        is_green_specific=True,
        description_cn="人民银行按贷款本金60%向经办银行提供1.75%低成本再贷款，2026年1月扩容后覆盖节能改造、绿色升级、能源绿色低碳转型等项目，可传导为企业更低成本的绿色贷款。",
        amount_or_benefit="banks refinance 60% of qualifying loan principal at 1.75% (well below LPR) — passed through as a lower loan rate to the SME",
        eligibility_note="Applicable to any submission with an advisory-plan retrofit/upgrade path (heavy retrofit or lightweight digital tools that reduce carbon intensity) — not CISA-grade-gated, since it funds the *transition*, not a reward for an already-achieved grade.",
        source_citation="中国人民银行副行长邹澜, 2026-01-26 国新办新闻发布会 (via finance.sina.com.cn)",
        min_cisa_grade=None,
    ),
    SubsidyProgram(
        program_name_cn="中小微企业贷款贴息政策（2026）",
        program_name_en="2026 SME Loan Interest Subsidy Policy",
        is_green_specific=False,
        description_cn="对符合条件的中小微企业固定资产贷款，中央财政给予年化1.5个百分点、最长2年的贴息，单户贴息贷款规模上限5000万元，覆盖节能环保服务等重点产业链。",
        amount_or_benefit="1.5 percentage point annual interest subsidy, up to 2 years, capped at CNY 50,000,000 loan principal per borrower",
        eligibility_note="General SME financing-cost reducer, not carbon-specific — only surface this if the SME's industry chain is on the eligible list (includes 节能环保服务); label clearly as 'general SME,' not 'green,' in the financing report so it isn't mistaken for climate-specific credit.",
        source_citation="国务院/财政部, 关于实施中小微企业贷款贴息政策的通知 (2026年1月, gov.cn)",
        min_cisa_grade=None,
    ),
]


def match_programs(cisa_grade: str, has_retrofit_plan: bool) -> list[SubsidyProgram]:
    """Deterministic matching — no LLM. A program is matched if:
    - it has no min_cisa_grade requirement (financing-transition or
      general-SME programs), or
    - the submission's grade is at or better than the program's minimum.
    `has_retrofit_plan` is reserved for once the advisory plan (§8.9/8.10)
    is wired in as an input to this matcher; currently unused but kept in
    the signature so callers don't need to change when that lands.
    """
    matched = []
    for program in PROGRAMS:
        if program.min_cisa_grade is None:
            matched.append(program)
            continue
        if _GRADE_ORDER.index(cisa_grade) <= _GRADE_ORDER.index(program.min_cisa_grade):
            matched.append(program)
    return matched
