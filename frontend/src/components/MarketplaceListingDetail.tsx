import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Download,
  ImageOff,
} from "lucide-react";

import { AppShell, CitationFooter } from "@/components/AppShell";
import {
  discountPct,
  marketplaceCategories,
  type MarketplaceListing,
} from "@/lib/marketplace-data";
import { useLocale } from "@/lib/locale";
import { crumbs, marketplacePage } from "@/lib/ui-strings";

export function MarketplaceListingDetail({
  listing,
}: {
  listing: MarketplaceListing;
}) {
  const { isZh, t } = useLocale();
  const cat = marketplaceCategories.find((c) => c.key === listing.category);
  const pct = discountPct(listing);
  const total = 5;
  const rank =
    [
      "jn-500-waste-heat",
      "vfd-90-compressor",
      "igbt-rectifier-ep1",
      "sungrow-rooftop-pv-300kw",
      "wasion-ws9800-submetering",
    ].indexOf(listing.id) + 1;

  return (
    <AppShell
      crumb={`${t(crumbs.marketplace.en, crumbs.marketplace.zh)} / ${isZh ? listing.nameZh : listing.nameEn}`}
    >
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t(
          marketplacePage.backToMarketplace.en,
          marketplacePage.backToMarketplace.zh,
        )}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.12em] text-teal font-mono">
            {isZh ? cat?.zh : cat?.en}
          </div>
          <h1 className="mt-1.5 text-[24px] md:text-[26px] font-semibold tracking-tight font-display">
            {isZh ? listing.nameZh : listing.nameEn}
            <span className="ml-2.5 text-[14px] font-medium text-muted-foreground">
              {isZh ? listing.nameEn : listing.nameZh}
            </span>
          </h1>
          <div className="mt-1 text-[12.5px] text-muted-foreground">
            {isZh ? listing.supplierZh : listing.supplierEn}
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium font-mono bg-ember/15 text-ember border border-ember/30">
          {t(
            marketplacePage.rankOf.en(rank, total),
            marketplacePage.rankOf.zh(rank, total),
          )}
        </span>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-5 items-start">
        <div className="flex flex-col gap-4">
          <div className="panel p-5">
            <div className="h-[200px] rounded-lg border border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground bg-white/[0.02]">
              <ImageOff className="h-7 w-7" strokeWidth={1.5} />
              <span className="text-[11px] font-mono">
                {t(
                  marketplacePage.productPhotoMissing.en,
                  marketplacePage.productPhotoMissing.zh,
                )}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {listing.specs.map((s) => (
                <div
                  key={s.labelEn}
                  className="rounded-lg border border-border p-2.5"
                >
                  <div className="text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground font-mono">
                    {isZh ? s.labelZh : s.labelEn}
                  </div>
                  <div className="mt-0.5 font-mono text-[14px] font-semibold">
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <div className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground font-mono mb-3">
              {t(
                marketplacePage.whyRanked.en(rank),
                marketplacePage.whyRanked.zh(rank),
              )}
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3.5 items-center">
              <div className="rounded-lg border border-danger/25 bg-danger/[0.06] p-3.5">
                <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-mono">
                  {isZh
                    ? listing.diagnostic.beforeLabelZh
                    : listing.diagnostic.beforeLabelEn}
                </div>
                <div className="mt-1.5 font-mono text-[20px] font-semibold text-danger">
                  {listing.diagnostic.beforeValue}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {isZh
                    ? listing.diagnostic.beforeSubZh
                    : listing.diagnostic.beforeSubEn}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="rounded-lg border border-carbon/25 bg-carbon/[0.06] p-3.5">
                <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-mono">
                  {isZh
                    ? listing.diagnostic.afterLabelZh
                    : listing.diagnostic.afterLabelEn}
                </div>
                <div className="mt-1.5 font-mono text-[20px] font-semibold text-carbon">
                  {listing.diagnostic.afterValue}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {isZh
                    ? listing.diagnostic.afterSubZh
                    : listing.diagnostic.afterSubEn}
                </div>
              </div>
            </div>
            {listing.mwhPerYear != null && (
              <div className="mt-3.5 p-3 rounded-lg border border-border bg-white/[0.03] font-mono text-[12.5px] leading-relaxed">
                {listing.mwhPerYear} MWh/yr{" "}
                <span className="text-muted-foreground mx-1.5">×</span>
                {listing.gridEfTPerMwh} tCO2e/MWh{" "}
                <span className="text-muted-foreground mx-1.5">=</span>
                <span className="text-carbon font-semibold">
                  {Math.round(listing.mwhPerYear * listing.gridEfTPerMwh)}{" "}
                  tCO2e/yr {isZh ? "减排" : "avoided"}
                </span>
              </div>
            )}
            <div className="mt-2 text-[10.5px] text-muted-foreground font-mono">
              {t(marketplacePage.citeNote.en, marketplacePage.citeNote.zh)}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="panel p-5">
            <div className="font-mono text-[28px] font-semibold">
              <span className="text-[13px] text-muted-foreground font-medium mr-1">
                ¥
              </span>
              {listing.priceRmb.toLocaleString()}
            </div>
            <div className="mt-0.5 font-mono text-[12.5px] text-muted-foreground line-through">
              ¥{listing.marketPriceRmb.toLocaleString()}{" "}
              {t(marketplacePage.marketRef.en, marketplacePage.marketRef.zh)}
            </div>
            <span className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-carbon/15 text-carbon border border-carbon/30 text-[11.5px] font-mono font-medium">
              {t(
                marketplacePage.belowMarket.en(pct),
                marketplacePage.belowMarket.zh(pct),
              )}
            </span>
            <div className="mt-1.5 text-[11px] text-muted-foreground">
              {t(
                marketplacePage.verifiedNote.en,
                marketplacePage.verifiedNote.zh,
              )}
            </div>
            <div className="my-3.5 h-px bg-border" />
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition"
            >
              {t(
                marketplacePage.requestQuote.en,
                marketplacePage.requestQuote.zh,
              )}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md border border-border text-foreground text-[13px] font-medium hover:bg-surface-2 transition"
            >
              {t(
                marketplacePage.downloadSpec.en,
                marketplacePage.downloadSpec.zh,
              )}
              <Download className="h-3.5 w-3.5" />
            </button>
            <div className="mt-3.5 flex gap-2 p-3 rounded-lg border border-primary/20 bg-primary/[0.06] text-[11.5px] leading-relaxed">
              <Banknote className="h-3.5 w-3.5 shrink-0 mt-0.5 text-teal" />
              <span>
                {t(
                  marketplacePage.financeNote.en,
                  marketplacePage.financeNote.zh,
                )}
              </span>
            </div>
          </div>

          <div className="panel p-5">
            <div className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground font-mono mb-2.5">
              {t(
                marketplacePage.supplierLabel.en,
                marketplacePage.supplierLabel.zh,
              )}
            </div>
            <dl className="flex flex-col divide-y divide-border text-[12px]">
              <div className="flex items-center justify-between py-2">
                <dt className="text-muted-foreground">
                  {t(marketplacePage.contact.en, marketplacePage.contact.zh)}
                </dt>
                <dd>
                  {isZh ? listing.contact.nameZh : listing.contact.nameEn}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-muted-foreground">
                  {t(
                    marketplacePage.responseTime.en,
                    marketplacePage.responseTime.zh,
                  )}
                </dt>
                <dd>{listing.contact.responseTime}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-muted-foreground">
                  {t(
                    marketplacePage.installsOnRecord.en,
                    marketplacePage.installsOnRecord.zh,
                  )}
                </dt>
                <dd>{listing.contact.installsOnRecord}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <CitationFooter extra={`grid EF ${listing.gridEfTPerMwh} tCO2e/MWh`} />
    </AppShell>
  );
}
