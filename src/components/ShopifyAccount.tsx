"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { useFocusTrap } from "@/hooks/use-focus-trap";

// Avoids a visible-then-reset flash from a same-tick setState in a plain effect.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const ACCOUNT_SHEET_CLOSE_MS = 220;
const LG_MEDIA_QUERY = "(min-width: 1024px)";

function subscribeMediaQuery(query: string, callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function useIsLgUp() {
  return useSyncExternalStore(
    (callback) => subscribeMediaQuery(LG_MEDIA_QUERY, callback),
    () => window.matchMedia(LG_MEDIA_QUERY).matches,
    () => false,
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.25}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

function AccountMenuPanel({
  isLoggedIn,
  onNavigate,
  listClassName,
}: {
  isLoggedIn: boolean;
  onNavigate: () => void;
  listClassName?: string;
}) {
  const items = isLoggedIn
    ? [
        { key: "orders", label: "Orders", href: "/account/orders" },
        { key: "profile", label: "Profile", href: "/account/profile" },
      ]
    : [
        { key: "sign-in", label: "Sign in", href: "/account/login" },
        { key: "create", label: "Create account", href: "/account/login" },
      ];

  return (
    <ul role="menu" aria-label="Account" className={`px-2 py-1 ${listClassName ?? ""}`}>
      {items.map((item) => (
        <li key={item.key} role="none">
          <Link
            href={item.href}
            role="menuitem"
            onClick={onNavigate}
            className="flex w-full items-center rounded-md px-3 py-3 text-left text-sm tracking-wide text-charcoal transition-all duration-200 hover:bg-paper-alt focus:bg-paper-alt focus:outline-none lg:py-2.5"
          >
            {item.label}
          </Link>
        </li>
      ))}
      {isLoggedIn && (
        <li role="none" className="mt-1 border-t border-charcoal/10 pt-1">
          <form method="POST" action="/account/logout">
            <button
              type="submit"
              role="menuitem"
              onClick={onNavigate}
              className="flex w-full items-center rounded-md px-3 py-3 text-left text-sm tracking-wide text-charcoal/70 transition-all duration-200 hover:bg-paper-alt focus:bg-paper-alt focus:outline-none lg:py-2.5"
            >
              Sign out
            </button>
          </form>
        </li>
      )}
    </ul>
  );
}

/** Header account menu — sign-in, orders, profile, and sign-out. */
export default function ShopifyAccount({
  isLoggedIn = false,
  variant = "icon",
  onNavigate,
}: {
  isLoggedIn?: boolean;
  variant?: "icon" | "tile";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isLgUp = useIsLgUp();
  const [open, setOpen] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetClosingRef = useRef(false);

  const requestClose = useCallback(() => {
    if (sheetClosingRef.current) return;
    sheetClosingRef.current = true;
    setSheetVisible(false);
    window.setTimeout(() => {
      setOpen(false);
      sheetClosingRef.current = false;
    }, ACCOUNT_SHEET_CLOSE_MS);
  }, []);

  const handleOpen = useCallback(() => {
    sheetClosingRef.current = false;
    setOpen(true);
  }, []);

  const handleNavigate = useCallback(() => {
    onNavigate?.();
    if (isLgUp) {
      setOpen(false);
    } else {
      requestClose();
    }
  }, [isLgUp, onNavigate, requestClose]);

  useIsomorphicLayoutEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open || isLgUp) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        requestClose();
        triggerRef.current?.focus();
      }
    };

    lockScroll();
    window.addEventListener("keydown", onKey);
    const raf = requestAnimationFrame(() => setSheetVisible(true));

    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
      cancelAnimationFrame(raf);
      setSheetVisible(false);
    };
  }, [open, isLgUp, requestClose]);

  useEffect(() => {
    if (!open || !isLgUp) return;

    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, isLgUp]);

  useFocusTrap(open && !isLgUp, sheetRef);

  const menuPanel = (
    <AccountMenuPanel
      isLoggedIn={isLoggedIn}
      onNavigate={handleNavigate}
      listClassName={isLgUp ? undefined : "flex-1 min-h-0 overflow-y-auto"}
    />
  );

  const mobileSheet =
    open && !isLgUp && typeof document !== "undefined"
      ? createPortal(
          <>
            <button
              type="button"
              aria-label="Close account menu"
              className="fixed inset-0 z-[80] bg-charcoal/40 transition-opacity duration-300 ease-out motion-reduce:transition-none"
              style={{ opacity: sheetVisible ? 1 : 0 }}
              onClick={requestClose}
            />
            <div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label="Account"
              tabIndex={-1}
              className="fixed inset-x-0 bottom-0 z-[81] flex max-h-[min(85dvh,480px)] flex-col rounded-t-2xl border-t border-charcoal/10 bg-ivory shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none"
              style={{
                paddingBottom: "env(safe-area-inset-bottom)",
                transform: sheetVisible ? "translateY(0)" : "translateY(100%)",
              }}
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-charcoal/10 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-accent text-[0.65rem] uppercase tracking-[0.25em] text-charcoal/70">
                    Account
                  </p>
                  <p className="font-heading text-lg tracking-wide text-charcoal">
                    {isLoggedIn ? "Your account" : "Welcome"}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={requestClose}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-charcoal/70 transition hover:text-gold-text"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-2">
                {menuPanel}
              </div>
            </div>
          </>,
          document.body,
        )
      : null;

  const isTile = variant === "tile";

  return (
    <>
      <div ref={wrapRef} className={`relative ${isTile ? "w-full" : ""}`}>
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={
            isLoggedIn
              ? "Account menu, signed in"
              : "Account menu, sign in or create account"
          }
          onClick={() =>
            open ? (isLgUp ? setOpen(false) : requestClose()) : handleOpen()
          }
          className={
            isTile
              ? "flex aspect-square w-full min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-lg border border-charcoal/10 bg-paper-alt touch-manipulation transition active:opacity-80 focus:outline-none"
              : "flex h-11 w-11 items-center justify-center text-charcoal/80 transition hover:text-gold-text focus:outline-none"
          }
        >
          <UserIcon className={isTile ? "h-5 w-5" : "h-[18px] w-[18px]"} />
          {isTile ? (
            <>
              <span className="font-accent text-[0.6rem] uppercase tracking-[0.16em] text-charcoal/70">
                Account
              </span>
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-charcoal">
                {isLoggedIn ? "Signed in" : "Sign in"}
              </span>
            </>
          ) : null}
        </button>

        {isLgUp && (
          <div
            role="presentation"
            className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-56 max-w-[calc(100vw-2rem)] origin-top-right rounded-xl border border-charcoal/10 bg-ivory py-2 shadow-2xl transition-all duration-300 ease-out"
            style={{
              opacity: open ? 1 : 0,
              transform: open ? "scale(1) translateY(0)" : "scale(0.95) translateY(-8px)",
              pointerEvents: open ? "auto" : "none",
              visibility: open ? "visible" : "hidden",
            }}
          >
            {menuPanel}
          </div>
        )}
      </div>
      {mobileSheet}
    </>
  );
}
