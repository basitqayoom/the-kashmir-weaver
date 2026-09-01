import Link from "next/link";
import {
  getCollections,
  getProductsPage,
} from "@/lib/shopify/products";
import ProductCard from "@/components/shop/ProductCard";
import type { Collection, ProductCard as ProductCardType } from "@/lib/shopify/types";
import {
  isSolidsCollectionHandle,
  orderProductsBySolidFamily,
} from "@/lib/shopify/solid-family-order";

const PREVIEW_COUNT = 4;
const EXCLUDED_HANDLES = new Set(["homepage-featured", "all"]);
const PREFERRED_SIGNATURE_HANDLES = ["kani", "sozni", "solids", "reversible"];

function pickSignatureCollections(collections: Collection[]): Collection[] {
  const byHandle = new Map(collections.map((c) => [c.handle, c]));
  const preferred = PREFERRED_SIGNATURE_HANDLES.map((handle) => byHandle.get(handle)).filter(
    (c): c is Collection => c != null,
  );
  if (preferred.length > 0) return preferred;

  return collections
    .filter((c) => !EXCLUDED_HANDLES.has(c.handle))
    .slice(0, 4);
}

async function getCollectionPreviewProducts(
  handle: string,
  count: number,
): Promise<ProductCardType[]> {
  const { products } = await getProductsPage({
    filters: { collections: [handle] },
    first: isSolidsCollectionHandle(handle) ? 40 : count,
    sort: "newest",
  });

  if (isSolidsCollectionHandle(handle)) {
    return orderProductsBySolidFamily(products, count);
  }

  return products.slice(0, count);
}

function CollectionBlock({
  collection,
  products,
  showDivider,
}: {
  collection: Collection;
  products: ProductCardType[];
  showDivider: boolean;
}) {
  if (products.length === 0) return null;

  const nameParts = collection.title.split(" ");
  const firstName = nameParts[0];
  const restName = nameParts.slice(1).join(" ");

  return (
    <div>
      {showDivider && (
        <div
          className="mx-auto mb-16 max-w-7xl border-t border-charcoal/10 sm:mb-20"
          aria-hidden="true"
        />
      )}
      <div>
        <h3 className="font-heading text-2xl font-bold text-charcoal sm:text-3xl md:text-4xl">
          {firstName}{" "}
          {restName ? <span className="italic font-normal">{restName}</span> : null}
        </h3>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-12 flex justify-center md:mt-16">
          <Link
            href={`/collections/${collection.handle}`}
            className="font-accent inline-flex w-full items-center justify-center gap-3 bg-gold px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal transition hover:bg-gold-dark sm:w-auto"
          >
            View all <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function HomeShopSection() {
  const collections = await getCollections().catch(() => []);
  const signatureCollections = pickSignatureCollections(collections);

  if (signatureCollections.length === 0) return null;

  const previews = await Promise.all(
    signatureCollections.map((collection) =>
      getCollectionPreviewProducts(collection.handle, PREVIEW_COUNT),
    ),
  );

  const blocks = signatureCollections
    .map((collection, i) => ({
      collection,
      products: previews[i] ?? [],
    }))
    .filter((block) => block.products.length > 0);

  if (blocks.length === 0) return null;

  return (
    <section className="reveal bg-ivory pt-0 pb-20 sm:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl font-bold text-charcoal sm:text-4xl md:text-5xl">
          Shop By <span className="italic font-normal">Category</span>
        </h2>
        <div className="mt-10 flex flex-col gap-16 sm:mt-12 sm:gap-20">
          {blocks.map(({ collection, products }, i) => (
            <CollectionBlock
              key={collection.handle}
              collection={collection}
              products={products}
              showDivider={i > 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

