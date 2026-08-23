import Link from "next/link";
import {
  bookChapterNumber,
  bookSectionLabel,
  type getBookIndexData,
} from "@/lib/book/registry";
import type { BookSection } from "@/lib/book/types";

type BookIndexProps = ReturnType<typeof getBookIndexData>;

export default function BookIndexView({
  meta,
  parts,
  frontMatter,
  wordCount,
}: BookIndexProps) {
  const sectionCount =
    frontMatter.length + parts.reduce((n, p) => n + p.sections.length, 0);

  return (
    <main id="main-content" className="bg-ivory">
      <section className="mx-auto max-w-[900px] px-6 pb-20 pt-8 md:px-10">
        <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
          Research Handbook
        </p>
        <h1
          className="mt-6 font-heading text-5xl font-light leading-[1.02] sm:text-6xl md:text-8xl"
        >
          The Kashmir Weaver
          <span className="block italic">Research Handbook</span>
        </h1>
        <p className="mt-8 font-heading text-xl italic leading-snug text-charcoal/70 md:text-2xl">
          {meta.subtitle}
        </p>
        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-charcoal/70">
          An in-depth research-based exploration of authentic Kashmiri pashmina —
          the fibre, its journey from the high Himalayas to the loom, the artisans
          who guard its traditions, and the knowledge that separates the genuine
          from the imitation.
        </p>
        <p className="mt-6 font-accent text-sm uppercase tracking-[0.2em] text-charcoal/70">
          {meta.edition} · {parts.length} parts · {sectionCount} sections ·{" "}
          {wordCount.toLocaleString()} words
        </p>
      </section>

      <div className="mx-auto max-w-[900px] px-6 md:px-10">
        <div className="h-px bg-[var(--hairline)]" />
      </div>

      <section className="mx-auto max-w-[900px] px-6 py-20 md:px-10">
        <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
          Contents
        </p>
        <h2 className="mt-6 font-heading text-4xl font-light leading-[1.05] md:text-6xl">
          The Book
        </h2>

        {frontMatter.length > 0 && (
          <div className="mt-12 space-y-3">
            {frontMatter.map((section) => (
              <TocRow key={section.slug} section={section} />
            ))}
          </div>
        )}

        <div className="mt-12 space-y-16">
          {parts.map((part) => (
            <div key={part.label}>
              <div className="flex items-baseline gap-4">
                <span className="font-accent text-sm uppercase tracking-[0.2em] text-charcoal/70">
                  {part.label}
                </span>
                <h3 className="font-heading text-2xl font-normal italic md:text-3xl">
                  {part.title}
                </h3>
              </div>
              <div className="mt-4 h-px bg-[var(--hairline)]" />
              <div className="mt-6 grid gap-x-10 gap-y-3 md:grid-cols-2">
                {part.sections.map((section) => (
                  <TocRow key={section.slug} section={section} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function TocRow({ section }: { section: BookSection }) {
  return (
    <Link
      href={`/book/${section.slug}`}
      className="group flex items-baseline justify-between gap-6 border-b border-[var(--hairline)] py-3 transition hover:border-gold"
    >
      <span className="flex min-w-0 items-baseline gap-4">
        <span className="shrink-0 font-accent text-sm uppercase tracking-[0.15em] text-charcoal/70">
          {section.kind === "part" ? "" : sectionLabel(section)}
        </span>
        <span className="line-clamp-2 font-heading text-xl transition group-hover:text-gold">
          {section.title}
        </span>
      </span>
      <span className="shrink-0 text-charcoal/70 transition group-hover:text-gold">
        →
      </span>
    </Link>
  );
}

function sectionLabel(section: BookSection): string {
  switch (section.kind) {
    case "chapter":
    case "soul":
      return `Ch. ${bookChapterNumber(section)}`;
    case "appendix":
      return `App. ${section.slug.replace("appendix-", "").toUpperCase()}`;
    default:
      return "";
  }
}

export { bookSectionLabel };
