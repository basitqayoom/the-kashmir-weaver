import { cache } from "react";
import { getCollections, getProducts } from "./products";

/** Cached catalog fetches — shared across SiteHeader renders per request. */
export const getCachedCollections = cache(() =>
  getCollections().catch(() => []),
);

export const getCachedFeaturedProducts = cache(() =>
  getProducts({ first: 6, sort: "featured" }).catch(() => null),
);
