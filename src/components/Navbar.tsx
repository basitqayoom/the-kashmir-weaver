"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLockup, { BrandMark } from "./BrandLockup";
import CartDrawer from "./shop/CartDrawer";
import CurrencyDropdown from "./CurrencyDropdown";
import ShopifyAccount from "./ShopifyAccount";
import {
  openCartDrawer,
  subscribeCartUi,
  getCartUiSnapshot,
  getCartUiServerSnapshot,
} from "@/lib/cart-ui";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import type { Collection, ProductCard } from "@/lib/shopify/types";

// Avoids a visible-then-reset flash from a same-tick setState in a plain effect.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const SearchModal = dynamic(() => import("./SearchModal"));

const MENU_CLOSE_MS = 300;

const navLinks = [
  { label: "Heritage", href: "/heritage" },
  { label: "Craft", href: "/craft" },
  { label: "Concierge", href: "/concierge" },
] as const;

function BagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m-.75 10.5h9a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.25}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

function useCartQuantity(): number {
  const { cart } = useSyncExternalStore(subscribeCartUi, getCartUiSnapshot, getCartUiServerSnapshot);
  return cart?.totalQuantity ?? 0;
}

function AnimatedHeaderBrand({
  condensed,
  overlay,
}: {
  condensed: boolean;
  overlay?: boolean;
}) {
  const brandMotion =
    "transition-[opacity,transform,max-width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

  return (
    <>
      <Link
        href="/"
        aria-label={condensed ? "The Kashmir Weaver — home" : undefined}
        className={`relative flex shrink-0 items-center text-charcoal lg:hidden ${
          condensed ? "h-8 w-8" : "min-h-[2.5rem] min-w-[8.25rem]"
        }`}
      >
        <span
          aria-hidden={condensed}
          className={`absolute inset-0 flex items-center ${brandMotion} ${
            condensed
              ? "pointer-events-none scale-95 opacity-0 -translate-y-1"
              : "scale-100 opacity-100 translate-y-0"
          }`}
        >
          <BrandLockup className="text-left text-[0.95rem] tracking-[0.1em] min-[420px]:text-[1.05rem] min-[420px]:tracking-[0.12em]" />
        </span>
        <span
          aria-hidden={!condensed}
          className={`absolute inset-0 flex items-center ${brandMotion} ${
            condensed
              ? "scale-100 opacity-100 translate-y-0"
              : "pointer-events-none scale-90 opacity-0 translate-y-1"
          }`}
        >
          <BrandMark className="h-8 w-8" />
        </span>
      </Link>

      <Link href="/" className="hidden shrink-0 items-center text-charcoal lg:flex">
        {!overlay && <BrandMark className="h-10 w-10" />}
        <BrandLockup
          className={`text-left text-[1.35rem] tracking-[0.12em] xl:text-[1.55rem] xl:tracking-[0.14em] ${overlay ? "" : "ml-2.5"}`}
        />
      </Link>
    </>
  );
}

export default function Navbar({
  collections = [],
  featuredProducts = [],
  overlay = false,
  isLoggedIn = false,
}: {
  collections?: Collection[];
  featuredProducts?: ProductCard[];
  /** Homepage hero overlay — fixed nav without marquee sibling. */
  overlay?: boolean;
  isLoggedIn?: boolean;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const cartQuantity = useCartQuantity();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuClosingRef = useRef(false);

  useFocusTrap(open, menuRef);

  const requestMenuClose = useCallback(() => {
    if (menuClosingRef.current) return;
    menuClosingRef.current = true;
    setMenuVisible(false);
    window.setTimeout(() => setOpen(false), MENU_CLOSE_MS);
  }, []);

  useIsomorphicLayoutEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    // Read directly in the listener rather than via requestAnimationFrame:
    // rAF callbacks are paused on backgrounded tabs, which would leave the
    // header stuck in its pre-scroll state when the tab is restored.
    const update = () => {
      const y = window.scrollY;
      setScrolled(y > (overlay ? 50 : 24));
      // Overlay pages sit on a full-viewport hero: the bar only pins once the
      // hero has scrolled away, so it never covers the hero itself.
      if (overlay) setPastHero(y > Math.max(160, window.innerHeight * 0.7));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname, overlay]);

  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    menuClosingRef.current = false;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        requestMenuClose();
        menuTriggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    lockScroll();
    const raf = requestAnimationFrame(() => setMenuVisible(true));
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
      cancelAnimationFrame(raf);
    };
  }, [open, requestMenuClose]);

  useIsomorphicLayoutEffect(() => {
    if (open) return;
    setMenuVisible(false);
    menuClosingRef.current = false;
  }, [open]);

  useIsomorphicLayoutEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const condensed = overlay ? pastHero : scrolled;

  const inkClass = "text-charcoal/80 transition hover:text-gold";
  const navInkClass =
    "group relative inline-block whitespace-nowrap py-1 font-accent text-[11px] font-light tracking-[0.2em] uppercase text-charcoal/80 transition-colors hover:text-charcoal";
  const shopCtaClass =
    "animate-shimmer font-accent relative inline-flex items-center gap-2 whitespace-nowrap bg-gold px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-charcoal transition-colors hover:bg-gold-dark";

  // Overlay pages: absolute + transparent over the hero, then pinned once past it.
  const headerPosition = overlay
    ? pastHero
      ? "fixed top-0 left-0 right-0 animate-header-drop"
      : "absolute top-0 left-0 right-0"
    : "sticky top-0";
  const headerBg = overlay
    ? pastHero || open
      ? "bg-ivory/95 backdrop-blur-md shadow-sm"
      : "bg-transparent"
    // Opaque below md: no backdrop-blur is applied there, so a translucent
    // background would let scrolled-under content show through unblurred.
    : "bg-ivory border-b border-charcoal/10 md:bg-[color:var(--header-glass)] md:backdrop-blur-md";
  const headerStyle = overlay
    ? { paddingTop: pastHero ? "env(safe-area-inset-top)" : "0px" }
    : {
        paddingTop: scrolled ? "env(safe-area-inset-top)" : "0px",
      };

  const mobileDrawer =
    open && portalReady
      ? createPortal(
          <div
            ref={menuRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-x-0 top-0 z-[60] flex h-[100dvh] flex-col bg-ivory outline-none transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none lg:hidden"
            style={{
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
              opacity: menuVisible ? 1 : 0,
              transform: menuVisible ? "none" : "translateY(-12px)",
            }}
          >
            <div
              className="flex h-[4.75rem] shrink-0 items-center justify-between gap-4 border-b border-charcoal/10 px-5 min-[420px]:px-6"
            >
              <Link
                href="/"
                onClick={requestMenuClose}
                className="group flex min-w-0 items-center gap-3"
              >
                <BrandMark className="h-8 w-8 shrink-0" />
                <BrandLockup className="text-left text-[1.05rem] tracking-[0.1em]" />
              </Link>
              <button
                type="button"
                onClick={requestMenuClose}
                aria-label="Close menu"
                className="flex h-11 w-11 shrink-0 items-center justify-center touch-manipulation text-charcoal/80 transition hover:text-gold active:opacity-80"
              >
                <CloseIcon className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <nav className="flex flex-col px-5 pt-6 pb-4 min-[420px]:px-6" aria-label="Mobile menu">
                <p className="eyebrow mb-5 text-charcoal/70">Explore</p>
                <ul className="flex flex-col">
                  {/* Shop — shimmer CTA */}
                  <li>
                    <Link
                      href="/shop"
                      onClick={requestMenuClose}
                      aria-current={pathname === "/shop" ? "page" : undefined}
                      className="animate-shimmer font-heading relative flex min-h-14 items-center justify-between gap-4 rounded-full px-5 py-4 text-[1.75rem] leading-none tracking-wide text-charcoal transition active:opacity-80"
                      style={{ background: "var(--color-gold)" }}
                    >
                      <span className="relative z-20 font-accent text-sm font-semibold uppercase tracking-[0.15em]">
                        Shop
                      </span>
                      <ArrowRightIcon className="relative z-20 h-4 w-4 shrink-0 opacity-60" />
                    </Link>
                  </li>

                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <li key={link.href}>
                        <div className="h-px w-full bg-charcoal/8" aria-hidden />
                        <Link
                          href={link.href}
                          onClick={requestMenuClose}
                          aria-current={isActive ? "page" : undefined}
                          className="font-heading flex min-h-14 items-center justify-between gap-4 py-4 text-[1.75rem] leading-none tracking-wide text-charcoal transition hover:text-gold-text active:opacity-80"
                          style={isActive ? { color: "var(--color-gold-text)" } : undefined}
                        >
                          <span>{link.label}</span>
                          <ArrowRightIcon className="h-4 w-4 shrink-0 opacity-40" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="mt-auto border-t border-charcoal/10 px-5 pt-6 pb-8 min-[420px]:px-6">
                <p className="eyebrow mb-4 text-charcoal/70">Preferences</p>
                <div className="grid grid-cols-2 gap-3">
                  <CurrencyDropdown variant="tile" />
                  <ShopifyAccount variant="tile" isLoggedIn={isLoggedIn} onNavigate={requestMenuClose} />
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <header
        className={`${headerPosition} z-50 w-full transition-[padding,background-color,box-shadow] duration-500 ${headerBg}`}
        style={headerStyle}
      >
        <div className="mx-auto flex h-[4.75rem] max-w-[1600px] items-center justify-between gap-4 px-5 min-[420px]:gap-5 min-[420px]:px-6 md:h-20 md:px-6 lg:gap-6 lg:px-8 xl:px-10">
          <div className="min-w-0 flex-1 lg:mr-2 lg:flex-none lg:shrink-0">
            <AnimatedHeaderBrand condensed={condensed} overlay={overlay} />
          </div>

          <div className="flex shrink-0 items-center justify-end gap-1 lg:gap-4 xl:gap-6">
            <nav className="hidden items-center gap-3 xl:gap-6 lg:flex" aria-label="Main">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={navInkClass}>
                  {link.label}
                  <span
                    className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold transition-all duration-300 ease-out group-hover:w-full"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-0.5 lg:hidden">
              <button
                type="button"
                aria-label="Search"
                className={`flex h-11 w-11 min-h-11 min-w-11 items-center justify-center touch-manipulation active:opacity-80 ${inkClass}`}
                onClick={() => setSearchOpen(true)}
              >
                <SearchIcon className="h-[18px] w-[18px]" />
              </button>
              <button
                type="button"
                onClick={openCartDrawer}
                aria-label={
                  cartQuantity > 0
                    ? `Bag, ${cartQuantity} item${cartQuantity === 1 ? "" : "s"}`
                    : "Bag"
                }
                className={`relative flex h-11 w-11 min-h-11 min-w-11 items-center justify-center touch-manipulation active:opacity-80 ${inkClass}`}
              >
                <BagIcon className="h-[18px] w-[18px]" />
                {cartQuantity > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-medium text-charcoal">
                    {cartQuantity > 9 ? "9+" : cartQuantity}
                  </span>
                )}
              </button>
              <button
                ref={menuTriggerRef}
                type="button"
                className={`flex h-11 w-11 min-h-11 min-w-11 items-center justify-center touch-manipulation active:opacity-80 ${inkClass}`}
                aria-label="Open menu"
                aria-expanded={open}
                onClick={() => setOpen(true)}
              >
                <MenuIcon className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="hidden items-center gap-1 lg:flex xl:gap-2">
              <button
                type="button"
                aria-label="Search"
                className={`flex h-11 w-11 items-center justify-center active:opacity-80 ${inkClass}`}
                onClick={() => setSearchOpen(true)}
              >
                <SearchIcon className="h-[18px] w-[18px]" />
              </button>
              <CurrencyDropdown className="h-11 px-2" />
              <ShopifyAccount isLoggedIn={isLoggedIn} />
              <button
                type="button"
                onClick={openCartDrawer}
                aria-label={
                  cartQuantity > 0
                    ? `Bag, ${cartQuantity} item${cartQuantity === 1 ? "" : "s"}`
                    : "Bag"
                }
                className={`relative flex h-11 w-11 items-center justify-center active:opacity-80 ${inkClass}`}
              >
                <BagIcon className="h-[18px] w-[18px]" />
                {cartQuantity > 0 && (
                  <span className="absolute right-1 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-medium text-charcoal">
                    {cartQuantity > 9 ? "9+" : cartQuantity}
                  </span>
                )}
              </button>

              <Link href="/shop" className={`${shopCtaClass} ml-2 xl:ml-3`}>
                <span className="relative z-20">Shop</span>
                <ArrowRightIcon className="relative z-20 h-3.5 w-3.5 shrink-0 opacity-60" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {mobileDrawer}

      <CartDrawer />
      {searchOpen && (
        <SearchModal
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          collections={collections}
          featuredProducts={featuredProducts}
        />
      )}
    </>
  );
}
