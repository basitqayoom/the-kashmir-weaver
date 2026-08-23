import Link from "next/link";
import Image from "next/image";
import type { Collection, ProductCard } from "@/lib/shopify/types";

export default function CollectionTile({
    collection,
    productCount,
    previewProducts = [],
    featured = false,
}: {
    collection: Collection;
    productCount?: number;
    previewProducts?: ProductCard[];
    featured?: boolean;
}) {
    const heroImage = collection.image ?? previewProducts[0]?.featuredImage ?? null;

    return (
        <Link
            href={`/collections/${collection.handle}`}
            className="group relative block w-full overflow-hidden bg-paper-alt"
        >
            <div className={`relative w-full ${featured ? "aspect-16/10" : "aspect-4/5"}`}>
                {heroImage && (
                    <Image
                        src={heroImage.url}
                        alt={heroImage.altText ?? collection.title}
                        fill
                        sizes={featured ? "100vw" : "(max-width: 640px) 100vw, 50vw"}
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-charcoal/80 via-charcoal/10 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <h2 className={`font-heading font-light text-ivory ${featured ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl"}`}>
                        {collection.title}
                    </h2>

                    {(productCount !== undefined || previewProducts.length > 0) && (
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            {productCount !== undefined && productCount > 0 && (
                                <span className="font-accent border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gold backdrop-blur-sm">
                                    {productCount} {productCount === 1 ? "piece" : "pieces"}
                                </span>
                            )}
                            {previewProducts.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                    {previewProducts.slice(0, 3).map((p) => (
                                        <span key={p.id} className="relative h-9 w-7 shrink-0 overflow-hidden border border-ivory/30">
                                            {p.featuredImage && (
                                                <Image src={p.featuredImage.url} alt="" fill sizes="28px" className="object-cover" />
                                            )}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <span className="font-accent mt-5 inline-flex items-center gap-2 border border-ivory/30 bg-charcoal/30 px-5 py-2 text-[10px] uppercase tracking-[0.2em] text-ivory backdrop-blur-sm transition-colors group-hover:border-gold group-hover:text-gold">
                        Explore Collection
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                        </svg>
                    </span>
                </div>
            </div>
        </Link>
    );
}
