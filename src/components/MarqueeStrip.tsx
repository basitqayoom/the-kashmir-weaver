import { getShopSettings } from "@/lib/shopify/shop-settings";

const FALLBACK_ITEMS = [
  "Worldwide Shipping",
  "100% Pure GI-Tagged Pashmina",
  "Handwoven in Kashmir",
  "Artisan Crafted",
  "15th-Century Loom Traditions",
  "Authenticity Guaranteed",
  "Ships to USA, UK, Canada & Worldwide",
  "12–16 Micron Changthangi Fibre",
];

function MarqueeContent({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-10 whitespace-nowrap sm:gap-14">
          <span className="font-accent text-[10px] font-light uppercase tracking-[0.3em] sm:text-xs">
            {item}
          </span>
          <span className="text-gold text-sm sm:text-base">◆</span>
        </span>
      ))}
    </>
  );
}

/** Marquee copy is Shopify's `custom.marquee_messages` shop metafield — same source Hydrogen reads. */
export default async function MarqueeStrip() {
  const { marquee } = await getShopSettings();
  const items = marquee.length > 0 ? marquee : FALLBACK_ITEMS;

  return (
    <div
      className="bg-forest-green overflow-hidden py-4 sm:py-5"
      role="region"
      aria-label="Store announcements"
    >
      <div className="animate-marquee flex gap-10 sm:gap-14">
        <div className="flex gap-10 text-ivory sm:gap-14">
          <MarqueeContent items={items} />
        </div>
        <div className="flex gap-10 text-ivory sm:gap-14">
          <MarqueeContent items={items} />
        </div>
      </div>
    </div>
  );
}
