"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/shopify/format-money";
import Spinner from "./Spinner";
import type { Collection, ProductCard } from "@/lib/shopify/types";

// Avoids a visible-then-reset flash from a same-tick setState in a plain effect.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const CLOSE_MS = 200;
const DEBOUNCE_MS = 200;

type Suggestion = Pick<ProductCard, "id" | "handle" | "title" | "featuredImage" | "priceRange">;

export default function SearchModal({
    open,
    onClose,
    collections,
    featuredProducts,
}: {
    open: boolean;
    onClose: () => void;
    collections: Collection[];
    featuredProducts: ProductCard[];
}) {
    const [query, setQuery] = useState("");
    const [visible, setVisible] = useState(false);
    const [active, setActive] = useState(-1);
    const [results, setResults] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const closingRef = useRef(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const requestClose = useCallback(() => {
        if (closingRef.current) return;
        closingRef.current = true;
        setVisible(false);
        window.setTimeout(onClose, CLOSE_MS);
    }, [onClose]);

    const trimmed = query.trim();

    useIsomorphicLayoutEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!trimmed) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const ac = new AbortController();
        debounceRef.current = setTimeout(() => {
            fetch(`/api/catalog-products?q=${encodeURIComponent(trimmed)}&sort=featured&first=8`, {
                signal: ac.signal,
            })
                .then((r) => r.json())
                .then((data: { products?: Suggestion[] }) => setResults(data.products ?? []))
                .catch(() => { })
                .finally(() => setLoading(false));
        }, DEBOUNCE_MS);
        return () => {
            ac.abort();
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [trimmed]);

    const collectionMatches = useMemo(() => {
        if (!trimmed) return [];
        const q = trimmed.toLowerCase();
        return collections.filter((c) => c.title.toLowerCase().includes(q));
    }, [trimmed, collections]);

    const navList = trimmed ? results : featuredProducts.slice(0, 6);

    useIsomorphicLayoutEffect(() => setActive(-1), [trimmed]);

    useIsomorphicLayoutEffect(() => {
        if (!open) return;
        closingRef.current = false;
        setQuery("");
        setActive(-1);
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") requestClose();
        };
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        // A plain timer (not requestAnimationFrame) so the fade-in still runs even
        // when the tab is backgrounded/unfocused and rAF callbacks are paused.
        const timer = window.setTimeout(() => {
            setVisible(true);
            inputRef.current?.focus();
        }, 20);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
            window.clearTimeout(timer);
        };
    }, [open, requestClose]);

    function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (!navList.length) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => (i + 1) % navList.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => (i <= 0 ? navList.length - 1 : i - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (active >= 0 && navList[active]) {
                window.location.href = `/products/${navList[active].handle}`;
            } else if (trimmed) {
                window.location.href = `/search?q=${encodeURIComponent(trimmed)}`;
            }
        }
    }

    if (!open || typeof document === "undefined") return null;

    const hasQuery = trimmed.length > 0;
    const noMatches = hasQuery && !loading && results.length === 0 && collectionMatches.length === 0;

    return createPortal(
        <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search the collection"
            onClick={requestClose}
            className="fixed inset-0 z-100 flex items-start justify-center overflow-hidden bg-charcoal/40 backdrop-blur-sm transition-opacity duration-300 ease-out"
            style={{ opacity: visible ? 1 : 0 }}
        >
            <button
                type="button"
                onClick={requestClose}
                aria-label="Close search"
                className="fixed right-5 top-5 z-10 flex h-11 w-11 items-center justify-center border border-ivory/20 bg-charcoal/60 text-ivory/80 backdrop-blur-sm transition-colors hover:border-gold/50 hover:text-gold"
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div
                onClick={(e) => e.stopPropagation()}
                className="flex max-h-full w-full max-w-2xl flex-col bg-ivory px-5 pt-16 transition-all duration-300 ease-out sm:px-8 sm:pt-20"
                style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "none" : "translateY(-12px)",
                }}
            >
                <label className="flex shrink-0 items-center gap-4 border-b border-charcoal/15 pb-5">
                    <svg className="h-6 w-6 shrink-0 text-charcoal/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={onInputKeyDown}
                        placeholder="Search shawls, weaves, colours…"
                        aria-label="Search shawls, weaves, colours"
                        autoComplete="off"
                        inputMode="search"
                        enterKeyHint="search"
                        spellCheck={false}
                        className="font-heading w-full bg-transparent text-2xl text-charcoal outline-none placeholder:text-charcoal/70 sm:text-3xl"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery("");
                                inputRef.current?.focus();
                            }}
                            aria-label="Clear search"
                            className="flex h-9 w-9 shrink-0 items-center justify-center text-charcoal/70 transition-colors hover:text-gold"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </label>

                <div className="-mx-5 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-16 pt-8 sm:-mx-8 sm:px-8">
                    {!hasQuery && (
                        <div className="flex flex-col gap-10">
                            {collections.length > 0 && (
                                <div>
                                    <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-charcoal/70">Collections</p>
                                    <div className="mt-4 flex flex-wrap gap-2.5">
                                        {collections.map((c) => (
                                            <a
                                                key={c.handle}
                                                href={`/collections/${c.handle}`}
                                                onClick={requestClose}
                                                className="inline-flex min-h-10 items-center border border-charcoal/15 px-4 py-2 text-xs uppercase tracking-[0.15em] text-charcoal/70 transition-colors hover:border-gold hover:text-gold-text"
                                            >
                                                {c.title}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {navList.length > 0 && (
                                <div>
                                    <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-charcoal/70">Featured</p>
                                    <ul className="mt-3 flex flex-col">
                                        {navList.map((p, i) => (
                                            <ResultRow key={p.id} product={p} active={active === i} onActivate={() => setActive(i)} onClose={requestClose} />
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {hasQuery && loading && results.length === 0 && (
                        <div className="flex flex-col items-center py-16 text-charcoal/70">
                            <Spinner size="lg" label={`Searching for “${trimmed}”`} />
                            <p className="mt-4 text-sm">Searching the collection…</p>
                        </div>
                    )}

                    {hasQuery && (collectionMatches.length > 0 || results.length > 0) && (
                        <div className="flex flex-col gap-10">
                            {collectionMatches.length > 0 && (
                                <div>
                                    <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-charcoal/70">Collections</p>
                                    <div className="mt-4 flex flex-wrap gap-2.5">
                                        {collectionMatches.map((c) => (
                                            <a
                                                key={c.handle}
                                                href={`/collections/${c.handle}`}
                                                onClick={requestClose}
                                                className="inline-flex min-h-10 items-center border border-charcoal/15 px-4 py-2 text-xs uppercase tracking-[0.15em] text-charcoal/70 transition-colors hover:border-gold hover:text-gold-text"
                                            >
                                                {c.title}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {results.length > 0 && (
                                <div>
                                    <p className="font-accent flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-charcoal/70">
                                        {results.length} {results.length === 1 ? "Piece" : "Pieces"}
                                        {loading && <Spinner size="sm" label="Updating results" />}
                                    </p>
                                    <ul className="mt-3 flex flex-col">
                                        {results.map((p, i) => (
                                            <ResultRow key={p.id} product={p} active={active === i} onActivate={() => setActive(i)} onClose={requestClose} />
                                        ))}
                                    </ul>
                                    <Link
                                        href={`/search?q=${encodeURIComponent(trimmed)}`}
                                        onClick={requestClose}
                                        className="font-accent mt-4 inline-flex min-h-11 items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gold-text transition-colors hover:text-gold-dark"
                                    >
                                        View all results
                                        <span aria-hidden="true">→</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {noMatches && (
                        <div className="flex flex-col items-center py-16 text-center">
                            <p className="font-heading text-2xl text-charcoal">No pieces match &ldquo;{query.trim()}&rdquo;.</p>
                            <p className="mt-3 max-w-sm text-sm leading-relaxed text-charcoal/70">
                                Try a different name, or browse the full collection instead.
                            </p>
                            <Link
                                href="/shop"
                                onClick={requestClose}
                                className="font-accent mt-8 inline-flex items-center gap-2 border border-gold px-8 py-3.5 text-[11px] tracking-[0.2em] uppercase text-gold-text transition-colors hover:bg-gold/5"
                            >
                                Browse Shop
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body,
    );
}

function ResultRow({
    product,
    active,
    onActivate,
    onClose,
}: {
    product: Suggestion;
    active: boolean;
    onActivate: () => void;
    onClose: () => void;
}) {
    return (
        <li>
            <Link
                href={`/products/${product.handle}`}
                onClick={onClose}
                onMouseEnter={onActivate}
                className={`group flex items-center gap-4 border-b border-charcoal/10 px-2 py-3 transition-colors ${active ? "bg-paper-alt" : ""
                    }`}
            >
                <span className="relative h-16 w-14 shrink-0 overflow-hidden bg-paper-alt">
                    {product.featuredImage && (
                        <Image
                            src={product.featuredImage.url}
                            alt={product.featuredImage.altText ?? product.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                        />
                    )}
                </span>
                <span className="flex min-w-0 flex-col">
                    <span className="truncate font-heading text-base text-charcoal transition-colors group-hover:text-gold-text">
                        {product.title}
                    </span>
                    <span className="text-price mt-0.5 text-sm text-charcoal/70">
                        {formatMoney(product.priceRange.minVariantPrice)}
                    </span>
                </span>
                <svg className="ml-auto h-4 w-4 shrink-0 text-charcoal/70 transition-transform group-hover:translate-x-1 group-hover:text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                </svg>
            </Link>
        </li>
    );
}
