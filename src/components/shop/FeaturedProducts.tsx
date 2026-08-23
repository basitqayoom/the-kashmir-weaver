import ProductCard from "@/components/shop/ProductCard";
import type { ProductCard as ProductCardType } from "@/lib/shopify/types";

export default function FeaturedProducts({
  products,
  title = "Featured Pieces",
}: {
  products: ProductCardType[];
  title?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-charcoal/10 pt-12">
      <p className="font-accent text-[10px] uppercase tracking-[0.25em] text-gold-text">
        From the atelier
      </p>
      <h2 className="mt-2 font-heading text-2xl font-bold text-charcoal sm:text-3xl">
        {title}
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index < 2} />
        ))}
      </div>
    </section>
  );
}
