"use client";

import { useEffect, useId, useRef, useState } from "react";
import { siteConfig } from "@/config/site";

const STORAGE_KEY = "shop-announce";
const LEGACY_KEY = "shop-announce-dismissed";
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 1200;

function shouldShow(): boolean {
  // Migrate permanent dismiss from the previous one-time flag into a 7-day snooze
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy) {
    localStorage.removeItem(LEGACY_KEY);
    localStorage.setItem(STORAGE_KEY, String(Date.now() + SNOOZE_MS));
    return false;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return true;
  if (raw === "forever") return false;

  const until = Number(raw);
  if (!Number.isFinite(until)) {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  }
  return Date.now() >= until;
}

function snooze() {
  localStorage.setItem(STORAGE_KEY, String(Date.now() + SNOOZE_MS));
}

function dismissForever() {
  localStorage.setItem(STORAGE_KEY, "forever");
}

function closePanel(
  setExpanded: (v: boolean) => void,
  setOpen: (v: boolean) => void,
) {
  setExpanded(false);
  window.setTimeout(() => setOpen(false), 320);
}

export default function ShopAnnounceModal() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const titleId = useId();
  const descId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!shouldShow()) return;

    const showTimer = window.setTimeout(() => {
      setOpen(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setExpanded(true));
      });
    }, SHOW_DELAY_MS);

    return () => window.clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!open || !expanded) return;
    closeRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      snooze();
      closePanel(setExpanded, setOpen);
    }
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, expanded]);

  function dismissLater() {
    snooze();
    closePanel(setExpanded, setOpen);
  }

  function goShop() {
    dismissForever();
    closePanel(setExpanded, setOpen);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className={`absolute inset-0 bg-charcoal/70 backdrop-blur-sm transition-opacity duration-300 ${
          expanded ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Dismiss shop announcement"
        onClick={dismissLater}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={`shop-announce-panel relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gold/20 bg-charcoal shadow-2xl transition-[grid-template-rows] duration-300 ease-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        } grid`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="p-6 sm:p-8">
            <button
              ref={closeRef}
              type="button"
              onClick={dismissLater}
              className="absolute right-3 top-3 rounded-full p-2 text-ivory/50 transition-colors hover:text-ivory"
              aria-label="Close"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold">
              Now Open
            </p>
            <h2
              id={titleId}
              className="mt-3 font-heading text-2xl font-bold leading-tight text-ivory sm:text-3xl"
            >
              Full e-commerce is here
            </h2>
            <p id={descId} className="mt-4 text-sm leading-relaxed text-ivory/70 sm:text-base">
              Browse our handwoven collection, choose your piece, and checkout online —
              solids, Kani, and more, ready to ship.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <a
                href={siteConfig.shop.all}
                target="_blank"
                rel="noopener noreferrer"
                onClick={goShop}
                className="font-accent inline-flex w-full items-center justify-center rounded-full bg-gold px-6 py-3.5 text-[11px] font-semibold tracking-[0.15em] uppercase text-charcoal transition-all hover:scale-[1.02] hover:bg-gold-muted"
              >
                Shop Online
              </a>
              <button
                type="button"
                onClick={dismissLater}
                className="font-accent inline-flex w-full items-center justify-center rounded-full border border-ivory/25 px-6 py-3 text-[11px] font-light tracking-[0.15em] uppercase text-ivory transition-colors hover:border-ivory/45"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
