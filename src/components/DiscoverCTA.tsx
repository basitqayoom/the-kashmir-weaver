"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { DynamicErrorBoundary } from "./SafeDynamic";
import InstagramFacade from "./InstagramFacade";
import { siteConfig, whatsappLink } from "@/config/site";

const LoomCanvas = dynamic(
  () => import("./LoomCanvas").catch(() => ({ default: () => null })),
  { ssr: false, loading: () => null },
);

const stats = ["50+ Colours", "6 Craft Traditions", "100% Handmade", "GI Certified"];

function useIframeTitles(ref: React.RefObject<HTMLDivElement | null>, title: string) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = () =>
      el.querySelectorAll<HTMLIFrameElement>("iframe:not([title])").forEach(
        (f) => f.setAttribute("title", title),
      );

    apply();
    const mo = new MutationObserver(apply);
    mo.observe(el, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [ref, title]);
}

export default function DiscoverCTA() {
  const embedRef = useRef<HTMLDivElement>(null);
  useIframeTitles(embedRef, "Instagram feed from @thekashmirweaver");

  return (
    <section className="relative overflow-hidden bg-charcoal py-20 sm:py-28">
      <DynamicErrorBoundary>
        <LoomCanvas />
      </DynamicErrorBoundary>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="reveal">
          <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold">
            The Collection
          </p>
          <h2 className="mt-4 font-heading text-3xl font-bold text-ivory sm:text-4xl lg:text-5xl">
            Discover the Collection
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ivory/75 sm:text-lg">
            Our artisans craft hundreds of unique pieces each season — from pure
            solids to intricate Kani weaves and Sozni embroidery. Browse the
            latest via Instagram or request a personalized lookbook on WhatsApp.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="font-accent inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-charcoal transition-all hover:scale-105 hover:bg-gold-muted"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              Browse on Instagram
            </a>
            <a
              href={whatsappLink(siteConfig.whatsappMessages.lookbook)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-accent inline-flex items-center gap-2 rounded-full border border-ivory/20 px-8 py-3 text-[11px] font-light tracking-[0.2em] uppercase text-ivory transition-all hover:scale-105 hover:border-ivory/40"
            >
              Request Lookbook on WhatsApp
            </a>
          </div>

          <div className="font-accent mt-10 flex flex-wrap items-center justify-center gap-4 text-[10px] uppercase tracking-[0.2em] text-ivory/60 sm:gap-8">
            {stats.map((stat, i) => (
              <span key={i} className="flex items-center gap-3">
                {stat}
                {i < stats.length - 1 && (
                  <span className="text-gold/30">·</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Instagram Profile Embed — loaded on demand to keep the
            main-thread light and avoid third-party cookies until the
            visitor opts in. */}
        <div className="mt-14">
          <div className="mb-8 flex items-center justify-center gap-3">
            <span className="h-px flex-1 max-w-16 bg-gold/20" aria-hidden="true" />
            <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold">
              @thekashmirweaver
            </p>
            <span className="h-px flex-1 max-w-16 bg-gold/20" aria-hidden="true" />
          </div>
          <div
            ref={embedRef}
            className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-ivory/10"
          >
            <InstagramFacade
              url={siteConfig.social.instagram}
              handle={siteConfig.social.instagramHandle}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
