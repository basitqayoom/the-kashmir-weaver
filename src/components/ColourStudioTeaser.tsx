"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Shade } from "@/lib/shopify/shades";
import {
  getDefaultShadeCode,
  groupShadesByTone,
  isLightHex,
  toneOf,
  type ToneKey,
} from "@/lib/shopify/colour-studio";
import { buildBuyNowShadeQuery } from "@/lib/shopify/shade-cart";
import SolidRecolorCanvas from "./shop/SolidRecolorCanvas";
import SelectedColourCard from "./shop/SelectedColourCard";
import ColourStudioModal from "./shop/ColourStudioModal";

/** How many individual shades to show inline before “View more colours”. */
const PREVIEW_SHADE_LIMIT = 16;

/** Home teaser for the one hand-dyed solid — preview a tone, then open the full studio. */
export default function ColourStudioTeaser({
  shades,
  productTitle,
  productHref,
  shadeCount,
}: {
  shades: Shade[];
  productTitle: string;
  productHref: string;
  shadeCount: number;
}) {
  const [selectedCode, setSelectedCode] = useState(() => getDefaultShadeCode(shades));
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioTone, setStudioTone] = useState<ToneKey | "all">("all");

  const tones = useMemo(() => groupShadesByTone(shades), [shades]);
  const selected = useMemo(
    () => shades.find((s) => s.code === selectedCode) ?? shades[0] ?? null,
    [shades, selectedCode],
  );
  const activeToneGroup = useMemo(() => {
    if (!selected) return tones[0] ?? null;
    return tones.find((t) => t.tone === toneOf(selected.hex)) ?? tones[0] ?? null;
  }, [tones, selected]);

  const toneShades = activeToneGroup?.shades ?? [];
  const previewShades = toneShades.slice(0, PREVIEW_SHADE_LIMIT);
  const hasMoreColours = shades.length > previewShades.length;

  const pieceHref = useMemo(() => {
    if (!selected) return productHref;
    const qs = buildBuyNowShadeQuery(selected);
    return qs ? `${productHref}?${qs}` : productHref;
  }, [productHref, selected]);

  const openStudio = (tone: ToneKey | "all" = "all") => {
    setStudioTone(tone);
    setStudioOpen(true);
  };

  if (!selected) return null;

  return (
    <section className="reveal border-y border-charcoal/10 bg-paper-alt py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden bg-ivory">
            <SolidRecolorCanvas
              hex={selected.hex}
              fit="contain"
              className="absolute inset-0 h-full w-full"
              alt={`${productTitle} previewed in ${selected.family}`}
            />
          </div>

          <div>
            <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
              Colour Studio
            </p>
            <h2 className="mt-4 font-heading text-3xl font-bold text-charcoal sm:text-4xl lg:text-5xl">
              Try it in <span className="italic font-normal">your colour</span>
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-charcoal/70">
              Our solid Pashmina is hand-dyed to order in {shadeCount}+ shades. Pick a
              tone, refine the shade, then open the studio to browse every colour in
              the dye book.
            </p>

            <div className="mt-8">
              <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-charcoal/70">
                Pick a tone
              </p>
              <ul className="mt-3 flex flex-wrap gap-2.5">
                {tones.map((tone) => {
                  const active = tone.tone === activeToneGroup?.tone;
                  return (
                    <li key={tone.tone}>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCode(tone.shades[Math.floor(tone.shades.length / 2)]!.code)
                        }
                        aria-pressed={active}
                        title={tone.tone}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition ${
                          active ? "border-gold" : "border-charcoal/15 hover:border-gold/50"
                        }`}
                      >
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-full"
                          style={{ backgroundColor: tone.swatchHex }}
                        >
                          <span className="sr-only">{tone.tone}</span>
                          {active && (
                            <svg
                              className={`h-3.5 w-3.5 ${isLightHex(tone.swatchHex) ? "text-charcoal" : "text-ivory"}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                              aria-hidden="true"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {previewShades.length > 0 && (
              <div className="mt-6">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-charcoal/70">
                    {activeToneGroup?.tone ?? "Colours"}
                    <span className="ml-1.5 normal-case tracking-normal text-charcoal/50">
                      ({toneShades.length})
                    </span>
                  </p>
                  {hasMoreColours && (
                    <button
                      type="button"
                      onClick={() => openStudio(activeToneGroup?.tone ?? "all")}
                      className="font-accent text-[10px] uppercase tracking-[0.15em] text-gold-text transition-colors hover:text-charcoal"
                    >
                      View more colours
                    </button>
                  )}
                </div>
                <ul className="mt-3 grid grid-cols-8 gap-2 sm:grid-cols-8">
                  {previewShades.map((shade) => {
                    const active = shade.code === selectedCode;
                    return (
                      <li key={shade.code}>
                        <button
                          type="button"
                          onClick={() => setSelectedCode(shade.code)}
                          title={`${shade.family} · ${shade.code}`}
                          aria-label={`${shade.family} — ${shade.code}`}
                          aria-pressed={active}
                          className="relative flex aspect-square w-full items-center justify-center rounded-full transition-transform active:scale-90"
                          style={{
                            backgroundColor: shade.hex,
                            boxShadow: active
                              ? "0 0 0 2px var(--color-ivory), 0 0 0 3.5px var(--color-gold)"
                              : "inset 0 0 0 1px rgba(0,0,0,0.08), 0 0 0 1px var(--color-border-soft)",
                          }}
                        >
                          {active && (
                            <svg
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke={isLightHex(shade.hex) ? "rgba(28,35,33,0.85)" : "#fff"}
                              strokeWidth={2.5}
                              aria-hidden="true"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="mt-6 max-w-sm">
              <SelectedColourCard shade={selected} />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => openStudio("all")}
                className="font-accent inline-flex min-h-12 items-center justify-center gap-2 bg-gold px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal transition-colors hover:bg-gold-dark"
              >
                Open colour studio
                <span aria-hidden="true">→</span>
              </button>
              <Link
                href={pieceHref}
                className="font-accent inline-flex min-h-12 items-center justify-center gap-2 border border-charcoal/20 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal transition-colors hover:border-gold/50"
              >
                View this piece
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ColourStudioModal
        open={studioOpen}
        onClose={() => setStudioOpen(false)}
        shades={shades}
        selectedCode={selectedCode}
        productName={productTitle}
        initialTone={studioTone}
        onConfirm={(shade) => setSelectedCode(shade.code)}
      />
    </section>
  );
}
