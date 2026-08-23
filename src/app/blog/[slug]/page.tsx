import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllJournalArticles,
  getJournalArticleByHandle,
} from "@/lib/shopify/journal";
import {
  articleCategory,
  articleCategoryColor,
  estimateReadTime,
  formatArticleDate,
} from "@/lib/journal-display";
import { relatedArticlesByTags } from "@/lib/journal-related";
import { loadFeaturedProducts } from "@/lib/homepage-featured";
import { LEGAL_HTML_CLASS } from "@/lib/shopify/legal-html-class";
import FeaturedProducts from "@/components/shop/FeaturedProducts";
import { siteConfig, whatsappLink } from "@/config/site";
import { seoBundle } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = await getAllJournalArticles();
  return articles.map((article) => ({ slug: article.handle }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getJournalArticleByHandle(slug);
  if (!article) return { title: "Article Not Found" };
  return seoBundle({
    title: article.title,
    description: article.excerpt ?? undefined,
    pathname: `/blog/${slug}`,
    image: article.image?.url,
    type: "article",
    publishedTime: new Date(article.publishedAt).toISOString(),
    authors: [article.author],
  });
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const [article, allArticles, featuredProducts] = await Promise.all([
    getJournalArticleByHandle(slug),
    getAllJournalArticles(),
    loadFeaturedProducts().catch(() => []),
  ]);
  if (!article) notFound();

  const related = relatedArticlesByTags(article, allArticles, 3);
  const publishedIso = new Date(article.publishedAt).toISOString();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt ?? undefined,
    ...(article.image ? { image: article.image.url } : {}),
    datePublished: publishedIso,
    dateModified: publishedIso,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${slug}`,
    },
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/images/logo/logo-green-bg.png`,
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Stories", item: `${siteConfig.url}/blog` },
      { "@type": "ListItem", position: 3, name: article.title },
    ],
  };

  return (
    <main id="main-content" className="bg-ivory bg-linen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <section className="relative bg-paper-alt pb-20 pt-24 sm:pb-24 sm:pt-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-charcoal/70 transition-colors hover:text-gold"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to Stories
          </Link>
          <div className="mt-8">
            <span
              className={`inline-block rounded-full px-4 py-1.5 text-xs font-bold ${articleCategoryColor(article.tags)}`}
            >
              {articleCategory(article.tags)}
            </span>
          </div>
          <h1 className="mt-5 font-heading text-3xl font-bold leading-tight text-charcoal sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>
          <div className="mt-5 flex items-center gap-4 text-sm text-charcoal/70">
            <time dateTime={publishedIso.split("T")[0]}>
              {formatArticleDate(article.publishedAt)}
            </time>
            <span className="text-gold/40">·</span>
            <span>{estimateReadTime(article.contentHtml)}</span>
          </div>
        </div>
      </section>

      {article.image && (
        <section className="mx-auto -mt-10 max-w-4xl px-4 sm:-mt-14 sm:px-6 lg:px-8">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-gold/10">
            <Image
              src={article.image.url}
              alt={article.image.altText ?? article.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 900px"
              priority
            />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <article
          className={LEGAL_HTML_CLASS}
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />

        <FeaturedProducts products={featuredProducts.slice(0, 4)} />

        <div className="mt-12 rounded-2xl bg-charcoal p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">
            Explore Our Collection
          </p>
          <p className="mt-3 font-heading text-xl font-bold text-ivory sm:text-2xl">
            Ready to own a piece of this heritage?
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-charcoal transition-all hover:scale-105"
            >
              Shop the Collection
            </Link>
            <a
              href={whatsappLink(siteConfig.whatsappMessages.blog)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-ivory/30 px-6 py-2.5 text-sm font-semibold text-ivory transition-all hover:border-ivory/50"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-gold/10 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-heading text-2xl font-bold text-charcoal">
              Continue Reading
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {related.map((a) => (
                <Link
                  key={a.handle}
                  href={`/blog/${a.handle}`}
                  className="group overflow-hidden rounded-xl border border-gold/10 bg-white shadow-sm transition-all hover:border-gold/25 hover:shadow-md"
                >
                  {a.image && (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={a.image.url}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-heading text-sm font-bold leading-snug text-charcoal transition-colors group-hover:text-burgundy">
                      {a.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
