/**
 * Official EU CBAM certificate prices for dashboard display.
 * Source of truth: European Commission taxation-customs site (public, free).
 * 2026 = quarterly averages of EU ETS auction clearing prices.
 * 2027+ = weekly averages (published first working day of the following week).
 *
 * These figures are published reference prices — they are NOT computed by GreenGru.
 * Tariff €/t still comes only from the deterministic calculation engine.
 */

export const CBAM_PRICE_SOURCE = {
  labelEn: "European Commission — CBAM Certificate price",
  labelZh: "欧盟委员会 — CBAM 证书价格",
  url: "https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism/price-cbam-certificates_en",
} as const;

export type CbamQuarterPrice = {
  quarter: "Q1 2026" | "Q2 2026" | "Q3 2026" | "Q4 2026";
  quarterZh: string;
  publishedOn: string | null;
  publishedOnLabelEn: string;
  publishedOnLabelZh: string;
  /** EUR / tCO₂e — null when not yet published */
  priceEur: number | null;
};

/** Matches Commission table as of Q2 2026 publication. */
export const CBAM_2026_QUARTERLY: CbamQuarterPrice[] = [
  {
    quarter: "Q1 2026",
    quarterZh: "2026 年第一季度",
    publishedOn: "2026-04-07",
    publishedOnLabelEn: "7 April 2026",
    publishedOnLabelZh: "2026年4月7日",
    priceEur: 75.36,
  },
  {
    quarter: "Q2 2026",
    quarterZh: "2026 年第二季度",
    publishedOn: "2026-07-06",
    publishedOnLabelEn: "6 July 2026",
    publishedOnLabelZh: "2026年7月6日",
    priceEur: 75.28,
  },
  {
    quarter: "Q3 2026",
    quarterZh: "2026 年第三季度",
    publishedOn: null,
    publishedOnLabelEn: "Due 5 October 2026",
    publishedOnLabelZh: "预计 2026年10月5日",
    priceEur: null,
  },
  {
    quarter: "Q4 2026",
    quarterZh: "2026 年第四季度",
    publishedOn: null,
    publishedOnLabelEn: "Due 4 January 2027",
    publishedOnLabelZh: "预计 2027年1月4日",
    priceEur: null,
  },
];

export function latestPublishedCbamPrice(): CbamQuarterPrice {
  const published = CBAM_2026_QUARTERLY.filter((r) => r.priceEur != null);
  return published[published.length - 1] ?? CBAM_2026_QUARTERLY[0];
}

export function priorPublishedCbamPrice(): CbamQuarterPrice | null {
  const published = CBAM_2026_QUARTERLY.filter((r) => r.priceEur != null);
  return published.length >= 2 ? published[published.length - 2]! : null;
}

export function formatEurPrice(n: number): string {
  return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
