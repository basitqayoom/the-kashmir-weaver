"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SHADES } from "@/lib/shopify/shades";

export const SHADE_CARD_PDF_URL =
  "https://drive.google.com/file/d/1uBrCxSpr0LCpOW9MMhCPXj-VcVgHR4SE/view";

function extractPrimaryFamily(family: string) {
  return family.split(" / ")[0];
}

const TONES = [
  "Cream",
  "Yellow",
  "Orange",
  "Gold",
  "Peach",
  "Brown",
  "Tan",
  "Green",
  "Teal",
  "Blue",
  "Navy",
  "Purple",
  "Lavender",
  "Mauve",
  "Lilac",
  "Pink",
  "Rose",
  "Magenta",
  "Red",
  "Maroon",
  "Grey",
  "Charcoal",
  "White",
  "Khaki",
  "Taupe",
  "Olive",
  "Sage",
  "Mint",
] as const;

export default function ShadeCardsView() {
  const [activeTone, setActiveTone] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map: Record<string, typeof SHADES> = {};
    for (const shade of SHADES) {
      const key = extractPrimaryFamily(shade.family);
      if (!map[key]) map[key] = [];
      map[key].push(shade);
    }
    return map;
  }, []);

  const visibleKeys = useMemo(() => {
    if (!activeTone) return Object.keys(groups).sort();
    return Object.keys(groups)
      .filter((k) => k === activeTone)
      .sort();
  }, [activeTone, groups]);

  const handleCopy = (hex: string) => {
    void navigator.clipboard.writeText(hex);
  };

  return (
    <main id="main-content" className="bg-ivory pb-48 pt-32">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="mb-12 text-center">
          <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
            The Kashmir Weaver
          </p>
          <h1 className="mt-4 font-heading text-4xl font-light leading-[1.1] md:text-6xl">
            Shade Cards
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-charcoal/70">
            {SHADES.length} colours organised by family. Click any card to copy
            its hex value, or open the official shade card PDF.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/collections/all"
              className="inline-flex items-center gap-3 bg-gold px-8 py-4 font-accent text-sm uppercase tracking-[0.2em] text-charcoal transition hover:bg-gold-dark"
            >
              Shop solids →
            </Link>
            <a
              href={SHADE_CARD_PDF_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 border border-charcoal/15 px-8 py-4 font-accent text-sm uppercase tracking-[0.2em] text-charcoal transition hover:border-gold hover:text-gold"
            >
              View official shade card (PDF) ↗
            </a>
          </div>
        </div>

        <div className="mb-12 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTone(null)}
            className={`px-4 py-2 font-accent text-xs uppercase tracking-[0.15em] transition ${
              activeTone === null
                ? "bg-gold text-charcoal"
                : "border border-charcoal/15 text-charcoal/70 hover:text-charcoal"
            }`}
          >
            All
          </button>
          {TONES.filter((t) => groups[t]).map((tone) => (
            <button
              key={tone}
              type="button"
              onClick={() => setActiveTone(tone)}
              className={`px-4 py-2 font-accent text-xs uppercase tracking-[0.15em] transition ${
                activeTone === tone
                  ? "bg-gold text-charcoal"
                  : "border border-charcoal/15 text-charcoal/70 hover:text-charcoal"
              }`}
            >
              {tone} ({groups[tone].length})
            </button>
          ))}
        </div>

        <div className="space-y-20">
          {visibleKeys.map((key) => (
            <section key={key}>
              <div className="mb-6 flex items-baseline gap-4">
                <h2 className="font-heading text-2xl font-normal md:text-3xl">
                  {key}
                </h2>
                <span className="text-sm text-charcoal/70">
                  {groups[key].length} shades
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {groups[key].map((shade) => (
                  <button
                    key={shade.code}
                    type="button"
                    onClick={() => handleCopy(shade.hex)}
                    className="group relative overflow-hidden border border-charcoal/10 bg-paper-alt transition hover:border-gold/40 hover:shadow-lg hover:shadow-gold/5"
                  >
                    <div
                      className="h-28 w-full sm:h-32"
                      style={{ background: shade.hex }}
                    />
                    <div className="p-3 text-left">
                      <div className="font-mono text-xs font-medium text-charcoal/90">
                        {shade.code}
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-charcoal/70">
                        {shade.hex}
                      </div>
                      <div className="mt-1 truncate text-[11px] text-charcoal/70">
                        {shade.family}
                      </div>
                    </div>
                    <div className="absolute right-2 top-2 rounded bg-ivory/80 px-1.5 py-0.5 text-[10px] text-charcoal/70 opacity-0 backdrop-blur transition group-hover:opacity-100">
                      copy
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
