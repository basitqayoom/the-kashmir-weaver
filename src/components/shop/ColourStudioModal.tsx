"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Shade } from "@/lib/shopify/shades";
import { COLOUR_STUDIO_DISCLAIMER, groupShadesByTone, isLightHex, type ToneKey } from "@/lib/shopify/colour-studio";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { prefetchRecolorAssets } from "@/hooks/use-recolor-assets";
import SolidRecolorCanvas from "./SolidRecolorCanvas";
import SelectedColourCard from "./SelectedColourCard";

// Avoids a visible-then-reset flash from a same-tick setState in a plain effect.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const CLOSE_MS = 200;

type ToneFilter = ToneKey | "all";

function filterByQuery(shades: Shade[], query: string): Shade[] {
    const q = query.trim().toLowerCase();
    if (!q) return shades;
    return shades.filter(
        (s) =>
            s.code.toLowerCase().includes(q) ||
            s.family.toLowerCase().includes(q) ||
            s.hex.toLowerCase().includes(q)
    );
}

export default function ColourStudioModal({
    open,
    onClose,
    shades,
    selectedCode,
    productName,
    onConfirm,
    purchaseControls,
    priceLabel,
    initialTone = "all",
}: {
    open: boolean;
    onClose: () => void;
    shades: Shade[];
    selectedCode: string;
    productName: string;
    onConfirm: (shade: Shade) => void;
    /** Add to Bag / Buy Now — rendered inside the modal footer (Hydrogen parity). */
    purchaseControls?: ReactNode;
    priceLabel?: string;
    /** Tone filter applied when the studio opens (e.g. from home “View more colours”). */
    initialTone?: ToneFilter;
}) {
    const panelRef = useRef<HTMLDivElement>(null);
    useFocusTrap(open, panelRef);
    const [visible, setVisible] = useState(false);
    const [draftCode, setDraftCode] = useState(selectedCode);
    const [query, setQuery] = useState("");
    const [activeTone, setActiveTone] = useState<ToneFilter>("all");
    const [mobileBrowseAll, setMobileBrowseAll] = useState(false);
    const closingRef = useRef(false);

    const requestClose = useCallback(() => {
        if (closingRef.current) return;
        closingRef.current = true;
        setVisible(false);
        window.setTimeout(onClose, CLOSE_MS);
    }, [onClose]);

    useIsomorphicLayoutEffect(() => {
        if (!open) return;
        closingRef.current = false;
        setDraftCode(selectedCode);
        setQuery("");
        setActiveTone(initialTone);
        setMobileBrowseAll(false);
        prefetchRecolorAssets();
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") requestClose();
        };
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        // A plain timer (not requestAnimationFrame) so the fade-in still runs even
        // when the tab is backgrounded/unfocused and rAF callbacks are paused.
        const timer = window.setTimeout(() => setVisible(true), 20);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
            window.clearTimeout(timer);
        };
    }, [open, requestClose, selectedCode, initialTone]);

    const allGroups = useMemo(() => groupShadesByTone(shades), [shades]);
    const filteredShades = useMemo(() => filterByQuery(shades, query), [shades, query]);
    const groups = useMemo(() => {
        const base = query.trim() ? groupShadesByTone(filteredShades) : allGroups;
        if (activeTone === "all") return base;
        return base.filter((g) => g.tone === activeTone);
    }, [allGroups, filteredShades, query, activeTone]);

    const draftShade = useMemo(
        () => shades.find((s) => s.code === draftCode) ?? shades[0] ?? null,
        [shades, draftCode]
    );

    if (!open || typeof document === "undefined") return null;

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label={`Colour studio for ${productName}`}
            onClick={requestClose}
            className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-charcoal/50 p-0 backdrop-blur-sm transition-opacity duration-300 ease-out sm:p-6"
            style={{ opacity: visible ? 1 : 0 }}
        >
            <div
                ref={panelRef}
                onClick={(e) => e.stopPropagation()}
                className="flex h-full w-full max-w-4xl flex-col bg-ivory shadow-2xl transition-all duration-300 ease-out sm:h-auto sm:max-h-[90vh]"
                style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(12px)" }}
            >
                <div className="flex items-center justify-between border-b border-charcoal/10 px-5 py-4 sm:px-8">
                    <div>
                        <p className="font-accent text-[10px] uppercase tracking-[0.25em] text-gold-text">Colour Studio</p>
                        <h2 className="font-heading text-lg font-bold text-charcoal sm:text-xl">{productName}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={requestClose}
                        aria-label="Close colour studio"
                        className="flex h-10 w-10 shrink-0 items-center justify-center text-charcoal/70 transition-colors hover:text-charcoal"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="grid flex-1 gap-0 overflow-hidden sm:grid-cols-[280px_1fr]">
                    <div className="flex shrink-0 flex-col items-center gap-4 border-b border-charcoal/10 bg-paper-alt p-6 sm:border-b-0 sm:border-r">
                        <div className="relative aspect-square w-full max-w-55 overflow-hidden">
                            <SolidRecolorCanvas
                                hex={draftShade?.hex}
                                fit="contain"
                                className="absolute inset-0 h-full w-full"
                                alt={`${productName} — ${draftShade?.family ?? ""}`}
                            />
                        </div>
                        {draftShade && <SelectedColourCard shade={draftShade} />}
                        <p className="text-center text-[11px] leading-relaxed text-charcoal/70">{COLOUR_STUDIO_DISCLAIMER}</p>
                    </div>

                    <div className="flex min-h-0 flex-col">
                        <div className="space-y-3 border-b border-charcoal/10 px-5 py-4 sm:px-8">
                            <label className="flex items-center gap-2 border border-charcoal/15 px-3 py-2">
                                <svg
                                    className="h-4 w-4 shrink-0 text-charcoal/70"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search by name, code, or hex…"
                                    className="w-full bg-transparent text-sm text-charcoal placeholder:text-charcoal/70 focus:outline-none"
                                />
                            </label>
                            <div
                                className="no-scrollbar flex gap-2 overflow-x-auto"
                                role="tablist"
                                aria-label="Filter by tone"
                            >
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTone === "all"}
                                    onClick={() => setActiveTone("all")}
                                    className={`shrink-0 border px-3 py-1.5 text-[11px] uppercase tracking-wide transition-colors ${activeTone === "all"
                                            ? "border-gold bg-gold/10 text-gold-text"
                                            : "border-charcoal/15 text-charcoal/70 hover:border-gold/40"
                                        }`}
                                >
                                    All ({shades.length})
                                </button>
                                {allGroups.map((g) => (
                                    <button
                                        key={g.tone}
                                        type="button"
                                        role="tab"
                                        aria-selected={activeTone === g.tone}
                                        onClick={() => setActiveTone(g.tone)}
                                        className={`inline-flex shrink-0 items-center gap-1.5 border px-3 py-1.5 text-[11px] uppercase tracking-wide transition-colors ${activeTone === g.tone
                                                ? "border-gold bg-gold/10 text-gold-text"
                                                : "border-charcoal/15 text-charcoal/70 hover:border-gold/40"
                                            }`}
                                    >
                                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: g.swatchHex }} aria-hidden />
                                        {g.tone} ({g.shades.length})
                                    </button>
                                ))}
                            </div>
                            {shades.length > 24 && (
                                <button
                                    type="button"
                                    className="font-accent w-full border border-charcoal/15 py-2 text-[10px] uppercase tracking-[0.15em] text-charcoal/70 transition-colors hover:border-gold/40 sm:hidden"
                                    onClick={() => setMobileBrowseAll(true)}
                                >
                                    Browse all {shades.length} colours
                                </button>
                            )}
                        </div>

                        <div className={`flex-1 overflow-y-auto px-5 py-4 sm:px-8 ${mobileBrowseAll ? "fixed inset-0 z-10 flex flex-col bg-ivory sm:static sm:z-auto" : ""}`}>
                            {mobileBrowseAll && (
                                <div className="mb-4 flex shrink-0 items-center justify-between border-b border-charcoal/10 pb-3 sm:hidden">
                                    <p className="font-heading text-lg text-charcoal">All colours</p>
                                    <button
                                        type="button"
                                        onClick={() => setMobileBrowseAll(false)}
                                        className="font-accent text-[10px] uppercase tracking-[0.15em] text-charcoal/70"
                                    >
                                        Back
                                    </button>
                                </div>
                            )}
                            {groups.every((g) => g.shades.length === 0) ? (
                                <p className="py-12 text-center text-sm text-charcoal/70">No colours match your search.</p>
                            ) : (
                                <div className="space-y-6">
                                    {groups.map((g) => (
                                        <section key={g.tone}>
                                            <p className="font-accent mb-2.5 text-[10px] uppercase tracking-[0.2em] text-charcoal/70">
                                                {g.tone} ({g.shades.length})
                                            </p>
                                            <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
                                                {g.shades.map((shade) => {
                                                    const selected = shade.code === draftCode;
                                                    return (
                                                        <button
                                                            key={shade.code}
                                                            type="button"
                                                            onClick={() => {
                                                                setDraftCode(shade.code);
                                                                onConfirm(shade);
                                                            }}
                                                            title={`${shade.family} · ${shade.code}`}
                                                            aria-label={`${shade.family} — ${shade.code}`}
                                                            aria-pressed={selected}
                                                            className="relative flex aspect-square items-center justify-center rounded-full transition-transform active:scale-90"
                                                            style={{
                                                                backgroundColor: shade.hex,
                                                                boxShadow: selected
                                                                    ? "0 0 0 2px var(--color-ivory), 0 0 0 3.5px var(--color-gold)"
                                                                    : "inset 0 0 0 1px rgba(0,0,0,0.08), 0 0 0 1px var(--color-border-soft)",
                                                            }}
                                                        >
                                                            {selected && (
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke={isLightHex(shade.hex) ? "rgba(28,35,33,0.85)" : "#fff"}
                                                                    strokeWidth={2.5}
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-charcoal/10 px-5 py-4 sm:px-8">
                    {priceLabel && (
                        <p className="mb-3 text-price text-center text-lg text-charcoal">{priceLabel}</p>
                    )}
                    {purchaseControls ? (
                        <div className="space-y-2">{purchaseControls}</div>
                    ) : (
                        <button
                            type="button"
                            disabled={!draftShade}
                            onClick={() => {
                                if (!draftShade) return;
                                onConfirm(draftShade);
                                requestClose();
                            }}
                            className="font-accent w-full bg-gold px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Use This Colour
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
