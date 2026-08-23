import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { getCollectionByHandle, getProductsPage, getCollections } from "@/lib/shopify/products";
import ProductCatalog from "@/components/shop/ProductCatalog";
import CollectionProductsScrollCue from "@/components/CollectionProductsScrollCue";
import TrustStrip from "@/components/TrustStrip";
import { siteConfig } from "@/config/site";
import { seoBundle } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
    const collections = await getCollections();
    return collections.map((collection) => ({ handle: collection.handle }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ handle: string }>;
}) {
    const { handle } = await params;
    const collection = await getCollectionByHandle(handle);
    if (!collection) return {};

    return seoBundle({
        title: collection.title,
        description: collection.description || undefined,
        pathname: `/collections/${handle}`,
        image: collection.image?.url,
    });
}

export default async function CollectionPage({
    params,
}: {
    params: Promise<{ handle: string }>;
}) {
    const { handle } = await params;
    const [collection, collections, { products, pageInfo }] = await Promise.all([
        getCollectionByHandle(handle),
        getCollections(),
        getProductsPage({ filters: { collections: [handle] } }),
    ]);
    if (!collection) notFound();

    const heroImage = collection.image ?? products[0]?.featuredImage ?? null;

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
            { "@type": "ListItem", position: 2, name: "Collections", item: `${siteConfig.url}/collections` },
            { "@type": "ListItem", position: 3, name: collection.title, item: `${siteConfig.url}/collections/${handle}` },
        ],
    };

    return (
        <main id="main-content" className="bg-ivory">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            {/* Hero */}
            <section className="relative aspect-4/5 w-full overflow-hidden bg-paper-alt md:aspect-21/9">
                {heroImage && (
                    <Image
                        src={heroImage.url}
                        alt={heroImage.altText ?? collection.title}
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-charcoal/85 via-charcoal/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold">
                            The Kashmir Weaver &middot; Collection
                        </p>
                        <h1 className="mt-4 font-heading text-4xl font-light text-ivory sm:text-5xl md:text-6xl">
                            {collection.title}
                        </h1>
                        {collection.description && (
                            <p className="mt-4 hidden max-w-xl text-base leading-relaxed text-ivory/80 md:block">
                                {collection.description}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <TrustStrip compact />

            <CollectionProductsScrollCue />

            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <Suspense fallback={<div className="min-h-[24rem] animate-pulse rounded-lg bg-paper-alt" aria-hidden="true" />}>
                    <ProductCatalog
                        products={products}
                        pageInfo={pageInfo}
                        collections={collections}
                        collectionHandle={handle}
                        showCollectionFilter={false}
                    />
                </Suspense>
            </section>

            {/* Mobile story — shop first, read second */}
            {collection.description && (
                <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:hidden">
                    <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
                        About This Collection
                    </p>
                    <p className="mt-4 text-base leading-relaxed text-charcoal/70">{collection.description}</p>
                </section>
            )}

            <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
                <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">Shop</p>
                <h2 className="mt-4 font-heading text-3xl font-light text-charcoal sm:text-4xl">
                    Looking for Something Else?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base text-charcoal/70">
                    Browse every hand-woven piece currently in our atelier.
                </p>
                <Link
                    href="/shop"
                    className="font-accent mt-8 inline-flex items-center gap-2 bg-gold px-10 py-3.5 text-[11px] uppercase tracking-[0.2em] text-charcoal transition-colors hover:bg-gold-dark"
                >
                    Shop All Pieces
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                    </svg>
                </Link>
            </section>
        </main>
    );
}
