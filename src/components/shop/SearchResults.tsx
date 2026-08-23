"use client";

import ProductCard from "@/components/shop/ProductCard";
import PagePagination from "@/components/shop/PagePagination";
import Spinner from "@/components/Spinner";
import { usePagePagination } from "@/hooks/use-page-pagination";
import type { CatalogPageInfo } from "@/lib/shopify/catalog-pagination";
import type { ProductCard as ProductCardType } from "@/lib/shopify/types";

export default function SearchResults({
    query,
    products: initialProducts,
    pageInfo,
}: {
    query: string;
    products: ProductCardType[];
    pageInfo: CatalogPageInfo;
}) {
    const pagination = usePagePagination({
        initialProducts,
        initialPageInfo: pageInfo,
        initialSort: "featured",
        initialFilters: { query },
    });

    if (pagination.products.length === 0) {
        return (
            <div className="mx-auto max-w-md py-16 text-center">
                <p className="font-heading text-2xl text-charcoal">
                    No pieces match &ldquo;{query}&rdquo;.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                    Try a different name, or browse the full collection instead.
                </p>
                <a
                    href="/shop"
                    className="font-accent mt-8 inline-flex items-center gap-2 border border-gold px-8 py-3.5 text-[11px] tracking-[0.2em] uppercase text-gold-text transition-colors hover:bg-gold/5"
                >
                    Browse Shop
                </a>
            </div>
        );
    }

    const countLabel = `${pagination.products.length}${pagination.hasNextPage ? "+" : ""} ${pagination.products.length === 1 ? "result" : "results"
        } for \u201c${query}\u201d`;

    return (
        <div>
            <p className="mb-8 text-sm text-charcoal/70">{countLabel}</p>
            <div className="relative">
                <div
                    aria-busy={pagination.isLoading}
                    className={`grid grid-cols-2 gap-4 transition-opacity duration-200 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 ${pagination.isLoading ? "opacity-40" : ""}`}
                >
                    {pagination.products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                {pagination.isLoading && (
                    <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-24 text-charcoal">
                        <Spinner size="lg" label="Loading results" />
                    </div>
                )}
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
        </div>
    );
}
