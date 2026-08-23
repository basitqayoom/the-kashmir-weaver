"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useDisplayCurrency } from "@/lib/display-currency";
import { CHECKOUT_CURRENCY } from "@/lib/display-currencies";
import type { DisplayCurrencyOption } from "@/lib/display-currencies";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import Spinner from "./Spinner";

// Avoids a visible-then-reset flash from a same-tick setState in a plain effect.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const CURRENCY_SHEET_CLOSE_MS = 220;
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

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
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

function ChevronDownIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
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
      strokeWidth={1.25}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

/** Display-currency picker — desktop dropdown; mobile bottom sheet via portal. */
export default function CurrencyDropdown({
  className = "",
  variant = "icon",
}: {
  className?: string;
  variant?: "icon" | "tile";
}) {
  const {
    currencies,
    displayCurrency,
    setDisplayCurrency,
    checkoutCurrency,
    ratesReady,
  } = useDisplayCurrency();
  const isLgUp = useIsLgUp();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetClosingRef = useRef(false);

  const displayCode = displayCurrency.code;

  const requestClose = useCallback(() => {
    if (sheetClosingRef.current) return;
    sheetClosingRef.current = true;
    setSheetVisible(false);
    window.setTimeout(() => {
      setOpen(false);
      sheetClosingRef.current = false;
    }, CURRENCY_SHEET_CLOSE_MS);
  }, []);

  const handleOpen = useCallback(() => {
    sheetClosingRef.current = false;
    setOpen(true);
  }, []);

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

  useIsomorphicLayoutEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery("");
    }
  }, [open]);

  useFocusTrap(open && !isLgUp, sheetRef, inputRef);

  const q = query.trim().toLowerCase();
  const results = q
    ? currencies.filter((c) =>
        [c.code, c.symbol, c.name].some((field) => field.toLowerCase().includes(q)),
      )
    : currencies;

  const handleSelect = (code: string) => {
    setDisplayCurrency(code);
    if (isLgUp) {
      setOpen(false);
    } else {
      requestClose();
    }
  };

  const pickerPanel = (
    <CurrencyPickerPanel
      query={query}
      setQuery={setQuery}
      inputRef={inputRef}
      results={results}
      displayCode={displayCode}
      checkoutCurrency={checkoutCurrency}
      ratesReady={ratesReady}
      onSelect={handleSelect}
      listClassName={isLgUp ? "max-h-[60vh]" : "max-h-none min-h-0 flex-1"}
    />
  );

  const mobileSheet =
    open && !isLgUp && typeof document !== "undefined"
      ? createPortal(
          <>
            <button
              type="button"
              aria-label="Close currency picker"
              className="fixed inset-0 z-[70] bg-black/40 transition-opacity duration-200"
              style={{ opacity: sheetVisible ? 1 : 0 }}
              onClick={requestClose}
            />
            <div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label="Select display currency"
              tabIndex={-1}
              className="fixed inset-x-0 bottom-0 z-[80] flex max-h-[85dvh] flex-col rounded-t-2xl border-t border-charcoal/10 bg-ivory outline-none transition-transform duration-200 ease-out"
              style={{
                paddingBottom: "env(safe-area-inset-bottom)",
                transform: sheetVisible ? "translateY(0)" : "translateY(100%)",
              }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-charcoal/10 px-4 py-3">
                <p className="font-accent text-[10px] uppercase tracking-[0.14em] text-charcoal">
                  Display currency
                </p>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={requestClose}
                  className="flex h-10 w-10 items-center justify-center text-charcoal/70"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
              {pickerPanel}
            </div>
          </>,
          document.body,
        )
      : null;

  if (variant === "tile") {
    return (
      <>
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`Display currency, current ${displayCode}`}
          onClick={() => (open ? requestClose() : handleOpen())}
          className={`flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border border-charcoal/10 bg-paper-alt text-center transition hover:border-gold active:opacity-80 ${className}`}
        >
          <GlobeIcon className="h-4 w-4 opacity-70" />
          <p className="font-heading text-lg tracking-wide text-charcoal">{displayCode}</p>
          <p className="font-accent text-[0.6rem] uppercase tracking-[0.16em] text-charcoal/70">
            Display
          </p>
        </button>
        {mobileSheet}
      </>
    );
  }

  return (
    <>
      <div ref={wrapRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup={isLgUp ? "listbox" : "dialog"}
          aria-expanded={open}
          aria-label={`Select display currency, current ${displayCode}`}
          onClick={() => {
            if (open) {
              if (isLgUp) setOpen(false);
              else requestClose();
            } else {
              handleOpen();
            }
          }}
          className={`inline-flex items-center gap-1.5 text-charcoal/80 transition-colors hover:text-gold ${className}`}
        >
          <GlobeIcon className="h-4.5 w-4.5" />
          <span className="font-accent hidden text-[11px] tracking-widest min-[480px]:inline">
            {displayCode}
          </span>
          <ChevronDownIcon
            className="h-3 w-3 opacity-50 transition-transform"
            style={{ transform: open ? "rotate(180deg)" : undefined }}
          />
        </button>

        {isLgUp && (
          <div
            role="dialog"
            aria-label="Display currency"
            className="absolute right-0 top-[calc(100%+0.55rem)] z-50 w-72 overflow-hidden rounded-xl border border-charcoal/10 bg-ivory shadow-lg transition-[opacity,transform,visibility] duration-200 origin-top-right"
            style={{
              opacity: open ? 1 : 0,
              transform: open ? "scale(1) translateY(0)" : "scale(0.95) translateY(-8px)",
              pointerEvents: open ? "auto" : "none",
              visibility: open ? "visible" : "hidden",
            }}
          >
            {pickerPanel}
          </div>
        )}
      </div>
      {mobileSheet}
    </>
  );
}

function CurrencyPickerPanel({
  query,
  setQuery,
  inputRef,
  results,
  displayCode,
  checkoutCurrency,
  ratesReady,
  onSelect,
  listClassName,
}: {
  query: string;
  setQuery: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  results: DisplayCurrencyOption[];
  displayCode: string;
  checkoutCurrency: string;
  ratesReady: boolean;
  onSelect: (code: string) => void;
  listClassName?: string;
}) {
  return (
    <>
      <p className="mx-2 mb-2 rounded-md border border-charcoal/10 bg-paper-alt px-3 py-2 text-[0.65rem] leading-relaxed tracking-wide text-charcoal/70">
        Approximate display only. Cart and checkout are charged in{" "}
        <span className="text-charcoal">{checkoutCurrency}</span>.
        {!ratesReady && (
          <span className="mt-1 flex items-center gap-2">
            <Spinner size="sm" label="Loading live rates" />
            Loading live rates…
          </span>
        )}
      </p>
      <div className="mx-2 mb-2 flex items-center gap-2 rounded-md border border-charcoal/10 bg-ivory px-3 pb-2 pt-2">
        <SearchIcon className="h-3.5 w-3.5 shrink-0 text-charcoal/70" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          role="combobox"
          aria-expanded
          aria-controls="currency-listbox"
          aria-label="Search currency"
          placeholder="Search currency…"
          className="w-full bg-transparent text-base tracking-wide text-charcoal placeholder:text-charcoal/70 focus:outline-none lg:text-xs"
        />
      </div>
      {results.length === 0 ? (
        <p className="px-3 py-6 text-center text-[0.7rem] tracking-wide text-charcoal/70">
          No currencies found
        </p>
      ) : (
        <ul
          id="currency-listbox"
          role="listbox"
          aria-label="Display currency"
          className={`overflow-y-auto overscroll-contain px-2 pb-1 ${listClassName ?? "max-h-[60vh]"}`}
        >
          {results.map((c) => (
            <CurrencyOption
              key={c.code}
              option={c}
              active={c.code === displayCode}
              disabled={!ratesReady && c.code !== checkoutCurrency}
              onSelect={() => onSelect(c.code)}
            />
          ))}
        </ul>
      )}
    </>
  );
}

function CurrencyOption({
  option,
  active,
  disabled = false,
  onSelect,
}: {
  option: DisplayCurrencyOption;
  active: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <li role="option" aria-selected={active}>
      <button
        type="button"
        disabled={active || disabled}
        onClick={onSelect}
        className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-all duration-200 hover:bg-paper-alt focus:bg-paper-alt focus:outline-none disabled:opacity-50 lg:py-2.5"
        style={{
          color: active ? "var(--color-gold-text)" : "var(--foreground)",
          backgroundColor: active ? "var(--surface)" : "transparent",
        }}
      >
        <span className="w-5 shrink-0 text-center text-sm font-light">{option.symbol}</span>
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span
            className="text-xs font-medium tracking-[0.1em]"
            style={{ color: active ? "var(--color-gold-text)" : "var(--foreground)" }}
          >
            {option.code}
          </span>
          <span
            className="truncate text-[0.7rem]"
            style={{
              color: active ? "var(--color-gold-text)" : "var(--muted-foreground)",
              opacity: active ? 0.8 : 1,
            }}
          >
            {option.name}
            {option.code === CHECKOUT_CURRENCY ? " · checkout" : ""}
          </span>
        </span>
        {active && <CheckIcon className="h-4 w-4 shrink-0 text-gold-text" />}
      </button>
    </li>
  );
}
