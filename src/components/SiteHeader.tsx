import Navbar from "./Navbar";
import MarqueeStrip from "./MarqueeStrip";
import { getCachedCollections, getCachedFeaturedProducts } from "@/lib/shopify/cached-catalog";
import { getCustomerLoginState } from "@/lib/shopify/customer-login-state";

/** Server wrapper — marquee + nav; fetches collections for dropdown/search. */
export default async function SiteHeader({
  overlay = false,
}: {
  /** Homepage hero overlay — fixed nav, no marquee strip. */
  overlay?: boolean;
}) {
  const [collections, featured, isLoggedIn] = await Promise.all([
    getCachedCollections(),
    getCachedFeaturedProducts(),
    getCustomerLoginState().catch(() => false),
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
        isLoggedIn={isLoggedIn}
      />
    </>
  );
}
