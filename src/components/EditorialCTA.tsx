import Link from "next/link";

type EditorialCTAProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  href?: string;
  ctaLabel?: string;
};

export default function EditorialCTA({
  eyebrow = "The Collections",
  title = "Discover every piece",
  description = "Explore our complete range of hand-woven Kashmiri pashmina, each crafted by a single master artisan.",
  href = "/shop",
  ctaLabel = "Explore Collections",
}: EditorialCTAProps) {
  return (
    <section className="border-t border-charcoal/10 bg-ivory py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
          {eyebrow}
        </p>
        <h2 className="mt-4 font-heading text-3xl font-light text-charcoal sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-charcoal/70">
          {description}
        </p>
        <Link
          href={href}
          className="font-accent mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-10 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal transition-all hover:bg-gold-dark"
        >
          {ctaLabel}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
