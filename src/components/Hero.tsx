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
  const shouldRenderCanvas = useShouldRenderCanvas();

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
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
          className="font-accent animate-fade-in-up inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] shadow-sm backdrop-blur-sm sm:text-xs"
          style={{
            color: theme.accent,
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
          className="animate-slide-up mt-8 font-heading text-5xl font-light leading-[1.1] sm:text-6xl lg:text-7xl xl:text-8xl"
          style={{ color: theme.text, animationDelay: "0ms", letterSpacing: "0.04em" }}
        >
          From the Looms
          <br />
          <span className="italic font-normal">of Kashmir</span>
        </h1>

        <p
          className="animate-fade-in-up mx-auto mt-8 max-w-xl text-base leading-[1.8] sm:text-lg"
          style={{ color: `${theme.text}BB`, animationDelay: "300ms" }}
        >
          Authentic handwoven luxury for discerning individuals and businesses.
          Each piece carries centuries of heritage, woven by master artisans
          in the Kashmir Valley.
        </p>

        <div
          className="animate-fade-in-up mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          style={{ animationDelay: "450ms" }}
        >
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="font-accent rounded-full px-10 py-3.5 text-[11px] font-semibold tracking-[0.2em] uppercase transition-all hover:scale-105"
            style={{ backgroundColor: theme.accent, color: "#2D2A26" }}
          >
            Explore on Instagram
          </a>
          <a
            href="#contact"
            className="font-accent rounded-full border px-10 py-3.5 text-[11px] font-light tracking-[0.2em] uppercase transition-all hover:scale-105"
            style={{
              borderColor: `${theme.text}30`,
              color: theme.text,
            }}
          >
            Wholesale Inquiries
          </a>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke={`${theme.text}80`}
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
        </svg>
      </div>
    </section>
  );
}
