import Link from "next/link";
import { bookSectionLabel } from "@/lib/book/registry";
import type { BookMeta, BookSection } from "@/lib/book/types";

export default function BookSectionView({
  meta,
  section,
  html,
  prev,
  next,
}: {
  meta: BookMeta;
  section: BookSection;
  html: string;
  prev: BookSection | null;
  next: BookSection | null;
}) {
  const label = bookSectionLabel(section);
  const partLabel =
    section.kind === "part"
      ? section.slug === "masters-of-kashmir"
        ? "Part IX"
        : "Part X"
      : label;

  return (
    <main id="main-content" className="bg-ivory">
      <section className="mx-auto max-w-[820px] px-6 pb-16 pt-10 md:px-10">
        <Link
          href="/book"
          className="inline-flex items-center gap-2 font-accent text-sm uppercase tracking-[0.15em] text-charcoal/70 transition hover:text-gold"
        >
          ← {meta.title}
        </Link>

        <div className="mt-10">
          <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
            {partLabel}
          </p>
          <h1 className="mt-6 max-w-2xl font-heading text-5xl font-light leading-[1.02] md:text-7xl">
            {section.title}
          </h1>
          {section.subtitle ? (
            <p className="mt-6 max-w-xl font-heading text-xl italic leading-snug text-charcoal/70 md:text-2xl">
              {section.subtitle}
            </p>
          ) : null}
        </div>
      </section>

      <article className="mx-auto max-w-[760px] px-6 pb-24 md:px-10">
        <div
          className="book-article-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <nav
          className="mt-24 grid gap-6 border-t border-[var(--hairline)] pt-10 md:grid-cols-2"
          aria-label="Book section pagination"
        >
          {prev ? (
            <Link
              href={`/book/${prev.slug}`}
              className="group inline-flex min-h-11 items-center gap-3 font-accent text-sm uppercase tracking-[0.12em] text-charcoal/70 transition hover:text-gold"
            >
              <span className="transition group-hover:-translate-x-1">←</span>
              <span className="min-w-0 normal-case">
                <span className="block text-xs">Previous</span>
                <span className="line-clamp-2 font-heading text-lg normal-case">
                  {bookSectionLabel(prev)} — {prev.title}
                </span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/book/${next.slug}`}
              className="group inline-flex min-h-11 items-center justify-end gap-3 text-charcoal transition hover:text-gold"
            >
              <span className="min-w-0 text-right normal-case">
                <span className="block font-accent text-xs uppercase tracking-[0.12em]">
                  Next
                </span>
                <span className="line-clamp-2 font-heading text-lg normal-case">
                  {bookSectionLabel(next)} — {next.title}
                </span>
              </span>
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </main>
  );
}
