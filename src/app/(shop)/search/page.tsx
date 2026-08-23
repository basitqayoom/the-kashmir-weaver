import type { Metadata } from "next";
import { searchProducts } from "@/lib/shopify/products";
import SearchResults from "@/components/shop/SearchResults";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
    title: "Search",
    pathname: "/search",
    robots: "noindex",
});

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const params = await searchParams;
    const query = (params.q ?? "").trim();
    const { products, pageInfo } = query
        ? await searchProducts({ query })
        : { products: [], pageInfo: { hasNextPage: false, endCursor: null } };

    return (
        <main id="main-content" className="bg-ivory">
            <section className="bg-paper-alt pb-12 pt-28 sm:pt-32">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
                        The Kashmir Weaver &middot; Search
                    </p>
                    <h1 className="mt-4 font-heading text-4xl font-light text-charcoal sm:text-5xl">
                        {query ? `Results for “${query}”` : "Search the Collection"}
                    </h1>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {query ? (
                    <SearchResults query={query} products={products} pageInfo={pageInfo} />
                ) : (
                    <div className="mx-auto max-w-md py-16 text-center">
                        <p className="text-sm leading-relaxed text-charcoal/70">
                            Use the search icon in the header to find a shawl by name, weave, or colour.
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}
