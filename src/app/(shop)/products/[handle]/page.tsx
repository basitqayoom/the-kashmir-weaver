import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductByHandle, getProductsPage, getAllProductsForCatalog } from "@/lib/shopify/products";
import ProductDetailShell from "@/components/shop/ProductDetailShell";
import ProductCard from "@/components/shop/ProductCard";
import { siteConfig } from "@/config/site";
import { offerShippingDetails, merchantReturnPolicy, offerPriceValidUntil } from "@/lib/product-schema";
import { gidTail } from "@/lib/tracking-ids";
import { seoBundle } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
    const products = await getAllProductsForCatalog();
    return products.map((product) => ({ handle: product.handle }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ handle: string }>;
}) {
    const { handle } = await params;
    const product = await getProductByHandle(handle);
    if (!product) return {};

    return seoBundle({
        title: product.seo?.title || product.title,
        description:
            product.seo?.description || product.shortDescription?.value || undefined,
        pathname: `/products/${handle}`,
        image: product.featuredImage?.url,
        type: "website",
    });
}

export default async function ProductPage({
    params,
}: {
    params: Promise<{ handle: string }>;
}) {
    const { handle } = await params;
    const product = await getProductByHandle(handle);
    if (!product) notFound();

    const images = product.images.nodes.length
        ? product.images.nodes
        : product.featuredImage
            ? [product.featuredImage]
            : [];

    const inStock = product.variants.nodes.some((v) => v.availableForSale);
    const productUrl = `${siteConfig.url}/products/${product.handle}`;
    const primaryCollection = product.collections.nodes[0];
    const reviewRating = Number(product.reviewRating?.value);
    const reviewCount = Number(product.reviewCount?.value);
    const hasReviews = Boolean(reviewRating) && Boolean(reviewCount);

    const relatedRaw = primaryCollection
        ? (
            await getProductsPage({
                filters: { collections: [primaryCollection.handle] },
                first: 8,
            })
        ).products
        : [];
    const related = relatedRaw.filter((p) => p.handle !== product.handle).slice(0, 4);

    const primarySku =
        product.variants.nodes.find((v) => v.sku)?.sku ??
        product.variants.nodes[0]?.sku;
    const priceAmount = Number(product.priceRange.minVariantPrice.amount);
    const currency = product.priceRange.minVariantPrice.currencyCode;

    const productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description:
            product.seo?.description || product.shortDescription?.value || undefined,
        image: images.map((img) => img.url),
        brand: { "@type": "Brand", name: siteConfig.name },
        ...(product.material?.value ? { material: product.material.value } : {}),
        category: product.productType || undefined,
        ...(primarySku ? { sku: primarySku, mpn: primarySku } : {}),
        productID: gidTail(product.id),
        ...(hasReviews
            ? {
                aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: reviewRating,
                    reviewCount,
                },
            }
            : {}),
        offers: {
            "@type": "Offer",
            price: product.priceRange.minVariantPrice.amount,
            priceCurrency: product.priceRange.minVariantPrice.currencyCode,
            priceValidUntil: offerPriceValidUntil(),
            itemCondition: "https://schema.org/NewCondition",
            availability: inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            url: productUrl,
            seller: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
            shippingDetails: offerShippingDetails(priceAmount, currency),
            hasMerchantReturnPolicy: merchantReturnPolicy(`${siteConfig.url}/returns`),
        },
    };

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
            { "@type": "ListItem", position: 2, name: "Shop", item: `${siteConfig.url}/shop` },
            ...(primaryCollection
                ? [
                    {
                        "@type": "ListItem",
                        position: 3,
                        name: primaryCollection.title,
                        item: `${siteConfig.url}/collections/${primaryCollection.handle}`,
                    },
                ]
                : []),
            {
                "@type": "ListItem",
                position: primaryCollection ? 4 : 3,
                name: product.title,
                item: productUrl,
            },
        ],
    };

    return (
        <main id="main-content" className="bg-ivory pb-24 lg:pb-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="reveal mb-8 flex flex-wrap items-center gap-x-2 text-xs text-charcoal/70">
                    <Link href="/" className="transition-colors hover:text-gold-text">Home</Link>
                    <span aria-hidden="true">/</span>
                    <Link href="/shop" className="transition-colors hover:text-gold-text">Shop</Link>
                    {primaryCollection && (
                        <>
                            <span aria-hidden="true">/</span>
                            <Link href={`/collections/${primaryCollection.handle}`} className="transition-colors hover:text-gold-text">
                                {primaryCollection.title}
                            </Link>
                        </>
                    )}
                    <span aria-hidden="true">/</span>
                    <span className="text-charcoal/70">{product.title}</span>
                </nav>

                <ProductDetailShell product={product} images={images}>
                        <p className="eyebrow text-charcoal/70">
                            {product.productType || product.vendor}
                        </p>
                        <h1 className="mt-3 font-heading text-4xl font-bold text-charcoal sm:text-5xl">
                            {product.title}
                        </h1>
                        {product.shortDescription?.value && (
                            <p className="mt-3 text-base leading-relaxed text-charcoal/70">
                                {product.shortDescription.value}
                            </p>
                        )}
                        {hasReviews && (
                            <div className="mt-3 flex items-center gap-1.5">
                                <div className="flex text-gold" aria-hidden="true">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <svg
                                            key={i}
                                            viewBox="0 0 20 20"
                                            className="h-4 w-4"
                                            fill={i < Math.round(reviewRating) ? "currentColor" : "none"}
                                            stroke="currentColor"
                                            strokeWidth={1}
                                        >
                                            <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1 1 5.8L10 14.9l-5.21 2.74 1-5.8-4.21-4.1 5.82-.85z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-xs text-charcoal/70">
                                    {reviewRating.toFixed(1)} ({reviewCount} review{reviewCount === 1 ? "" : "s"})
                                </span>
                            </div>
                        )}
                        {product.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {product.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="font-accent text-[9px] uppercase tracking-[0.15em] text-charcoal/70"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="mt-8 grid grid-cols-3 gap-3 border-y border-charcoal/10 py-5 text-center">
                            <div className="flex flex-col items-center gap-1.5">
                                <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                                <span className="text-[10px] uppercase tracking-wide text-charcoal/70">GI-Certified</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                                <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 00-.668-.668 1.667 1.667 0 01-1.667-1.667V8.01a1.575 1.575 0 00-3.15 0" />
                                </svg>
                                <span className="text-[10px] uppercase tracking-wide text-charcoal/70">Handwoven</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                                <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 0h-12m12 0h2.25m-14.25 0h2.25" />
                                </svg>
                                <span className="text-[10px] uppercase tracking-wide text-charcoal/70">Ships Worldwide</span>
                            </div>
                        </div>

                </ProductDetailShell>
            </div>

            {/* You May Also Like */}
            {related.length > 0 && (
                <section className="border-t border-charcoal/10 bg-paper-alt py-16 sm:py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-wrap items-end justify-between gap-6">
                            <div>
                                <p className="eyebrow text-gold-text">You May Also Like</p>
                                <h2 className="mt-3 font-heading text-3xl font-bold text-charcoal sm:text-4xl">
                                    More from the Loom
                                </h2>
                            </div>
                            <Link
                                href={primaryCollection ? `/collections/${primaryCollection.handle}` : "/shop"}
                                className="font-accent inline-flex min-h-11 items-center gap-2 border border-gold/40 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-text transition-colors hover:bg-gold/10"
                            >
                                {primaryCollection ? `All ${primaryCollection.title}` : "Shop all"}
                                <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
                            {related.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                        <div className="mt-10 flex justify-center">
                            <Link
                                href="/shop"
                                className="font-accent inline-flex min-h-11 items-center gap-2 bg-gold px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal transition-colors hover:bg-gold-dark"
                            >
                                Explore the full collection
                                <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}
