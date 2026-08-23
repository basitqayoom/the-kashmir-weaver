"use client";

import { useCallback, useRef, useState } from "react";

const stats = [
  { value: "600+", label: "Years of Tradition" },
  { value: "20+", label: "Hand Processes" },
  { value: "12–16", label: "Micron Fibre Fineness" },
  { value: "4,500m", label: "Altitude of Origin" },
  { value: "6–18", label: "Months per Shawl" },
];

export default function StatsStrip() {
  const [animated, setAnimated] = useState(false);
  const [ready, setReady] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Callback ref (not an effect) so the initial setState calls happen during
  // React's commit phase, not inside useEffect.
  const measureRef = useCallback((el: HTMLDivElement | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    setReady(true);

    if (inView) {
      setAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);

    const fallback = setTimeout(() => setAnimated(true), 3500);
    cleanupRef.current = () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <section ref={measureRef} className="bg-charcoal py-14 sm:py-18">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-3 sm:divide-x sm:divide-ivory/10 lg:grid-cols-5">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`text-center motion-reduce:opacity-100 motion-reduce:translate-y-0 ${ready
                  ? `transition-all duration-700 motion-reduce:transition-none ${animated
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                  }`
                  : ""
                }`}
              style={ready && !animated ? { transitionDelay: `${i * 100}ms` } : undefined}
            >
              <p className="font-heading text-4xl font-bold text-gold sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 font-accent text-[11px] uppercase tracking-[0.15em] text-ivory/60">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
