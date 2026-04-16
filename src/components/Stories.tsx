"use client";

import Image from "next/image";
import Link from "next/link";
import { articles } from "@/data/articles";
import { useImageModal } from "./ImageModal";

export default function Stories() {
  const { open } = useImageModal();
  const featured = articles[0];
  const grid = articles.slice(1, 7);

  return (
    <section id="stories" className="bg-ivory bg-linen py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center">
          <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold">
            The Pure Kashmir Journal
          </p>
          <h2 className="mt-4 font-heading text-3xl font-bold text-charcoal sm:text-4xl lg:text-5xl">
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
          href={`/blog/${featured.slug}`}
          className="reveal group mt-12 block overflow-hidden rounded-2xl border border-gold/15 bg-white shadow-sm transition-shadow hover:shadow-lg"
        >
          <div className="grid lg:grid-cols-2">
            <div
              className="relative aspect-[4/3] cursor-pointer overflow-hidden lg:aspect-auto"
              onClick={(e) => { e.preventDefault(); open(featured.image, featured.title); }}
            >
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
              <h3 className="mt-4 font-heading text-2xl font-bold text-charcoal transition-colors group-hover:text-burgundy sm:text-3xl">
                {featured.title}
              </h3>
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

        {/* Article grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {grid.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="reveal group overflow-hidden rounded-xl border border-gold/10 bg-white shadow-sm transition-all hover:border-gold/25 hover:shadow-md"
            >
              <div
                className="relative aspect-[16/10] cursor-pointer overflow-hidden"
                onClick={(e) => { e.preventDefault(); open(article.image, article.title); }}
              >
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

        {/* View all link */}
        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border-2 border-gold/30 px-8 py-3 text-sm font-semibold text-charcoal transition-all hover:border-gold hover:bg-gold/5"
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
