"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DynamicErrorBoundary } from "./SafeDynamic";

const LoomCanvas = dynamic(
  () => import("./LoomCanvas").catch(() => ({ default: () => null })),
  { ssr: false, loading: () => null },
);

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

const propositions = [
  {
    icon: (
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    heading: "Direct from Artisans",
    description: "No middlemen, no factories. Fair wages directly to the hands that weave your shawl.",
  },
  {
    icon: (
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    heading: "GI-Certified Every Piece",
    description: "Legally verified origin — Government of India Geographical Indication No. 46.",
  },
  {
    icon: (
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    heading: "600+ Year Tradition",
    description: "An unbroken lineage of craft, passed through generations since the 15th century.",
  },
  {
    icon: (
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    heading: "For One or Five Hundred",
    description: "The same exacting luxury standard — whether you order a single shawl or outfit an entire event.",
  },
];

export default function WhyUs() {
  const showCanvas = useShouldRenderCanvas();

  return (
    <section className="relative overflow-hidden bg-paper-alt py-20 sm:py-28">
      {showCanvas ? (
        <DynamicErrorBoundary>
          <LoomCanvas />
        </DynamicErrorBoundary>
      ) : null}
      {/* Subtle texture overlay */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center">
          <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
            Why Us
          </p>
          <h2 className="mt-4 font-heading text-4xl font-bold text-charcoal sm:text-5xl lg:text-6xl">
            Why The Kashmir Weaver
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-charcoal/70">
            In a market where 90% of &ldquo;Pashmina&rdquo; is counterfeit, we are your direct bridge to the real thing.
          </p>
        </div>

        <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-charcoal/10">
          {propositions.map((prop, i) => (
            <div key={i} className="reveal lg:px-10 lg:first:pl-0 lg:last:pr-0">
              <div className="flex items-center gap-4 text-gold">
                {prop.icon}
                <span className="font-heading text-base text-charcoal/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-6 font-heading text-xl font-bold text-charcoal">
                {prop.heading}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{prop.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="divider-gold mt-20" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#CE7A21" opacity="0.6" />
        </svg>
      </div>
    </section>
  );
}
