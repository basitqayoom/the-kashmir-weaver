import Navbar from "./Navbar";
import MarqueeStrip from "./MarqueeStrip";
import { getCachedCollections, getCachedFeaturedProducts } from "@/lib/shopify/cached-catalog";

/** Server wrapper — marquee + nav; fetches collections for dropdown/search. */
export default async function SiteHeader({
  overlay = false,
}: {
  /** Homepage hero overlay — fixed nav, no marquee strip. */
  overlay?: boolean;
}) {
  // Login state is deliberately NOT read here: touching the session/headers
  // would make every route that renders the header dynamic. ShopifyAccount
  // resolves it client-side from /api/account/state instead.
  const [collections, featured] = await Promise.all([
    getCachedCollections(),
    getCachedFeaturedProducts(),
  ]);

  return (
    <>
      {!overlay && (
        <div
          className="relative z-40 w-full bg-ivory"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <MarqueeStrip />
        </div>
      )}
      <Navbar
        collections={collections}
        featuredProducts={featured?.nodes ?? []}
        overlay={overlay}
      />
    </>
  );
}
