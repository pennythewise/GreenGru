import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MarketplaceListingDetail } from "@/components/MarketplaceListingDetail";
import { getMarketplaceListing } from "@/lib/marketplace-data";

export const Route = createFileRoute("/marketplace/$listingId")({
  loader: ({ params }) => {
    const listing = getMarketplaceListing(params.listingId);
    if (!listing) throw notFound();
    return listing;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.nameEn} · Marketplace · GreenGru`
          : "Marketplace · GreenGru",
      },
    ],
  }),
  notFoundComponent: () => (
    <AppShell crumb="Marketplace">
      <div className="panel p-8 text-center">
        <p className="text-[14px] text-muted-foreground">
          That listing no longer exists.{" "}
          <Link to="/marketplace" className="text-primary hover:underline">
            Back to Marketplace
          </Link>
        </p>
      </div>
    </AppShell>
  ),
  component: RouteComponent,
});

function RouteComponent() {
  const listing = Route.useLoaderData();
  return <MarketplaceListingDetail listing={listing} />;
}
