import { siteConfig } from "@/config/site";

interface ShopBannerProps {
  eyebrow?: string;
  headline?: string;
  description?: string;
  className?: string;
}

export default function ShopBanner({
  eyebrow = "Shop Online",
  headline = "Browse our full collection",
  description = "Every handwoven piece is available to shop online — from pure solids to intricate Kani weaves.",
  className = "",
}: ShopBannerProps) {
  return (
    <div className={`rounded-2xl bg-charcoal p-8 text-center sm:p-10 ${className}`}>
      <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold">
        {eyebrow}
      </p>
      <p className="mt-3 font-heading text-xl font-bold text-ivory sm:text-2xl lg:text-3xl">
        {headline}
      </p>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ivory/70 sm:text-base">
        {description}
      </p>
      <div className="mt-8 flex justify-center">
        <a
          href={siteConfig.shop.all}
          target="_blank"
          rel="noopener noreferrer"
          className="font-accent inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-charcoal transition-all hover:scale-105 hover:bg-gold-muted"
        >
          Shop Online
        </a>
      </div>
    </div>
  );
}
