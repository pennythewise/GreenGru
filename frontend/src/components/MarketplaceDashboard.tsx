import { useMemo, useState } from "react";
import { motion } from "motion/react";

import { AppShell, CitationFooter, PageHeader } from "@/components/AppShell";
import { MarketplaceListingCard } from "@/components/marketplace/MarketplaceListingCard";
import { company } from "@/lib/dashboard-data";
import {
  marketplaceCategories,
  rankedMarketplaceListings,
  type MarketplaceCategory,
} from "@/lib/marketplace-data";
import { useLocale } from "@/lib/locale";
import { crumbs, marketplacePage } from "@/lib/ui-strings";
import { cn } from "@/lib/utils";

export function MarketplaceDashboard() {
  const { isZh, t } = useLocale();
  const [category, setCategory] = useState<MarketplaceCategory | null>(null);

  const listings = useMemo(
    () => rankedMarketplaceListings(category ?? undefined),
    [category],
  );
  const allListings = useMemo(() => rankedMarketplaceListings(), []);

  return (
    <AppShell crumb={t(crumbs.marketplace.en, crumbs.marketplace.zh)}>
      <PageHeader
        n={marketplacePage.eyebrow.en}
        zh={marketplacePage.eyebrow.zh}
        title={marketplacePage.title.en(
          company.nameEn.split(" ")[1] ?? "your factory",
        )}
        titleZh={marketplacePage.title.zh(company.name)}
        subtitle={marketplacePage.subtitle.en}
        subtitleZh={marketplacePage.subtitle.zh}
        right={
          <div className="text-right shrink-0">
            <div className="font-mono text-[26px] font-semibold leading-none text-carbon">
              {allListings.length}
            </div>
            <div className="mt-1 text-[10.5px] text-muted-foreground font-mono uppercase tracking-[0.1em]">
              {t(
                marketplacePage.openMatches.en,
                marketplacePage.openMatches.zh,
              )}
            </div>
          </div>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-[12.5px] font-mono border transition",
            category === null
              ? "bg-primary/10 border-primary/35 text-foreground"
              : "border-border bg-surface text-muted-foreground hover:text-foreground",
          )}
        >
          {t(
            marketplacePage.allCategories.en,
            marketplacePage.allCategories.zh,
          )}{" "}
          · 全部
        </button>
        {marketplaceCategories.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCategory(c.key)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[12.5px] font-mono border transition",
              category === c.key
                ? "bg-primary/10 border-primary/35 text-foreground"
                : "border-border bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            {c.en} · {c.zh}
          </button>
        ))}
      </div>

      {listings.length > 0 ? (
        <div className="flex flex-col gap-3.5">
          {listings.map((listing, i) => (
            <MarketplaceListingCard
              key={listing.id}
              listing={listing}
              rank={i + 1}
              total={listings.length}
            />
          ))}
        </div>
      ) : (
        <MarketplaceEmptyState />
      )}

      <div className="pt-1 text-[10.5px] font-mono text-muted-foreground border-t border-border/60">
        {t(marketplacePage.rankedFooter.en, marketplacePage.rankedFooter.zh)}
      </div>
      <CitationFooter />
    </AppShell>
  );
}

function MarketplaceEmptyState() {
  const { t, isZh } = useLocale();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel flex flex-col items-center text-center gap-3.5 px-8 py-14"
    >
      <div className="h-14 w-14 rounded-2xl bg-carbon/10 border border-carbon/30 flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 text-carbon"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>
      <div>
        <div className="text-[16px] font-semibold font-display">
          {t(marketplacePage.emptyTitle.en, marketplacePage.emptyTitle.zh)}
        </div>
      </div>
      <p className="max-w-md text-[13px] text-muted-foreground leading-relaxed">
        {isZh ? marketplacePage.emptyBody.zh : marketplacePage.emptyBody.en}
      </p>
    </motion.div>
  );
}
