"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: "600+", label: "Years of Tradition" },
  { value: "20+", label: "Hand Processes" },
  { value: "12–16", label: "Micron Fibre Fineness" },
  { value: "4,500m", label: "Altitude of Origin" },
  { value: "6–18", label: "Months per Shawl" },
];

export default function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;

    if (inView) {
      setAnimated(true);
      setReady(true);
      return;
    }

    setReady(true);

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
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <section ref={ref} className="bg-charcoal py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`text-center ${
                ready
                  ? `transition-all duration-700 ${
                      animated
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`
                  : ""
              }`}
              style={ready && !animated ? { transitionDelay: `${i * 100}ms` } : undefined}
            >
              <p className="font-heading text-3xl font-bold text-gold sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-ivory/60">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
