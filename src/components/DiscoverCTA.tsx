"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { DynamicErrorBoundary } from "./SafeDynamic";
import InstagramFacade from "./InstagramFacade";
import { siteConfig } from "@/config/site";

const LoomCanvas = dynamic(
  () => import("./LoomCanvas").catch(() => ({ default: () => null })),
  { ssr: false, loading: () => null },
);

// Same gate as the hero canvas: only mount the decorative three.js
// animation on larger, motion-friendly devices. Saves the three.js
// download on mobile where it would be unused.
function useShouldRenderCanvas() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
    );
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return enabled;
}

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
  const shouldRenderCanvas = useShouldRenderCanvas();

  return (
    <section className="relative overflow-hidden bg-charcoal py-20 sm:py-28">
      {shouldRenderCanvas && (
        <DynamicErrorBoundary>
          <LoomCanvas />
        </DynamicErrorBoundary>
      )}

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
            solids to intricate Kani weaves and Sozni embroidery. Explore every
            available piece on our online store.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href={siteConfig.shop.all}
              target="_blank"
              rel="noopener noreferrer"
              className="font-accent inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-charcoal transition-all hover:scale-105 hover:bg-gold-muted"
            >
              Shop Online
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
