"use client";

import ProductCard from "@/components/shop/ProductCard";
import PagePagination from "@/components/shop/PagePagination";
import { usePagePagination } from "@/hooks/use-page-pagination";
import type { CatalogPageInfo } from "@/lib/shopify/catalog-pagination";
import { SORT_OPTIONS, type ProductCard as ProductCardType, type SortKey } from "@/lib/shopify/types";

export default function CollectionProducts({
    handle,
    products: initialProducts,
    pageInfo,
}: {
    handle: string;
    products: ProductCardType[];
    pageInfo: CatalogPageInfo;
}) {
    const pagination = usePagePagination({
        initialProducts,
        initialPageInfo: pageInfo,
        initialSort: "newest",
        initialFilters: { collections: [handle] },
    });

    function updateSort(sort: SortKey) {
        pagination.applySortAndFilters(sort, { collections: [handle] });
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            {pagination.products.length > 0 && (
                <div className="mb-8 flex justify-end">
                    <select
                        defaultValue="newest"
                        onChange={(e) => updateSort(e.target.value as SortKey)}
                        className="border border-charcoal/15 bg-ivory px-3 py-1.5 text-xs text-charcoal focus:border-gold focus:outline-none"
                        aria-label="Sort products"
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {pagination.products.length === 0 ? (
                <div className="mx-auto max-w-md py-16 text-center">
                    <p className="text-sm leading-relaxed text-charcoal/70">No pieces in this collection yet.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                        {pagination.products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    {(pagination.hasNextPage || pagination.hasPreviousPage) && (
                        <PagePagination
                            currentPage={pagination.currentPage}
                            hasNextPage={pagination.hasNextPage}
                            hasPreviousPage={pagination.hasPreviousPage}
                            onNext={pagination.handleNextPage}
                            onPrevious={pagination.handlePrevPage}
                            isLoading={pagination.isLoading}
                        />
                    )}
                </>
            )}
        </div>
    );
}
