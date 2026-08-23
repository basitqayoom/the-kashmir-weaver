"use client";

import { useEffect, useRef } from "react";
import { drawFitImage, renderRecolorPreviewCanvas } from "@/lib/shade-recolor-engine";
import { useRecolorAssets } from "@/hooks/use-recolor-assets";
import Spinner from "@/components/Spinner";

/** Canvas that recolors the shared model photo to preview a hex shade. */
export default function SolidRecolorCanvas({
    hex,
    fit = "cover",
    className,
    alt = "Solid pashmina colour preview",
}: {
    hex?: string | null;
    /** cover fills the frame (thumbnails); contain shows the full product (studio hero). */
    fit?: "cover" | "contain";
    className?: string;
    alt?: string;
}) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { assets, error } = useRecolorAssets(true);

    useEffect(() => {
        if (!assets || !wrapperRef.current || !canvasRef.current) return;

        const wrapper = wrapperRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const render = () => {
            const width = wrapper.clientWidth;
            const height = wrapper.clientHeight;
            if (width === 0 || height === 0) return;

            const dpr = window.devicePixelRatio || 1;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const preview = renderRecolorPreviewCanvas(assets, { hex, productOnly: true });
            drawFitImage(ctx, preview, assets.width, assets.height, width, height, fit);
        };

        render();
        const observer = new ResizeObserver(render);
        observer.observe(wrapper);
        return () => observer.disconnect();
    }, [assets, hex, fit]);

    if (error) {
        return <div className={className} style={{ background: "var(--surface)" }} role="img" aria-label={alt} />;
    }

    return (
        <div ref={wrapperRef} className={className} role="img" aria-label={alt}>
            <canvas ref={canvasRef} className="block h-full w-full" />
            {!assets && (
                <div className="absolute inset-0 flex items-center justify-center text-charcoal/40">
                    <Spinner size="lg" label="Loading colour preview" />
                </div>
            )}
        </div>
    );
}
