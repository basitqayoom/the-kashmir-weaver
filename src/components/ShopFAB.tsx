import { siteConfig } from "@/config/site";

export default function ShopFAB() {
  return (
    <a
      href={siteConfig.shop.all}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-[4.75rem] right-4 z-50 flex h-10 items-center gap-2 rounded-full bg-gold px-4 shadow-lg transition-all hover:scale-105 hover:bg-gold-muted hover:shadow-xl sm:bottom-[5.5rem] sm:right-6 sm:h-11 sm:px-5"
      aria-label="Shop online at thekashmirweaver.shop"
    >
      <svg
        className="h-4 w-4 text-charcoal"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
        />
      </svg>
      <span className="font-accent text-[10px] font-semibold tracking-[0.15em] uppercase text-charcoal sm:text-[11px]">
        Shop
      </span>
    </a>
  );
}
