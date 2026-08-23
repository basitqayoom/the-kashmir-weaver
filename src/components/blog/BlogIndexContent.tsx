import Image from "next/image";
import Link from "next/link";
import type { JournalArticle } from "@/lib/shopify/journal";
import {
  articleCategory,
  articleCategoryColor,
  estimateReadTime,
} from "@/lib/journal-display";
import type { JournalPageInfo } from "@/lib/journal-page";
import { journalLandingPath, journalPageHref } from "@/lib/journal-page";
import EditorialCTA from "@/components/EditorialCTA";

type BlogIndexContentProps = {
  articles: JournalArticle[];
  pageInfo: JournalPageInfo;
  basePath?: string;
  title: string;
  description: string;
  eyebrow?: string;
  showFeatured?: boolean;
  emptyMessage?: string;
};

export default function BlogIndexContent({
  articles,
  pageInfo,
  basePath = "/blog",
  title,
  description,
  eyebrow = "The Kashmir Weaver",
  showFeatured = true,
  emptyMessage = "No stories published yet.",
}: BlogIndexContentProps) {
  const featured =
    showFeatured && pageInfo.currentPage === 1 ? articles[0] : undefined;
  const rest = featured ? articles.slice(1) : articles;

  return (
    <main id="main-content" className="bg-ivory bg-linen">
      <section className="bg-paper-alt pb-16 pt-28 sm:pt-32">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-text">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold text-charcoal sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-charcoal/70 sm:text-lg">
            {description}
          </p>
        </div>
      </section>

      {articles.length === 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="text-charcoal/70">{emptyMessage}</p>
          {pageInfo.totalPosts > 0 ? (
            <Link
              href="/blog"
              className="font-accent mt-6 inline-flex items-center gap-2 rounded-full border border-charcoal/15 px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-charcoal transition-colors hover:border-gold/40 hover:text-gold-text"
            >
              ← Latest stories
            </Link>
          ) : null}
        </section>
      ) : null}

      {featured ? (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="group overflow-hidden rounded-2xl border border-gold/15 bg-white shadow-sm transition-shadow hover:shadow-lg">
            <div className="grid lg:grid-cols-2">
              <Link
                href={`/blog/${featured.handle}`}
                aria-hidden="true"
                tabIndex={-1}
                className="relative block aspect-[4/3] overflow-hidden lg:aspect-auto"
              >
                {featured.image ? (
                  <Image
                    src={featured.image.url}
                    alt={featured.image.altText ?? featured.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </Link>
              <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
                <Link
                  href={journalLandingPath("category", articleCategory(featured.tags))}
                  className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-bold transition-opacity hover:opacity-80 ${articleCategoryColor(featured.tags)}`}
                >
                  {articleCategory(featured.tags)}
                </Link>
                <Link href={`/blog/${featured.handle}`} className="contents">
                  <h2 className="mt-4 font-heading text-2xl font-bold text-charcoal transition-colors group-hover:text-burgundy sm:text-3xl">
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal/70 sm:text-base">
                    {featured.excerpt}
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <span className="text-sm font-semibold text-gold-text">
                      Read Article →
                    </span>
                    <span className="text-xs text-charcoal/70">
                      {estimateReadTime(featured.contentHtml)}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {rest.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <div
                key={article.handle}
                className="group overflow-hidden rounded-xl border border-gold/10 bg-white shadow-sm transition-all hover:border-gold/25 hover:shadow-md"
              >
                {article.image ? (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Link
                      href={`/blog/${article.handle}`}
                      aria-hidden="true"
                      tabIndex={-1}
                      className="absolute inset-0 z-0 block"
                    >
                      <Image
                        src={article.image.url}
                        alt={article.image.altText ?? article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </Link>
                    <Link
                      href={journalLandingPath("category", articleCategory(article.tags))}
                      className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-bold transition-opacity hover:opacity-80 ${articleCategoryColor(article.tags)}`}
                    >
                      {articleCategory(article.tags)}
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-charcoal/5 px-5 pt-5">
                    <Link
                      href={journalLandingPath("category", articleCategory(article.tags))}
                      className={`rounded-full px-3 py-1 text-xs font-bold transition-opacity hover:opacity-80 ${articleCategoryColor(article.tags)}`}
                    >
                      {articleCategory(article.tags)}
                    </Link>
                  </div>
                )}
                <Link href={`/blog/${article.handle}`} className="block p-5">
                  {featured ? (
                    <h3 className="font-heading text-base font-bold leading-snug text-charcoal transition-colors group-hover:text-burgundy sm:text-lg">
                      {article.title}
                    </h3>
                  ) : (
                    <h2 className="font-heading text-base font-bold leading-snug text-charcoal transition-colors group-hover:text-burgundy sm:text-lg">
                      {article.title}
                    </h2>
                  )}
                  <p className="mt-2 line-clamp-2 text-sm text-charcoal/70">
                    {article.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gold-text">
                      Read Article →
                    </span>
                    <span className="text-xs text-charcoal/70">
                      {estimateReadTime(article.contentHtml)}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {pageInfo.totalPages > 1 ? (
        <nav
          className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 pb-12 sm:flex-row sm:px-6 lg:px-8"
          aria-label="Blog pagination"
        >
          {pageInfo.hasPreviousPage ? (
            <Link
              href={journalPageHref(basePath, pageInfo.currentPage - 1)}
              rel="prev"
              className="font-accent inline-flex min-h-11 items-center gap-2 rounded-full border border-charcoal/15 px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-charcoal transition-colors hover:border-gold/40 hover:text-gold-text"
            >
              ← Previous
            </Link>
          ) : (
            <span className="invisible inline-flex min-h-11 items-center gap-2 px-6 py-3" aria-hidden>
              ← Previous
            </span>
          )}

          <span className="text-sm tabular-nums text-charcoal/70">
            Page {pageInfo.currentPage} of {pageInfo.totalPages}
          </span>

          {pageInfo.hasNextPage ? (
            <Link
              href={journalPageHref(basePath, pageInfo.currentPage + 1)}
              rel="next"
              className="font-accent inline-flex min-h-11 items-center gap-2 rounded-full border border-charcoal/15 px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-charcoal transition-colors hover:border-gold/40 hover:text-gold-text"
            >
              Next →
            </Link>
          ) : (
            <span className="invisible inline-flex min-h-11 items-center gap-2 px-6 py-3" aria-hidden>
              Next →
            </span>
          )}
        </nav>
      ) : null}

      <EditorialCTA />
    </main>
  );
}
