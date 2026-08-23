"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useHorizontalSwipe } from "@/hooks/use-horizontal-swipe";
import type { ProductCard as ProductCardType } from "@/lib/shopify/types";

const TILE_CAROUSEL_MS = 1400;
const MAX_DOT_INDICATORS = 5;

function TileImageIndicator({ active, total }: { active: number; total: number }) {
  if (total <= MAX_DOT_INDICATORS) {
    return (
      <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
              i === active ? "bg-gold" : "bg-ivory/45"
            }`}
          />
        ))}
      </div>
    );
  }

  const progress = total > 1 ? ((active + 1) / total) * 100 : 100;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center gap-2 px-4">
      <span className="rounded-full bg-charcoal/60 px-2.5 py-0.5 font-accent text-[0.65rem] tracking-[0.2em] text-ivory backdrop-blur-sm">
        {active + 1} / {total}
      </span>
      <div
        className="h-0.5 w-[min(72%,7rem)] overflow-hidden rounded-full bg-ivory/25"
        role="progressbar"
        aria-valuenow={active + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Image ${active + 1} of ${total}`}
      >
        <span
          className="block h-full rounded-full bg-gold transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function ProductCard({
  product,
  priority = false,
  disableSwipe = false,
}: {
  product: ProductCardType;
  priority?: boolean;
  disableSwipe?: boolean;
}) {
  const images = product.images.nodes.length
    ? product.images.nodes
    : product.featuredImage
      ? [product.featuredImage]
      : [];
  const imageCount = images.length;
  const multiImage = imageCount > 1;
  const soldOut = product.availableForSale === false;

  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(0);
  const [loadExtras, setLoadExtras] = useState(false);

  const goNext = useCallback(() => {
    setLoadExtras(true);
    setActive((i) => (i + 1) % imageCount);
  }, [imageCount]);

  const goPrev = useCallback(() => {
    setLoadExtras(true);
    setActive((i) => (i - 1 + imageCount) % imageCount);
  }, [imageCount]);

  const tileSwipe = useHorizontalSwipe({
    onSwipeLeft: goNext,
    onSwipeRight: goPrev,
    enabled: multiImage && !disableSwipe,
    containSwipe: true,
  });

  const displayIndex = loadExtras ? active : 0;
  const imagesToRender = loadExtras && multiImage ? images : images.slice(0, 1);
  const showIndicator = multiImage && loadExtras;

  useEffect(() => {
    if (!hover || !multiImage) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % imageCount);
    }, TILE_CAROUSEL_MS);
    return () => window.clearInterval(id);
  }, [hover, multiImage, imageCount]);

  const handlePointerEnter = () => {
    setHover(true);
    if (multiImage) setLoadExtras(true);
  };

  const resetCarousel = () => {
    setHover(false);
    setActive(0);
    setLoadExtras(false);
  };

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block overflow-hidden border border-charcoal/10 bg-ivory transition-colors hover:border-gold/30"
      onMouseEnter={handlePointerEnter}
      onFocus={handlePointerEnter}
      onMouseLeave={resetCarousel}
      onBlur={resetCarousel}
    >
      <div
        className={`relative aspect-4/5 overflow-hidden bg-paper-alt ${
          disableSwipe ? "" : "touch-pan-y"
        }`}
        {...tileSwipe}
      >
        {soldOut && (
          <span className="font-accent absolute left-2 top-2 z-10 bg-charcoal/80 px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-ivory">
            Sold Out
          </span>
        )}
        {imagesToRender.length > 0 ? (
          imagesToRender.map((img, i) => (
            <div
              key={img.url}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${
                i === displayIndex
                  ? "z-[1] opacity-100"
                  : "pointer-events-none z-0 opacity-0"
              }`}
              aria-hidden={i !== displayIndex}
            >
              <Image
                src={img.url}
                alt={img.altText ?? product.title}
                fill
                priority={priority && i === 0}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover ${soldOut ? "grayscale-[0.6]" : ""} ${
                  !loadExtras && i === 0 ? "group-hover:scale-105" : ""
                } transition-transform duration-500`}
              />
            </div>
          ))
        ) : (
          <div className="flex h-full w-full items-center justify-center text-charcoal/70">
            <span className="font-accent text-[10px] uppercase tracking-[0.2em]">
              No Image
            </span>
          </div>
        )}
        {showIndicator ? (
          <TileImageIndicator active={active} total={imageCount} />
        ) : null}
      </div>
      <div className="p-5">
        <p className="font-accent text-[9px] uppercase tracking-[0.2em] text-charcoal/70">
          {product.productType || product.vendor}
        </p>
        <h2 className="mt-1.5 font-heading text-base font-semibold text-charcoal transition-colors group-hover:text-gold-text">
          {product.title}
        </h2>
      </div>
    </Link>
  );
}
