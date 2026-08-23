import type { Metadata } from "next";
import Link from "next/link";
import { getCollections, getProductsPage } from "@/lib/shopify/products";
import CollectionTile from "@/components/shop/CollectionTile";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
    title: "Collections",
    description: "Browse The Kashmir Weaver's signature collections — Solid Pashmina, Sozni Embroidery, Kani Pashmina, Maheen Kari, and Reversible Pashmina.",
    pathname: "/collections",
});

export default async function CollectionsPage() {
    const collections = await getCollections();

    const previews = await Promise.all(
        collections.map((c) => getProductsPage({ filters: { collections: [c.handle] }, first: 50 })),
    );

    const totalProductCount = previews.reduce((sum, p) => sum + p.products.length, 0);
    const count = collections.length;

    return (
        <main id="main-content" className="bg-ivory">
            <section className="mx-auto max-w-7xl px-4 pb-8 pt-28 sm:px-6 sm:pt-32 lg:px-8">
                <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
                    The Kashmir Weaver &middot; Collections
                </p>
                <h1 className="mt-4 font-heading text-4xl font-light text-charcoal sm:text-5xl">
                    Choose a Collection
                </h1>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-charcoal/70">
                    {count === 1
                        ? "One signature collection — hand-woven, hand-finished, never repeated."
                        : `${count} signature collections. Each a different language of the same fibre — hand-woven, hand-finished, never repeated.`}
                    {totalProductCount > 0 && (
                        <span className="text-charcoal">
                            {" "}
                            {totalProductCount} {totalProductCount === 1 ? "piece" : "pieces"} in the atelier.
                        </span>
                    )}
                </p>
            </section>

            <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
                {count === 1 ? (
                    <CollectionTile
                        collection={collections[0]}
                        productCount={previews[0]?.products.length}
                        previewProducts={previews[0]?.products}
                        featured
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {collections.map((c, i) => (
                            <CollectionTile
                                key={c.handle}
                                collection={c}
                                productCount={previews[i]?.products.length}
                                previewProducts={previews[i]?.products}
                            />
                        ))}
                    </div>
                )}

                <div className="mt-16 text-center">
                    <Link
                        href="/shop"
                        className="font-accent inline-flex items-center gap-2 border border-gold px-10 py-3.5 text-[11px] uppercase tracking-[0.2em] text-gold-text transition-colors hover:bg-gold/5"
                    >
                        Shop All Pieces
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                        </svg>
                    </Link>
                </div>
            </section>
        </main>
    );
}
