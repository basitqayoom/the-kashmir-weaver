"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { HERO_THEME, heroThemes } from "@/config/theme";
import { siteConfig } from "@/config/site";

const FiberCanvas = dynamic(() => import("./FiberCanvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 z-0 bg-gradient-radial from-gold/5 to-transparent" />
  ),
});

// Only mount the three.js hero background on larger, motion-friendly
// viewports. On mobile and for users who prefer reduced motion the
// decorative canvas (three.js + @react-three/fiber, ~230 KB) would be
// downloaded but never perceptibly animated — a large unused-JS cost
// that the Lighthouse mobile audit was flagging. The gradient fallback
// below preserves the visual look.
function useShouldRenderCanvas() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
    );
    const sync = () => setEnabled(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  return enabled;
}

export default function Hero() {
  const theme = heroThemes[HERO_THEME];
  const isGradient = HERO_THEME === "gradient";
  // "snow"/"gradient" render on a white/near-white background where full-
  // opacity accent gold fails AA text contrast; "teal"/"ink" are dark enough
  // that full-opacity gold passes. Swap to the vetted --color-gold-text on
  // light themes only.
  const isLightTheme = HERO_THEME === "snow" || HERO_THEME === "gradient";
  const shouldRenderCanvas = useShouldRenderCanvas();

  return (
    <section
      className="relative flex min-h-svh items-center justify-center overflow-hidden pt-19 pb-28 sm:pb-32 md:pt-20"
      style={{
        background: isGradient ? theme.background : theme.background,
        backgroundColor: isGradient ? undefined : theme.background,
      }}
    >
      {shouldRenderCanvas ? (
        <FiberCanvas />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 bg-gradient-radial from-gold/5 to-transparent"
        />
      )}

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
        <span
          className="font-accent animate-fade-in-up inline-flex items-center gap-2 border px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] backdrop-blur-sm sm:text-xs"
          style={{
            color: isLightTheme ? "var(--color-gold-text)" : theme.accent,
            backgroundColor: `${theme.accent}1A`,
            borderColor: `${theme.accent}66`,
            animationDelay: "0ms",
          }}
        >
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: theme.accent }}
          />
          GI-Certified Kashmiri Pashmina
        </span>

        <h1
          className="animate-slide-up mt-10 font-heading text-6xl font-light leading-[1.05] sm:text-7xl lg:text-8xl xl:text-9xl"
          style={{ color: theme.text, animationDelay: "0ms", letterSpacing: "0.03em" }}
        >
          From the Looms
          <br />
          <span className="italic font-normal">of Kashmir</span>
        </h1>

        <p
          className="animate-fade-in-up mx-auto mt-9 max-w-xl text-base leading-[1.8] sm:text-lg"
          style={{ color: `${theme.text}BB`, animationDelay: "300ms" }}
        >
          Authentic handwoven luxury for discerning individuals and businesses.
          Each piece carries centuries of heritage, woven by master artisans
          in the Kashmir Valley.
        </p>

        <div
          className="animate-fade-in-up mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          style={{ animationDelay: "450ms" }}
        >
          <a
            href="/shop"
            className="font-accent px-10 py-3.5 text-[11px] font-semibold tracking-[0.2em] uppercase transition-opacity hover:opacity-80"
            style={{ backgroundColor: theme.accent, color: "#1C2321" }}
          >
            Shop the Collection
          </a>
          <a
            href="/concierge"
            className="font-accent border px-10 py-3.5 text-[11px] font-light tracking-[0.2em] uppercase transition-colors hover:bg-charcoal/3"
            style={{
              borderColor: `${theme.text}30`,
              color: theme.text,
            }}
          >
            Concierge
          </a>
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="font-accent text-[11px] font-light tracking-[0.2em] uppercase underline-offset-4 transition-opacity hover:underline"
            style={{ color: `${theme.text}B3` }}
          >
            Instagram
          </a>
        </div>
      </div>

      {/* Scroll hint: hidden below sm, where the stacked CTA column can grow tall enough to collide with it.
          The pulse animation lives on the decorative (aria-hidden) line only — keeping it off the
          text avoids the "Scroll" label cycling through low-opacity, contrast-failing frames. */}
      <div
        className="absolute left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
        style={{ bottom: "calc(2rem + env(safe-area-inset-bottom))" }}
      >
        <span
          className="font-accent text-[9px] uppercase tracking-[0.3em]"
          style={{ color: `${theme.text}B3` }}
        >
          Scroll
        </span>
        <span
          aria-hidden="true"
          className="h-8 w-px animate-pulse"
          style={{ backgroundColor: `${theme.text}40` }}
        />
      </div>
    </section>
  );
}
