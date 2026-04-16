"use client";

import { useEffect, useRef } from "react";

const trustPoints = [
  {
    title: "Legally Protected Origin",
    description:
      "Registered under the GI Act of India (GI No. 46), certifying authentic Kashmiri origin.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    title: "100% Pure Pashm Fibre",
    description:
      "Sourced exclusively from the Changthangi goat of Ladakh — fibres as fine as 12–16 microns.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    title: "Hand-Spun & Hand-Woven",
    description:
      "Every thread is spun by hand on a yinder and woven on traditional wooden Saaz by master artisans.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 00-.668-.668 1.667 1.667 0 01-1.667-1.667V8.01a1.575 1.575 0 00-3.15 0" />
      </svg>
    ),
  },
  {
    title: "Lab-Verified & Traceable",
    description:
      "Each product is tested at PTQCC and certified, traceable back to the artisan who crafted it.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a48.667 48.667 0 00-1.488 8.546m4.07-2.163a48.11 48.11 0 01-.588 3.091m-2.527-5.114a42.4 42.4 0 01-.78 2.95m13.036-6.32a6 6 0 00-11.672 1.86 47.712 47.712 0 01-1.285 8.874m11.272-10.727A6 6 0 0112 16.5m2.485-12.186A3 3 0 0012 10.5a48.093 48.093 0 01-1.71 12.455" />
      </svg>
    ),
  },
];

function ThreadRing({ radius, delay, direction }: { radius: number; delay: number; direction: 1 | -1 }) {
  const circumference = 2 * Math.PI * radius;
  return (
    <circle
      cx="160"
      cy="160"
      r={radius}
      fill="none"
      stroke="url(#threadGradient)"
      strokeWidth={2.5}
      strokeDasharray={`${circumference * 0.08} ${circumference * 0.04}`}
      strokeLinecap="round"
      opacity={0.6}
      className="origin-center"
      style={{
        animation: `gi-thread-spin ${18 + delay * 4}s linear infinite ${direction === -1 ? "reverse" : "normal"}`,
        transformOrigin: "160px 160px",
      }}
    />
  );
}

const braidPaths = [0, 60, 120, 180, 240, 300].map((angle) => {
  const rad = (angle * Math.PI) / 180;
  const rad2 = ((angle + 45) * Math.PI) / 180;
  const x1 = (160 + 148 * Math.cos(rad)).toFixed(4);
  const y1 = (160 + 148 * Math.sin(rad)).toFixed(4);
  const x2 = (160 + 148 * Math.cos(rad2)).toFixed(4);
  const y2 = (160 + 148 * Math.sin(rad2)).toFixed(4);
  return { angle, d: `M ${x1} ${y1} A 148 148 0 0 1 ${x2} ${y2}` };
});

function FloatingFiber({ x, y, length, angle, delay }: { x: number; y: number; length: number; angle: number; delay: number }) {
  return (
    <line
      x1={x}
      y1={y}
      x2={x + Math.cos((angle * Math.PI) / 180) * length}
      y2={y + Math.sin((angle * Math.PI) / 180) * length}
      stroke="#D4AF37"
      strokeWidth={1.2}
      strokeLinecap="round"
      opacity={0.35}
      style={{
        animation: `gi-fiber-float ${5 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export default function Authenticity() {
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;

    const reveal = () => el.classList.add("gi-stats-visible");

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);

    const fallback = setTimeout(reveal, 3500);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <section id="authenticity" className="relative overflow-hidden bg-burgundy py-20 sm:py-28">
      {/* Woven texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 8px, #D4AF37 8px, #D4AF37 9px),
            repeating-linear-gradient(90deg, transparent, transparent 8px, #D4AF37 8px, #D4AF37 9px)`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* GI Badge with Thread Ring */}
          <div className="reveal flex items-center justify-center">
            <div className="relative h-80 w-80 sm:h-96 sm:w-96">
              {/* Thread SVG ring */}
              <svg
                viewBox="0 0 320 320"
                className="absolute inset-0 h-full w-full"
              >
                <defs>
                  <linearGradient id="threadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#F5E6A3" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient id="threadGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.8" />
                  </linearGradient>
                  <radialGradient id="glowCenter" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Center glow */}
                <circle cx="160" cy="160" r="110" fill="url(#glowCenter)" />

                {/* Multiple thread rings spinning at different speeds/directions */}
                <ThreadRing radius={148} delay={0} direction={1} />
                <ThreadRing radius={140} delay={1} direction={-1} />
                <ThreadRing radius={132} delay={2} direction={1} />
                <ThreadRing radius={124} delay={0.5} direction={-1} />

                {/* Braided ring (thick, overlapping arcs) */}
                {braidPaths.map(({ angle, d }) => (
                  <path
                    key={angle}
                    d={d}
                    fill="none"
                    stroke="url(#threadGradient2)"
                    strokeWidth={3}
                    strokeLinecap="round"
                    opacity={0.4}
                    style={{
                      animation: `gi-braid-pulse 3s ease-in-out infinite`,
                      animationDelay: `${angle * 0.01}s`,
                    }}
                  />
                ))}

                {/* Inner ring — solid thin */}
                <circle
                  cx="160"
                  cy="160"
                  r="100"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth={0.5}
                  opacity={0.25}
                />

                {/* Floating fibers */}
                <FloatingFiber x={30} y={60} length={25} angle={35} delay={0} />
                <FloatingFiber x={270} y={40} length={20} angle={150} delay={1.2} />
                <FloatingFiber x={20} y={240} length={22} angle={-20} delay={0.6} />
                <FloatingFiber x={280} y={260} length={18} angle={200} delay={1.8} />
                <FloatingFiber x={50} y={150} length={15} angle={80} delay={2.4} />
                <FloatingFiber x={260} y={150} length={20} angle={110} delay={0.3} />
              </svg>

              {/* Center badge content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  {/* Shield icon */}
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/20 bg-gold/5">
                    <svg
                      className="h-8 w-8 text-gold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                      />
                    </svg>
                  </div>
                  <p className="mt-4 font-heading text-2xl font-bold text-gold sm:text-3xl">
                    GI Certified
                  </p>
                  <p className="mt-1 text-xs tracking-widest text-ivory/50">
                    GEOGRAPHICAL INDICATION
                  </p>
                  <p className="mt-0.5 font-heading text-lg font-semibold text-gold/70">
                    No. 46
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="reveal">
            <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold">
              Authenticity Guaranteed
            </p>
            <h2 className="mt-4 font-heading text-3xl font-bold text-ivory sm:text-4xl lg:text-5xl">
              The GI Mark — Your Shield
              <br />
              Against Counterfeits
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ivory/60 sm:text-base">
              In a market flooded with imitations, the Geographical Indication tag
              is your guarantee that you&rsquo;re holding a piece of living heritage —
              not a factory-made replica.
            </p>

            <div className="mt-8 space-y-5">
              {trustPoints.map((point, i) => (
                <div
                  key={i}
                  className="group flex gap-4 rounded-xl border border-ivory/5 bg-ivory/[0.03] p-4 transition-all duration-300 hover:border-gold/20 hover:bg-gold/[0.04]"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gold/20 bg-gold/10 text-gold transition-colors group-hover:bg-gold/20">
                    {point.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-ivory">{point.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ivory/60">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div
          ref={statsRef}
          className="gi-stats mt-16 grid grid-cols-2 gap-4 sm:mt-20 sm:grid-cols-4 sm:gap-6"
        >
          {[
            { value: "90%", label: "of Pashmina sold globally is counterfeit" },
            { value: "12–16μ", label: "fibre diameter — finer than cashmere" },
            { value: "200+", label: "hours to hand-weave a single shawl" },
            { value: "1", label: "GI tag per region — ours is No. 46" },
          ].map((stat, i) => (
            <div
              key={i}
              className="gi-stat-card rounded-xl border border-gold/10 bg-ivory/[0.03] p-5 text-center backdrop-blur-sm"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <p className="font-heading text-2xl font-bold text-gold sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-2 text-xs leading-snug text-ivory/50">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="mx-auto mt-14 max-w-2xl text-center sm:mt-16">
          <span className="font-heading text-5xl leading-none text-gold/25">
            &ldquo;
          </span>
          <p className="mt-1 font-heading text-lg italic leading-relaxed text-ivory/85 sm:text-xl">
            In a world where 90% of what is sold as Pashmina is fake,
            the GI mark is the only truth.
          </p>
          <div className="mx-auto mt-4 h-px w-16 bg-gold/30" />
          <p className="mt-3 text-xs tracking-widest text-gold/50">
            THE KASHMIR WEAVER
          </p>
        </div>
      </div>

      <div className="divider-gold mt-20">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
            fill="#D4AF37"
            opacity="0.6"
          />
        </svg>
      </div>
    </section>
  );
}
