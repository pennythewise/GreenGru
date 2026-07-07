"""The 8 supported CN codes — PRD §6.1. Locked scope: do not add aluminum,
cement, fertilizer, hydrogen, or electricity CBAM sectors without explicit
sign-off (see the project skill's non-negotiable rules)."""

from dataclasses import dataclass

from app.calculation_engine import ProductionRoute


@dataclass(frozen=True)
class CNCodeEntry:
    code: str
    description_en: str
    description_cn: str
    applicable_routes: tuple[ProductionRoute, ...]
    # Confirmed present on China's 2021 steel export VAT rebate cancellation
    # lists (财政部税务总局公告2021年16号/25号) — see
    # primary-sources/INVENTORY.md item 4. Only checked for a subset of
    # codes; None means "not individually verified," not "not affected."
    export_vat_rebate_cancelled_2021: bool | None


SUPPORTED_CN_CODES: dict[str, CNCodeEntry] = {
    "7207": CNCodeEntry(
        code="7207",
        description_en="Semi-finished steel billets",
        description_cn="半成品钢坯",
        applicable_routes=(ProductionRoute.BF_BOF, ProductionRoute.DRI_EAF),
        export_vat_rebate_cancelled_2021=None,
    ),
    "7208 10 00": CNCodeEntry(
        code="7208 10 00",
        description_en="Hot-rolled coil (HRC)",
        description_cn="热轧卷板",
        applicable_routes=(ProductionRoute.BF_BOF,),
        export_vat_rebate_cancelled_2021=None,
    ),
    "7213": CNCodeEntry(
        code="7213",
        description_en="Hot-rolled bars",
        description_cn="热轧盘条（棒材）",
        applicable_routes=(ProductionRoute.BF_BOF, ProductionRoute.SCRAP_EAF),
        export_vat_rebate_cancelled_2021=None,
    ),
    "7214": CNCodeEntry(
        code="7214",
        description_en="Hot-rolled wire rod",
        description_cn="热轧线材",
        applicable_routes=(ProductionRoute.BF_BOF, ProductionRoute.SCRAP_EAF),
        export_vat_rebate_cancelled_2021=None,
    ),
    "7301": CNCodeEntry(
        code="7301",
        description_en="Sheet piling, welded angles",
        description_cn="板桩、焊接角钢",
        applicable_routes=(ProductionRoute.BF_BOF, ProductionRoute.DRI_EAF, ProductionRoute.SCRAP_EAF),
        export_vat_rebate_cancelled_2021=None,
    ),
    "7302": CNCodeEntry(
        code="7302",
        description_en="Railway track construction material",
        description_cn="铁路轨道建筑材料",
        applicable_routes=(ProductionRoute.BF_BOF, ProductionRoute.DRI_EAF, ProductionRoute.SCRAP_EAF),
        # Confirmed: tariff line 73021000 (钢轨/rails) appears on 财政部 税务总局
        # 公告2021年第25号 (effective 1 Aug 2021) — see INVENTORY.md item 4.
        export_vat_rebate_cancelled_2021=True,
    ),
    "7318 15 42": CNCodeEntry(
        code="7318 15 42",
        description_en="Bolts",
        description_cn="螺栓",
        applicable_routes=(ProductionRoute.BF_BOF, ProductionRoute.DRI_EAF, ProductionRoute.SCRAP_EAF),
        export_vat_rebate_cancelled_2021=None,
    ),
    "7318 15 88": CNCodeEntry(
        code="7318 15 88",
        description_en="Screws",
        description_cn="螺钉",
        applicable_routes=(ProductionRoute.BF_BOF, ProductionRoute.DRI_EAF, ProductionRoute.SCRAP_EAF),
        export_vat_rebate_cancelled_2021=None,
    ),
    "7326": CNCodeEntry(
        code="7326",
        description_en="Other steel articles / hardware",
        description_cn="其他钢铁制品/五金件",
        applicable_routes=(ProductionRoute.BF_BOF, ProductionRoute.DRI_EAF, ProductionRoute.SCRAP_EAF),
        export_vat_rebate_cancelled_2021=None,
    ),
}

# Explicitly excluded — CN 7204 (ferrous scrap) is not CBAM-applicable, and
# any non-steel HS chapter is out of scope. The classifier agent's
# `out_of_scope` output (PRD §8.3) is how these get routed away safely.
EXCLUDED_NOTE = (
    "CN 7204 (ferrous scrap) and any non-steel HS chapter are explicitly "
    "out of scope for this product."
)


def is_supported_cn_code(code: str) -> bool:
    return code in SUPPORTED_CN_CODES


def default_route_for(code: str) -> ProductionRoute:
    """Conservative default when the SME doesn't know their route (PRD §8.4):
    BF-BOF, the highest-intensity assumption (~90% of Chinese production)."""
    entry = SUPPORTED_CN_CODES[code]
    return ProductionRoute.BF_BOF if ProductionRoute.BF_BOF in entry.applicable_routes else entry.applicable_routes[0]
