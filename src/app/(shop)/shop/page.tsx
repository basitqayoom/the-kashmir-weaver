import type { Metadata } from "next";
import { getProductsPage, getCollections } from "@/lib/shopify/products";
import ProductCatalog from "@/components/shop/ProductCatalog";
import type { SortKey } from "@/lib/shopify/types";
import { siteConfig } from "@/config/site";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
    title: "Shop All Pashmina",
    description:
        "Handwoven Kashmiri Pashmina shawls, stoles, and wraps — GI-certified, direct from the loom, shipped worldwide.",
    pathname: "/shop",
});

type SearchParams = {
    sort?: string | string[];
    collection?: string | string[];
    q?: string | string[];
};

function firstParam(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) return value[0];
    return value;
}

function allParams(value: string | string[] | undefined): string[] {
    if (!value) return [];
    return (Array.isArray(value) ? value : [value]).filter(Boolean);
}

export default async function ShopPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const sort = (firstParam(params.sort) as SortKey) || "newest";
    const collectionHandles = allParams(params.collection);
    const query = firstParam(params.q)?.trim() || undefined;

    const [{ products, pageInfo }, collections] = await Promise.all([
        getProductsPage({
            sort,
            filters: {
                collections: collectionHandles.length ? collectionHandles : undefined,
                query,
            },
        }),
        getCollections(),
    ]);

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
            { "@type": "ListItem", position: 2, name: "Shop", item: `${siteConfig.url}/shop` },
        ],
    };

    const itemListJsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: products.slice(0, 12).map((product, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${siteConfig.url}/products/${product.handle}`,
        })),
    };

    return (
        <main id="main-content" className="bg-ivory">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
            />
            <section className="bg-paper-alt pb-12 pt-28 sm:pt-32">
                <div className="reveal mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <p className="eyebrow text-gold-text">
                        The Kashmir Weaver &middot; Shop
                    </p>
                    <h1 className="text-display mt-4 text-charcoal">
                        The Full Collection
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-charcoal/70">
                        Handwoven Pashmina, direct from the looms of Kashmir — GI-certified
                        and shipped worldwide.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <ProductCatalog
                    products={products}
                    pageInfo={pageInfo}
                    collections={collections}
                    initialSort={sort}
                />
            </section>
        </main>
    );
}

