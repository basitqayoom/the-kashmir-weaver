import Image from "next/image";
import Link from "next/link";
import { articles } from "@/data/articles";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stories from the Valley",
  description:
    "The history, craft, and culture of Kashmiri Pashmina — written for those who want to understand what they are buying, and why it matters.",
  openGraph: {
    title: "Stories from the Valley",
    description:
      "The history, craft, and culture of Kashmiri Pashmina — heritage, craft guides, and style inspiration.",
    type: "website",
  },
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <main className="bg-ivory bg-linen">
      {/* Header */}
      <section className="bg-charcoal pb-16 pt-28 sm:pt-32">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            The Pure Kashmir Journal
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold text-ivory sm:text-5xl lg:text-6xl">
            Stories from the Valley
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ivory/70 sm:text-lg">
            The history, craft, and culture of Kashmiri Pashmina — written for
            those who want to understand what they are buying, and why it
            matters.
          </p>
        </div>
      </section>

      {/* Featured article */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href={`/blog/${featured.slug}`}
          className="group block overflow-hidden rounded-2xl border border-gold/15 bg-white shadow-sm transition-shadow hover:shadow-lg"
        >
          <div className="grid lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto">
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
              <span
                className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-bold text-white ${featured.categoryColor}`}
              >
                {featured.category}
              </span>
              <h2 className="mt-4 font-heading text-2xl font-bold text-charcoal transition-colors group-hover:text-burgundy sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70 sm:text-base">
                {featured.excerpt}
              </p>
              <div className="mt-6 flex items-center gap-4">
                <span className="text-sm font-semibold text-gold">
                  Read Article →
                </span>
                <span className="text-xs text-charcoal/60">
                  {featured.readTime}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Articles grid */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group overflow-hidden rounded-xl border border-gold/10 bg-white shadow-sm transition-all hover:border-gold/25 hover:shadow-md"
            >
              {article.image ? (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <span
                    className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white ${article.categoryColor}`}
                  >
                    {article.category}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-charcoal/5 px-5 pt-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold text-white ${article.categoryColor}`}
                  >
                    {article.category}
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
                  <span className="text-sm font-semibold text-gold">
                    Read Article →
                  </span>
                    <span className="text-xs text-charcoal/60">
                    {article.readTime}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
