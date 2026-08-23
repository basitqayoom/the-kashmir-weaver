"use client";

import { useCallback, useRef, useState } from "react";
import type { ProductCard, SortKey } from "@/lib/shopify/types";
import type {
  CatalogPageInfo,
  CatalogFilters,
} from "@/lib/shopify/catalog-pagination";
import { serializeFilters } from "@/lib/shopify/catalog-pagination";

type CatalogProductsResponse = {
  products: ProductCard[];
  pageInfo: CatalogPageInfo;
};

type CacheEntry = { products: ProductCard[]; pageInfo: CatalogPageInfo };

async function fetchCatalogPage(
  sort: SortKey,
  filters: CatalogFilters,
  after: string | null,
): Promise<CatalogProductsResponse | null> {
  const params = new URLSearchParams({ sort });
  if (filters.priceMin !== undefined)
    params.set("priceMin", String(filters.priceMin));
  if (filters.priceMax !== undefined)
    params.set("priceMax", String(filters.priceMax));
  for (const handle of filters.collections ?? [])
    params.append("collection", handle);
  if (filters.query?.trim()) params.set("q", filters.query);
  if (after) params.set("after", after);
  const res = await fetch(`/api/catalog-products?${params.toString()}`);
  if (!res.ok) return null;
  const data = (await res.json()) as CatalogProductsResponse;
  if (!Array.isArray(data.products) || !data.pageInfo) return null;
  return data;
}

function cacheKeyFor(sort: SortKey, filters: CatalogFilters): string {
  return `${sort}|${serializeFilters(filters)}`;
}

/**
 * Client-side paged fetch against /api/catalog-products, with a per
 * sort+filter-combo page cache. Mirrors Hydrogen's usePagePagination hook.
 *
 * Unlike Hydrogen's version (which reacts to sort/filters prop changes via
 * effect), this variant is driven entirely by explicit calls —
 * `applySortAndFilters` must be invoked directly from the same event handler
 * that changes sort/filter state, and `goToPage`/next/prev from click
 * handlers. This keeps all data fetching event-driven, never inside a
 * reactive useEffect (this repo's lint config forbids setState-in-effect).
 */
export function usePagePagination({
  initialProducts,
  initialPageInfo,
  initialSort,
  initialFilters = {},
}: {
  initialProducts: ProductCard[];
  initialPageInfo: CatalogPageInfo;
  initialSort: SortKey;
  /** Filters the initial (server-rendered) page was already fetched with — e.g. a search query. */
  initialFilters?: CatalogFilters;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState(initialProducts);
  const [pageInfo, setPageInfo] = useState(initialPageInfo);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef<Map<string, Map<number, CacheEntry>>>(
    new Map([
      [
        cacheKeyFor(initialSort, initialFilters),
        new Map([
          [1, { products: initialProducts, pageInfo: initialPageInfo }],
        ]),
      ],
    ]),
  );
  const sortRef = useRef(initialSort);
  const filtersRef = useRef<CatalogFilters>(initialFilters);
  const requestIdRef = useRef(0);

  const loadPage = useCallback(
    async (
      sort: SortKey,
      filters: CatalogFilters,
      page: number,
      after: string | null,
    ) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      try {
        const data = await fetchCatalogPage(sort, filters, after);
        if (requestId !== requestIdRef.current) return;
        if (!data) return;
        const cacheKey = cacheKeyFor(sort, filters);
        const pageCache = cacheRef.current.get(cacheKey) ?? new Map();
        pageCache.set(page, data);
        cacheRef.current.set(cacheKey, pageCache);
        setCurrentPage(page);
        setProducts(data.products);
        setPageInfo(data.pageInfo);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [],
  );

  /** Call directly from the sort-select onChange / filter-checkbox onChange handler. */
  const applySortAndFilters = useCallback(
    (sort: SortKey, filters: CatalogFilters) => {
      sortRef.current = sort;
      filtersRef.current = filters;
      const cacheKey = cacheKeyFor(sort, filters);
      const cached = cacheRef.current.get(cacheKey)?.get(1);
      if (cached) {
        setCurrentPage(1);
        setProducts(cached.products);
        setPageInfo(cached.pageInfo);
        return;
      }
      void loadPage(sort, filters, 1, null);
    },
    [loadPage],
  );

  const goToPage = useCallback(
    (page: number) => {
      if (loading || page < 1) return;
      const cacheKey = cacheKeyFor(sortRef.current, filtersRef.current);
      const pageCache = cacheRef.current.get(cacheKey) ?? new Map();
      const cached = pageCache.get(page);
      if (cached) {
        setCurrentPage(page);
        setProducts(cached.products);
        setPageInfo(cached.pageInfo);
        return;
      }
      const prevEntry = pageCache.get(page - 1);
      if (!prevEntry?.pageInfo.hasNextPage) return;
      void loadPage(
        sortRef.current,
        filtersRef.current,
        page,
        prevEntry.pageInfo.endCursor,
      );
    },
    [loading, loadPage],
  );

  const handleNextPage = useCallback(
    () => goToPage(currentPage + 1),
    [goToPage, currentPage],
  );
  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) goToPage(currentPage - 1);
  }, [goToPage, currentPage]);

  return {
    products,
    currentPage,
    applySortAndFilters,
    goToPage,
    handleNextPage,
    handlePrevPage,
    hasNextPage: pageInfo.hasNextPage,
    hasPreviousPage: currentPage > 1,
    isLoading: loading,
  };
}
