/**
 * CISA Appendix B.3 — national default grid electricity emission factors (tCO₂e/MWh).
 * Choice depends on whether the enterprise joins market-based green power trading.
 * Used for ESP32 kWh → electricity tCO₂e display (financing / shopfloor only — never CBAM).
 */

export const CISA_GRID_EF_NO_GREEN_TRADING_T_PER_MWH = 0.5568;
export const CISA_GRID_EF_WITH_GREEN_TRADING_T_PER_MWH = 0.5942;

export const CISA_GRID_EF_CITATION_ZH =
  "企业参与市场化绿电交易，电网电力排放系数选用0.5942，企业不参与市场化绿电交易选用0.5568。（CISA 附录 B.3 · 全国默认值）";

export const CISA_GRID_EF_CITATION_EN =
  "CISA Appendix B.3 national default: 0.5942 t/MWh if the enterprise participates in market-based green power trading; 0.5568 t/MWh if not.";

export type GreenPowerTradingChoice = "no" | "yes";

const STORAGE_KEY = "greengru-green-power-trading";

export function gridEmissionFactorTPerMWh(choice: GreenPowerTradingChoice): number {
  return choice === "yes"
    ? CISA_GRID_EF_WITH_GREEN_TRADING_T_PER_MWH
    : CISA_GRID_EF_NO_GREEN_TRADING_T_PER_MWH;
}

/** kWh × (t/MWh) / 1000 = tCO₂e */
export function electricityEmissionsTco2e(
  kwh: number,
  choice: GreenPowerTradingChoice,
): number {
  if (!Number.isFinite(kwh) || kwh < 0) return 0;
  return (kwh / 1000) * gridEmissionFactorTPerMWh(choice);
}

export function loadGreenPowerTradingChoice(): GreenPowerTradingChoice {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "yes" || v === "no") return v;
  } catch {
    /* ignore */
  }
  return "no";
}

export function saveGreenPowerTradingChoice(choice: GreenPowerTradingChoice): void {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* ignore */
  }
}
