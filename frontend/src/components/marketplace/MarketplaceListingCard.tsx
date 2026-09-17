import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Sun,
  Thermometer,
  Wind,
  Zap,
} from "lucide-react";
import type { MarketplaceListing } from "@/lib/marketplace-data";
import { discountPct, marketplaceCategories } from "@/lib/marketplace-data";
import { useLocale } from "@/lib/locale";
import { marketplacePage } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

const categoryIcon = {
  "energy-monitoring": Activity,
  "waste-heat-recovery": Thermometer,
  "furnace-heat-treatment": Zap,
  "solar-pv": Sun,
  "efficiency-retrofits": Wind,
} as const;

const toneBar = {
  high: "bg-ember",
  medium: "bg-warning",
  strategic: "bg-steel",
  data: "bg-steel",
} as const;

const pillTone = {
  high: "bg-ember/15 text-ember border border-ember/30",
  medium: "bg-warning/15 text-warning border border-warning/30",
  strategic: "bg-primary/10 text-primary border border-primary/30",
  data: "bg-primary/10 text-primary border border-primary/30",
} as const;

function priorityLabel(
  tier: MarketplaceListing["priorityTier"],
  isZh: boolean,
): string {
  if (tier === "high")
    return isZh
      ? marketplacePage.priorityHigh.zh
      : marketplacePage.priorityHigh.en;
  if (tier === "medium")
    return isZh
      ? marketplacePage.priorityMedium.zh
      : marketplacePage.priorityMedium.en;
  if (tier === "strategic")
    return isZh
      ? marketplacePage.priorityStrategic.zh
      : marketplacePage.priorityStrategic.en;
  return isZh
    ? marketplacePage.priorityData.zh
    : marketplacePage.priorityData.en;
}

export function MarketplaceListingCard({
  listing,
  rank,
  total,
}: {
  listing: MarketplaceListing;
  rank: number;
  total: number;
}) {
  const { isZh, t } = useLocale();
  const Icon = categoryIcon[listing.category];
  const cat = marketplaceCategories.find((c) => c.key === listing.category);
  const pct = discountPct(listing);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.04 }}
      className="panel relative overflow-hidden pl-6 pr-5 py-4"
    >
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[3px]",
          toneBar[listing.priorityTier],
        )}
      />
      <div className="grid lg:grid-cols-[1fr_260px] gap-6 items-start">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground font-mono">
              <Icon className="h-3.5 w-3.5 text-teal" />
              {isZh ? cat?.zh : cat?.en}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-muted-foreground">
                {t(
                  marketplacePage.rankOf.en(rank, total),
                  marketplacePage.rankOf.zh(rank, total),
                )}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-medium font-mono",
                  pillTone[listing.priorityTier],
                )}
              >
                {priorityLabel(listing.priorityTier, isZh)}
              </span>
            </div>
          </div>

          <div className="mt-2.5 text-[16px] font-semibold tracking-tight font-display">
            {isZh ? listing.nameZh : listing.nameEn}
            <span className="ml-2 text-[13px] font-medium text-muted-foreground">
              {isZh ? listing.nameEn : listing.nameZh}
            </span>
          </div>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">
            {isZh ? listing.supplierZh : listing.supplierEn}
          </div>

          <div className="mt-2.5 flex gap-2 p-2.5 rounded-lg border border-border bg-white/[0.03] text-[12px] leading-relaxed">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-warning" />
            <span>
              {isZh ? listing.whyZh : listing.whyEn}
              <span className="ml-1.5 font-mono text-[10.5px] text-muted-foreground">
                [{listing.assetId}]
              </span>
            </span>
          </div>

          <div className="mt-3 flex items-center gap-5 flex-wrap">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground font-mono">
                {t(marketplacePage.impact.en, marketplacePage.impact.zh)}
              </span>
              <span className="font-mono text-[14px] font-semibold text-carbon">
                {listing.impactTco2e != null
                  ? `−${listing.impactTco2e} tCO2e/yr`
                  : isZh
                    ? listing.impactNoteZh
                    : listing.impactNoteEn}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground font-mono">
                {t(
                  marketplacePage.priorityScore.en,
                  marketplacePage.priorityScore.zh,
                )}
              </span>
              <span className="font-mono text-[14px] font-semibold text-gold">
                {listing.priorityScore}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground font-mono">
                {listing.paybackYears != null
                  ? t(marketplacePage.payback.en, marketplacePage.payback.zh)
                  : t(marketplacePage.leadTime.en, marketplacePage.leadTime.zh)}
              </span>
              <span className="font-mono text-[14px] font-semibold">
                {listing.paybackYears != null
                  ? `${listing.paybackYears} yr`
                  : listing.leadTime}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:border-l border-border lg:pl-6 flex flex-col gap-2.5">
          <div>
            <div className="font-mono text-[20px] font-semibold">
              <span className="text-[12px] text-muted-foreground font-medium mr-0.5">
                ¥
              </span>
              {listing.priceRmb.toLocaleString()}
            </div>
            <div className="font-mono text-[12px] text-muted-foreground line-through">
              ¥{listing.marketPriceRmb.toLocaleString()}{" "}
              {t(marketplacePage.marketRef.en, marketplacePage.marketRef.zh)}
            </div>
          </div>
          <span className="inline-flex self-start items-center gap-1 px-2 py-1 rounded-md bg-carbon/15 text-carbon border border-carbon/30 text-[11px] font-mono font-medium">
            {t(
              marketplacePage.belowMarket.en(pct),
              marketplacePage.belowMarket.zh(pct),
            )}
          </span>
          <button
            type="button"
            className="mt-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-[12.5px] font-medium hover:bg-primary/90 transition"
          >
            {t(
              marketplacePage.requestQuote.en,
              marketplacePage.requestQuote.zh,
            )}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <Link
            to="/marketplace/$listingId"
            params={{ listingId: listing.id }}
            className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition"
          >
            {t(
              marketplacePage.viewDiagnostic.en,
              marketplacePage.viewDiagnostic.zh,
            )}
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
