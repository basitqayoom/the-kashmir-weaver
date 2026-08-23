import Image from "next/image";
import Link from "next/link";
import { getJournalArticles } from "@/lib/shopify/journal";
import { articleCategory, articleCategoryColor, estimateReadTime } from "@/lib/journal-display";

export default async function Stories() {
  const articles = await getJournalArticles(4);
  const featured = articles[0];
  const grid = articles.slice(1, 4);

  if (!featured) return null;

  return (
    <section id="stories" className="bg-ivory bg-linen py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center">
          <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
            The Kashmir Weaver
          </p>
          <h2 className="mt-4 font-heading text-4xl font-bold text-charcoal sm:text-5xl lg:text-6xl">
            Stories from the Valley
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-charcoal/70 sm:text-lg">
            The history, craft, and culture of Kashmiri Pashmina — written for
            those who want to understand what they are buying, and why it
            matters.
          </p>
        </div>

        {/* Featured article */}
        <Link
          href={`/blog/${featured.handle}`}
          className="reveal group mt-12 block overflow-hidden border border-gold/15 bg-white transition-colors hover:border-gold/30"
        >
          <div className="grid lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto">
              {featured.image && (
                <Image
                  src={featured.image.url}
                  alt={featured.image.altText ?? featured.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
              <span
                className={`inline-block w-fit px-3 py-1 text-xs font-bold ${articleCategoryColor(featured.tags)}`}
              >
                {articleCategory(featured.tags)}
              </span>
              <h3 className="mt-4 font-heading text-2xl font-bold text-charcoal transition-colors group-hover:text-burgundy sm:text-3xl">
                {featured.title}
              </h3>
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
            </div>
          </div>
        </Link>

        {/* Article grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {grid.map((article) => (
            <Link
              key={article.handle}
              href={`/blog/${article.handle}`}
              className="reveal group overflow-hidden border border-gold/10 bg-white transition-colors hover:border-gold/25"
            >
              {article.image ? (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={article.image.url}
                    alt={article.image.altText ?? article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <span
                    className={`absolute left-3 top-3 px-3 py-1 text-xs font-bold ${articleCategoryColor(article.tags)}`}
                  >
                    {articleCategory(article.tags)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-charcoal/5 px-5 pt-5">
                  <span
                    className={`px-3 py-1 text-xs font-bold ${articleCategoryColor(article.tags)}`}
                  >
                    {articleCategory(article.tags)}
                  </span>
                </div>
              )}
              <div className="p-5">
                <h3 className="font-heading text-base font-bold leading-snug text-charcoal transition-colors group-hover:text-burgundy sm:text-lg">
                  {article.title}
                </h3>
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
              </div>
            </Link>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 border-2 border-gold/30 px-8 py-3 text-sm font-semibold text-charcoal transition-all hover:border-gold hover:bg-gold/5"
          >
            View All Articles
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
