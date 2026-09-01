"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/shop/ProductCard";
import ProductListAnalytics from "@/components/shop/ProductListAnalytics";
import PagePagination from "@/components/shop/PagePagination";
import Spinner from "@/components/Spinner";
import { usePagePagination } from "@/hooks/use-page-pagination";
import { collectColorsFromProducts, productMatchesColors, type CatalogColor } from "@/lib/shopify/catalog-colors";
import type { CatalogPageInfo, CatalogFilters } from "@/lib/shopify/catalog-pagination";
import {
  isSolidsCollectionHandle,
  orderProductsBySolidFamily,
} from "@/lib/shopify/solid-family-order";
import type { Collection, ProductCard as ProductCardType, SortKey } from "@/lib/shopify/types";
import { SORT_OPTIONS } from "@/lib/shopify/types";

function parseSort(value: string | null): SortKey {
  if (value && SORT_OPTIONS.some((o) => o.value === value)) {
    return value as SortKey;
  }
  return "newest";
}

function collectionsFromSearchParams(params: URLSearchParams): string[] {
  return params.getAll("collection").filter(Boolean);
}

function catalogUrlKey(sort: SortKey, collections: string[], query: string): string {
  const cols = [...collections].sort().join("|");
  return `${sort}|${cols}|${query.trim()}`;
}

function formatPriceNumber(amount: number, currencyCode: string): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function ProductCatalog({
    products: initialProducts,
    pageInfo,
    collections,
    initialSort = "newest",
    collectionHandle,
    showCollectionFilter = true,
}: {
    products: ProductCardType[];
    pageInfo: CatalogPageInfo;
    collections: Collection[];
    initialSort?: SortKey;
    /** When set (collection PLP), locks the collection filter. */
    collectionHandle?: string;
    showCollectionFilter?: boolean;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const urlCollections = useMemo(
        () => (collectionHandle ? [collectionHandle] : collectionsFromSearchParams(searchParams)),
        [collectionHandle, searchParams],
    );
    const urlQuery = searchParams.get("q") ?? "";
    const urlSort = parseSort(searchParams.get("sort") ?? initialSort);

    const [sort, setSort] = useState<SortKey>(urlSort);
    const [collectionFilter, setCollectionFilter] = useState<string[]>(urlCollections);
    const [textQuery] = useState(urlQuery);
    const [priceMinFilter, setPriceMinFilter] = useState<number | undefined>();
    const [priceMaxFilter, setPriceMaxFilter] = useState<number | undefined>();
    const [colorFilter, setColorFilter] = useState<Set<string>>(new Set());
    const [drawerOpen, setDrawerOpen] = useState(false);
    const priceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    /** Tracks the last URL key we wrote or applied, so soft-nav / back-forward can sync without fighting our own replace(). */
    const appliedUrlKeyRef = useRef(
        catalogUrlKey(urlSort, urlCollections, urlQuery),
    );

    const initialFilters = useMemo<CatalogFilters>(
        () => ({
            collections: urlCollections.length ? urlCollections : undefined,
            query: urlQuery.trim() || undefined,
        }),
        // Seed once from the first paint's URL — later URL sync goes through applySortAndFilters.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const pagination = usePagePagination({
        initialProducts,
        initialPageInfo: pageInfo,
        initialSort: urlSort,
        initialFilters,
    });

    const syncUrl = useCallback(
        (nextSort: SortKey, filters: CatalogFilters) => {
            if (collectionHandle) return;
            const params = new URLSearchParams();
            if (nextSort !== "newest") params.set("sort", nextSort);
            for (const handle of filters.collections ?? []) {
                params.append("collection", handle);
            }
            if (filters.query?.trim()) params.set("q", filters.query.trim());
            const qs = params.toString();
            appliedUrlKeyRef.current = catalogUrlKey(
                nextSort,
                filters.collections ?? [],
                filters.query ?? "",
            );
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        },
        [collectionHandle, pathname, router],
    );

    // Soft navigation / back-forward: apply collection+sort+q from the URL when it
    // changes outside our own syncUrl writes (e.g. header link to ?collection=…).
    useEffect(() => {
        if (collectionHandle) return;
        const nextKey = catalogUrlKey(urlSort, urlCollections, urlQuery);
        if (nextKey === appliedUrlKeyRef.current) return;
        appliedUrlKeyRef.current = nextKey;
        setSort(urlSort);
        setCollectionFilter(urlCollections);
        const filters: CatalogFilters = {
            priceMin: priceMinFilter,
            priceMax: priceMaxFilter,
            collections: urlCollections.length ? urlCollections : undefined,
            query: urlQuery.trim() || undefined,
        };
        pagination.applySortAndFilters(urlSort, filters);
        // priceMin/Max intentionally omitted from deps — keep client price facet across URL collection changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionHandle, urlSort, urlCollections, urlQuery]);

    const gridRef = useRef<HTMLDivElement>(null);
    const prevPageRef = useRef(1);
    useEffect(() => {
        if (prevPageRef.current !== pagination.currentPage) {
            prevPageRef.current = pagination.currentPage;
            gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [pagination.currentPage]);

    // Lock body scroll while the mobile filter drawer is open; close on Escape.
    useEffect(() => {
        if (!drawerOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setDrawerOpen(false);
        };
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        };
    }, [drawerOpen]);

    const currentFilters = (): CatalogFilters => ({
        priceMin: priceMinFilter,
        priceMax: priceMaxFilter,
        collections: collectionFilter.length ? collectionFilter : undefined,
        query: textQuery.trim() || undefined,
    });

    const updateSort = (next: SortKey) => {
        setSort(next);
        const filters = currentFilters();
        pagination.applySortAndFilters(next, filters);
        syncUrl(next, filters);
    };

    const toggleCollection = (handle: string) => {
        if (collectionHandle) return;
        const next = collectionFilter.includes(handle)
            ? collectionFilter.filter((h) => h !== handle)
            : [...collectionFilter, handle];
        setCollectionFilter(next);
        const filters = {
            priceMin: priceMinFilter,
            priceMax: priceMaxFilter,
            collections: next.length ? next : undefined,
            query: textQuery.trim() || undefined,
        };
        pagination.applySortAndFilters(sort, filters);
        syncUrl(sort, filters);
    };

    const applyPrice = (lo: number, hi: number) => {
        setPriceMinFilter(lo);
        setPriceMaxFilter(hi);
        if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
        priceTimerRef.current = setTimeout(() => {
            pagination.applySortAndFilters(sort, {
                priceMin: lo,
                priceMax: hi,
                collections: collectionFilter.length ? collectionFilter : undefined,
            });
        }, 400);
    };

    const resetPrice = () => {
        setPriceMinFilter(undefined);
        setPriceMaxFilter(undefined);
        pagination.applySortAndFilters(sort, {
            collections: collectionFilter.length ? collectionFilter : undefined,
        });
    };

    const toggleColor = (name: string) => {
        setColorFilter((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const resetAll = () => {
        setCollectionFilter([]);
        setPriceMinFilter(undefined);
        setPriceMaxFilter(undefined);
        setColorFilter(new Set());
        const filters: CatalogFilters = {
            query: textQuery.trim() || undefined,
        };
        pagination.applySortAndFilters(sort, filters);
        syncUrl(sort, filters);
    };

    const priceBounds = useMemo(() => {
        const amounts = pagination.products.map((p) => Number(p.priceRange.minVariantPrice.amount));
        return {
            min: amounts.length ? Math.min(...amounts) : 0,
            max: amounts.length ? Math.max(...amounts) : 0,
            currency: pagination.products[0]?.priceRange.minVariantPrice.currencyCode ?? "USD",
        };
    }, [pagination.products]);

    const availableColors = useMemo(
        () => collectColorsFromProducts([...initialProducts, ...pagination.products]),
        [initialProducts, pagination.products]
    );

    const filtered = useMemo(() => {
        let list = pagination.products;
        if (colorFilter.size) {
            list = list.filter((p) => productMatchesColors(p, [...colorFilter]));
        }
        if (collectionHandle && isSolidsCollectionHandle(collectionHandle) && !colorFilter.size) {
            list = orderProductsBySolidFamily(list);
        }
        return list;
    }, [pagination.products, colorFilter, collectionHandle]);

    const priceActive = priceMinFilter !== undefined || priceMaxFilter !== undefined;
    const activeCount = collectionFilter.length + (priceActive ? 1 : 0) + colorFilter.size;

    const activePills: { key: string; label: string; swatch?: string; onRemove: () => void }[] = [];
    for (const handle of collectionFilter) {
        const collection = collections.find((c) => c.handle === handle);
        activePills.push({ key: `col-${handle}`, label: collection?.title ?? handle, onRemove: () => toggleCollection(handle) });
    }
    if (priceActive) {
        activePills.push({
            key: "price",
            label: `${formatPriceNumber(priceMinFilter ?? priceBounds.min, priceBounds.currency)} – ${formatPriceNumber(priceMaxFilter ?? priceBounds.max, priceBounds.currency)}`,
            onRemove: resetPrice,
        });
    }
    for (const name of colorFilter) {
        const color = availableColors.find((c) => c.name === name);
        activePills.push({ key: `color-${name}`, label: name, swatch: color?.hex, onRemove: () => toggleColor(name) });
    }

    const FilterPanel = (
        <div className="divide-y divide-charcoal/10">
            {showCollectionFilter && collections.length > 0 && (
                <div className="py-5">
                    <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-charcoal/70">
                        Collections{collectionFilter.length ? ` (${collectionFilter.length})` : ""}
                    </p>
                    <div className="mt-3 space-y-1">
                        {collections.map((c) => (
                            <CheckRow key={c.handle} label={c.title} checked={collectionFilter.includes(c.handle)} onChange={() => toggleCollection(c.handle)} />
                        ))}
                    </div>
                </div>
            )}

            <div className="py-5">
                <div className="flex items-center justify-between">
                    <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-charcoal/70">Price</p>
                    {priceActive && (
                        <button type="button" onClick={resetPrice} className="text-[10px] uppercase tracking-[0.15em] text-charcoal/70 hover:text-gold-text">
                            Reset
                        </button>
                    )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <PriceField
                        label="Min"
                        value={priceMinFilter ?? priceBounds.min}
                        min={priceBounds.min}
                        max={priceMaxFilter ?? priceBounds.max}
                        onCommit={(v) => applyPrice(v, priceMaxFilter ?? priceBounds.max)}
                    />
                    <PriceField
                        label="Max"
                        value={priceMaxFilter ?? priceBounds.max}
                        min={priceMinFilter ?? priceBounds.min}
                        max={priceBounds.max}
                        onCommit={(v) => applyPrice(priceMinFilter ?? priceBounds.min, v)}
                    />
                </div>
            </div>

            {availableColors.length > 0 && (
                <div className="py-5">
                    <div className="flex items-center justify-between">
                        <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-charcoal/70">
                            Colour{colorFilter.size ? ` (${colorFilter.size})` : ""}
                        </p>
                        {colorFilter.size > 0 && (
                            <button type="button" onClick={() => setColorFilter(new Set())} className="text-[10px] uppercase tracking-[0.15em] text-charcoal/70 hover:text-gold-text">
                                Clear
                            </button>
                        )}
                    </div>
                    <div className="mt-3 flex max-h-64 flex-wrap gap-1.5 overflow-y-auto">
                        {availableColors.map((color) => (
                            <ColorChip key={color.name} color={color} checked={colorFilter.has(color.name)} onChange={() => toggleColor(color.name)} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div id={collectionHandle ? "collection-products" : undefined}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 pb-5">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        className="font-accent inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-charcoal/70 lg:hidden"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m9 12h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0H13.5m-9.75-6h9.75m-9.75 0a1.5 1.5 0 003 0m-3 0a1.5 1.5 0 013 0m9.75 0h3.75" />
                        </svg>
                        Filters
                        {activeCount > 0 && <span className="inline-flex h-4 min-w-4 items-center justify-center bg-gold px-1 text-[9px] text-charcoal">{activeCount}</span>}
                    </button>
                    <p className="text-sm text-charcoal/70">{filtered.length} products</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-accent hidden text-[10px] uppercase tracking-[0.2em] text-charcoal/70 sm:inline">Sort</span>
                    <SortDropdown value={sort} onChange={updateSort} />
                </div>
            </div>

            {activePills.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 border-b border-charcoal/10 py-4">
                    {activePills.map((pill) => (
                        <button
                            key={pill.key}
                            type="button"
                            onClick={pill.onRemove}
                            className="inline-flex items-center gap-1.5 border border-gold/30 bg-gold/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-charcoal/70 transition-colors hover:border-gold/60"
                        >
                            {pill.swatch && <span className="h-2.5 w-2.5 rounded-full border border-charcoal/10" style={{ background: pill.swatch }} />}
                            <span className="max-w-40 truncate">{pill.label}</span>
                            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    ))}
                    <button type="button" onClick={resetAll} className="text-[10px] uppercase tracking-[0.15em] text-charcoal/70 hover:text-gold-text">
                        Clear all
                    </button>
                </div>
            )}

            <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
                <div className="hidden lg:block" role="region" aria-label="Filters">
                    <div className="sticky top-28">{FilterPanel}</div>
                </div>

                <div>
                    {filtered.length === 0 ? (
                        <div className="py-24 text-center">
                            <p className="text-sm text-charcoal/70">No pieces match this selection.</p>
                            {activeCount > 0 && (
                                <button type="button" onClick={resetAll} className="font-accent mt-4 text-[11px] uppercase tracking-[0.2em] text-gold-text">
                                    Reset filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <ProductListAnalytics
                                products={filtered}
                                listId={collectionHandle ?? "shop_all"}
                                listName={collectionHandle ? `Collection: ${collectionHandle}` : "Shop"}
                            />
                            <div className="relative">
                                <div
                                    ref={gridRef}
                                    aria-busy={pagination.isLoading}
                                    className={`grid grid-cols-2 gap-4 transition-opacity duration-200 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 ${pagination.isLoading ? "opacity-40" : ""}`}
                                >
                                    {filtered.map((product, index) => (
                                        <ProductCard key={product.id} product={product} priority={index < 4} />
                                    ))}
                                </div>
                                {pagination.isLoading && (
                                    <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-24 text-charcoal">
                                        <Spinner size="lg" label="Loading pieces" />
                                    </div>
                                )}
                            </div>
                            <PagePagination
                                currentPage={pagination.currentPage}
                                hasNextPage={pagination.hasNextPage}
                                hasPreviousPage={pagination.hasPreviousPage}
                                onNext={pagination.handleNextPage}
                                onPrevious={pagination.handlePrevPage}
                                isLoading={pagination.isLoading}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Mobile filter drawer */}
            <div className={`fixed inset-0 z-60 overflow-hidden transition-opacity duration-300 lg:hidden ${drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}>
                <button type="button" aria-label="Close filters" className="absolute inset-0 bg-charcoal/40" onClick={() => setDrawerOpen(false)} />
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Filters"
                    className={`absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col bg-ivory transition-transform duration-300 ${drawerOpen ? "translate-y-0" : "translate-y-full"}`}
                >
                    <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-charcoal/15" />
                    <div className="flex shrink-0 items-center justify-between border-b border-charcoal/10 px-5 pb-4 pt-3">
                        <span className="font-accent text-[11px] uppercase tracking-[0.2em] text-charcoal">
                            Filter {activeCount > 0 && `(${activeCount})`}
                        </span>
                        <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close filters" className="text-charcoal/70">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto px-5">{FilterPanel}</div>
                    <div className="shrink-0 border-t border-charcoal/10 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(false)}
                            className="font-accent w-full bg-gold py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal transition-colors hover:bg-gold-dark"
                        >
                            Show {filtered.length} products
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SortDropdown({ value, onChange }: { value: SortKey; onChange: (key: SortKey) => void }) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);
    const selected = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [open]);

    return (
        <div ref={wrapRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex min-w-40 items-center justify-between gap-3 border border-charcoal/15 bg-ivory px-3 py-2 text-[11px] uppercase tracking-[0.15em] text-charcoal transition-colors hover:border-gold/40"
            >
                <span>{selected.label}</span>
                <svg className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>
            {open && (
                <ul className="absolute right-0 top-[calc(100%+0.25rem)] z-50 min-w-full border border-charcoal/10 bg-ivory py-1 shadow-lg">
                    {SORT_OPTIONS.map((o) => (
                        <li key={o.value}>
                            <button
                                type="button"
                                onClick={() => {
                                    onChange(o.value);
                                    setOpen(false);
                                }}
                                className={`block w-full px-3 py-2 text-left text-[11px] uppercase tracking-[0.15em] transition-colors hover:text-gold-text ${o.value === value ? "text-gold-text" : "text-charcoal/70"
                                    }`}
                            >
                                {o.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
    return (
        <label className="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm transition-colors" style={{ color: checked ? undefined : undefined }}>
            <span
                className={`grid h-4 w-4 shrink-0 place-items-center border transition-colors ${checked ? "border-gold bg-gold" : "border-charcoal/25"
                    }`}
            >
                {checked && (
                    <svg className="h-2.5 w-2.5 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                )}
            </span>
            <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
            <span className={checked ? "text-charcoal" : "text-charcoal/70"}>{label}</span>
        </label>
    );
}

function ColorChip({ color, checked, onChange }: { color: CatalogColor; checked: boolean; onChange: () => void }) {
    return (
        <button
            type="button"
            aria-pressed={checked}
            onClick={onChange}
            className={`inline-flex items-center gap-1.5 border px-2 py-1.5 text-[10px] uppercase tracking-widest transition-colors ${checked ? "border-gold bg-gold/10 text-gold-text" : "border-charcoal/15 text-charcoal/70 hover:border-gold/40"
                }`}
        >
            {color.hex ? (
                <span className="h-3 w-3 shrink-0 rounded-full border border-charcoal/10" style={{ background: color.hex }} />
            ) : (
                <span className="h-3 w-3 shrink-0 rounded-full border border-charcoal/20 bg-paper-alt" />
            )}
            <span className="max-w-32 truncate">{color.name}</span>
        </button>
    );
}

function PriceField({
    label,
    value,
    min,
    max,
    onCommit,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    onCommit: (value: number) => void;
}) {
    const [draft, setDraft] = useState(String(Math.round(value)));

    useEffect(() => {
        setDraft(String(Math.round(value)));
    }, [value]);

    const commit = () => {
        const parsed = Number(draft);
        if (!Number.isFinite(parsed)) {
            setDraft(String(Math.round(value)));
            return;
        }
        const next = Math.min(Math.max(Math.round(parsed), Math.round(min)), Math.round(max));
        setDraft(String(next));
        if (next !== Math.round(value)) onCommit(next);
    };

    return (
        <div>
            <label className="font-accent block text-[9px] uppercase tracking-[0.15em] text-charcoal/70">
                {label}
                <input
                    type="number"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    className="mt-1 block w-full border border-charcoal/15 bg-ivory px-2 py-1.5 text-sm normal-case tracking-normal text-charcoal focus:border-gold focus:outline-none"
                />
            </label>
        </div>
    );
}
