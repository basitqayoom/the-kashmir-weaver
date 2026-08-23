import { useEffect, useLayoutEffect, useState } from "react";
import {
  loadRecolorAssets,
  type RecolorAssets,
} from "@/lib/shade-recolor-engine";

// Avoids a visible-then-reset flash from a same-tick setState in a plain effect.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** The one generic model-photo asset set used to preview any of the 280 shades. */
export const RECOLOR_IMAGE_SET = {
  id: "0",
  grayscale: "/assets/solids-recolor/0/grayscale.png",
  mask: "/assets/solids-recolor/0/mask.png",
  original: "/assets/solids-recolor/0/original.png",
} as const;

const assetCache = new Map<string, RecolorAssets>();
let loadPromise: Promise<RecolorAssets> | null = null;

function loadAssets(): Promise<RecolorAssets> {
  const cached = assetCache.get(RECOLOR_IMAGE_SET.id);
  if (cached) return Promise.resolve(cached);
  if (loadPromise) return loadPromise;

  loadPromise = loadRecolorAssets(RECOLOR_IMAGE_SET).then((assets) => {
    assetCache.set(RECOLOR_IMAGE_SET.id, assets);
    return assets;
  });
  return loadPromise;
}

export function useRecolorAssets(enabled = true) {
  const [assets, setAssets] = useState<RecolorAssets | null>(
    () => assetCache.get(RECOLOR_IMAGE_SET.id) ?? null,
  );
  const [error, setError] = useState<Error | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!enabled) return;

    const cached = assetCache.get(RECOLOR_IMAGE_SET.id);
    if (cached) {
      setAssets(cached);
      setError(null);
      return;
    }

    let cancelled = false;
    loadAssets()
      .then((loaded) => {
        if (!cancelled) {
          setAssets(loaded);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { assets, error };
}

/** Warm the recolor assets ahead of time (e.g. on hover of the "Try new colours" CTA). */
export function prefetchRecolorAssets(): void {
  void loadAssets();
}
