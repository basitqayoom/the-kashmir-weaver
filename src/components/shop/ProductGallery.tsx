"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useImageModal } from "@/components/ImageModal";
import type { StorefrontImage } from "@/lib/shopify/types";
import type { Shade } from "@/lib/shopify/shades";
import SolidRecolorCanvas from "./SolidRecolorCanvas";
import ShadeSwatch from "./ShadeSwatch";

// Avoids a visible-then-reset flash from a same-tick setState in a plain effect.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function ProductGallery({
    images,
    title,
    colourPreview,
    requestMoreImagesUrl,
}: {
    images: StorefrontImage[];
    title: string;
    /** When set (Colour Studio products), first carousel slide is a live recolor preview. */
    colourPreview?: Shade | null;
    /** WhatsApp or concierge link when product metafield requests more photos. */
    requestMoreImagesUrl?: string;
}) {
    const hasColourSlide = Boolean(colourPreview);
    const slideCount = images.length + (hasColourSlide ? 1 : 0);
    const [index, setIndex] = useState(0);
    const [zoomed, setZoomed] = useState(false);
    const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
    const touchStartX = useRef<number | null>(null);
    const { open } = useImageModal();
    const liveRef = useRef<HTMLSpanElement>(null);

    // When the selected shade changes, show that colour in the carousel.
    useIsomorphicLayoutEffect(() => {
        if (!colourPreview) return;
        setIndex(0);
        setZoomed(false);
        liveRef.current?.replaceChildren(
            document.createTextNode(
                `Colour preview: ${colourPreview.code} · ${colourPreview.family}`,
            ),
        );
    }, [colourPreview?.code, colourPreview?.hex]);

    if (slideCount === 0) {
        return <div className="aspect-4/5 bg-paper-alt" />;
    }

    const showingColour = hasColourSlide && index === 0;
    const photoIndex = hasColourSlide ? index - 1 : index;
    const active = showingColour ? null : images[photoIndex];
    const aspectRatio =
        active?.width && active.height && active.height > 0
            ? `${active.width} / ${active.height}`
            : "4 / 5";

    const goTo = (next: number) => {
        setZoomed(false);
        const nextIndex = ((next % slideCount) + slideCount) % slideCount;
        setIndex(nextIndex);
        if (hasColourSlide && nextIndex === 0 && colourPreview) {
            liveRef.current?.replaceChildren(
                document.createTextNode(
                    `Colour preview: ${colourPreview.code} · ${colourPreview.family}`,
                ),
            );
        } else {
            const photoN = hasColourSlide ? nextIndex : nextIndex + 1;
            liveRef.current?.replaceChildren(
                document.createTextNode(`Image ${photoN} of ${images.length}`),
            );
        }
    };

    function onTouchStart(e: React.TouchEvent) {
        touchStartX.current = e.touches[0]?.clientX ?? null;
    }

    function onTouchEnd(e: React.TouchEvent) {
        if (touchStartX.current === null || slideCount < 2) return;
        const deltaX = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
        if (Math.abs(deltaX) > 40) goTo(index + (deltaX < 0 ? 1 : -1));
        touchStartX.current = null;
    }

    return (
        <div>
            <span ref={liveRef} className="sr-only" aria-live="polite" aria-atomic="true" />
            <div
                className="group relative w-full max-h-[85dvh] select-none overflow-hidden bg-paper-alt"
                style={{ aspectRatio }}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                onKeyDown={(e) => {
                    if (slideCount < 2) return;
                    if (e.key === "ArrowLeft") goTo(index - 1);
                    if (e.key === "ArrowRight") goTo(index + 1);
                }}
                tabIndex={0}
                role="group"
                aria-roledescription="carousel"
                aria-label={`${title} images`}
            >
                {showingColour && colourPreview ? (
                    <div className="relative h-full w-full">
                        <SolidRecolorCanvas
                            hex={colourPreview.hex}
                            fit="contain"
                            className="absolute inset-0 h-full w-full"
                            alt={`${title} previewed in ${colourPreview.family}`}
                        />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-charcoal/50 to-transparent px-4 pb-10 pt-16">
                            <p className="font-accent text-center text-[10px] uppercase tracking-[0.2em] text-ivory">
                                {colourPreview.code} · {colourPreview.family}
                            </p>
                        </div>
                    </div>
                ) : active ? (
                    <button
                        type="button"
                        onClick={() =>
                            setZoomed((z) => {
                                if (z) return false;
                                setZoomOrigin({ x: 50, y: 50 });
                                return true;
                            })
                        }
                        onMouseMove={(e) => {
                            if (!zoomed) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            setZoomOrigin({
                                x: ((e.clientX - rect.left) / rect.width) * 100,
                                y: ((e.clientY - rect.top) / rect.height) * 100,
                            });
                        }}
                        className={`relative block h-full w-full overflow-hidden ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
                        aria-label={zoomed ? "Zoom out" : "Zoom in"}
                    >
                        <Image
                            src={active.url}
                            alt={active.altText ?? title}
                            fill
                            priority
                            className={`object-contain transition-transform duration-300 ease-out ${zoomed ? "" : "sm:object-cover"}`}
                            style={
                                zoomed
                                    ? { transform: "scale(2.2)", transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` }
                                    : undefined
                            }
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                    </button>
                ) : null}

                {!showingColour && active ? (
                    <button
                        type="button"
                        onClick={() => open(active.url, active.altText ?? title)}
                        className="absolute right-3 top-3 flex h-11 w-11 min-h-11 min-w-11 items-center justify-center bg-ivory/85 text-charcoal opacity-100 backdrop-blur-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label="Open full-screen view"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 8.25V6a2.25 2.25 0 012.25-2.25h2.25M15.75 3.75H18A2.25 2.25 0 0120.25 6v2.25m0 7.5V18A2.25 2.25 0 0118 20.25h-2.25m-7.5 0H6A2.25 2.25 0 013.75 18v-2.25" />
                        </svg>
                    </button>
                ) : null}

                {slideCount > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => goTo(index - 1)}
                            aria-label="Previous image"
                            className="absolute left-2 top-1/2 flex h-11 w-11 min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-charcoal opacity-100 shadow-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            onClick={() => goTo(index + 1)}
                            aria-label="Next image"
                            className="absolute right-2 top-1/2 flex h-11 w-11 min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-charcoal opacity-100 shadow-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                        >
                            ›
                        </button>
                        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-charcoal/60 px-2.5 py-1 text-[10px] tracking-widest text-ivory backdrop-blur-sm">
                            {index + 1} / {slideCount}
                        </span>
                    </>
                )}
            </div>

            {requestMoreImagesUrl && (
                <p className="mt-3 text-center text-xs text-charcoal/70">
                    Need more angles?{" "}
                    <Link href={requestMoreImagesUrl} className="text-gold-text underline underline-offset-2">
                        Request additional photos
                    </Link>
                </p>
            )}

            {slideCount > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                    {hasColourSlide && colourPreview ? (
                        <button
                            type="button"
                            onClick={() => goTo(0)}
                            className={`relative aspect-square w-16 shrink-0 overflow-hidden bg-paper-alt transition-all sm:w-20 ${
                                index === 0 ? "ring-2 ring-gold" : "opacity-70 hover:opacity-100"
                            }`}
                            aria-label={`View colour preview ${colourPreview.code}`}
                            aria-pressed={index === 0}
                        >
                            <span className="absolute inset-0 flex items-center justify-center bg-paper-alt">
                                <ShadeSwatch
                                    hex={colourPreview.hex}
                                    size="lg"
                                    label={`${colourPreview.code} · ${colourPreview.family}`}
                                />
                            </span>
                        </button>
                    ) : null}
                    {images.map((img, i) => {
                        const slideIndex = hasColourSlide ? i + 1 : i;
                        return (
                            <button
                                key={`${img.url}-${i}`}
                                type="button"
                                onClick={() => goTo(slideIndex)}
                                className={`relative aspect-square w-16 shrink-0 overflow-hidden bg-paper-alt transition-all sm:w-20 ${
                                    slideIndex === index ? "ring-2 ring-gold" : "opacity-70 hover:opacity-100"
                                }`}
                                aria-label={`View image ${i + 1}`}
                                aria-pressed={slideIndex === index}
                            >
                                <Image
                                    src={img.url}
                                    alt={img.altText ?? title}
                                    fill
                                    className="object-cover"
                                    sizes="120px"
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
