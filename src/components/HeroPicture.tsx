import type { CSSProperties } from "react";
import type { HeroImageSet } from "@/lib/hero-image-urls";

export default function HeroPicture({
  jpg,
  jpgSmall,
  webp,
  webpSmall,
  avif,
  avifSmall,
  alt,
  className,
  style,
  sizes = "(min-width: 768px) 55vw, 100vw",
  width = 1536,
  height = 2048,
  loading = "eager",
  fetchPriority = "high",
}: HeroImageSet & {
  alt: string;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
  width?: number;
  height?: number;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
}) {
  const avifSrcSet = `${avifSmall} 800w, ${avif} 1536w`;
  const webpSrcSet = `${webpSmall} 800w, ${webp} 1536w`;
  const jpgSrcSet = `${jpgSmall} 800w, ${jpg} 1536w`;

  return (
    <picture>
      <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      <img
        src={jpg}
        srcSet={jpgSrcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        className={className}
        style={style}
        decoding="async"
      />
    </picture>
  );
}
