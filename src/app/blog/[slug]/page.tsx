import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticleBySlug } from "@/data/articles";
import type { Metadata } from "next";
import { siteConfig, whatsappLink } from "@/config/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: new Date(article.date).toISOString(),
      authors: [siteConfig.name],
      ...(article.image ? { images: [{ url: article.image, alt: article.title }] } : {}),
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let inTable = false;
  let headerParsed = false;

  function flushTable(key: number) {
    if (tableRows.length === 0) return null;
    const header = tableRows[0];
    const body = tableRows.slice(1);
    return (
      <div key={key} className="my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gold/20">
              {header.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-2 text-left font-heading font-bold text-charcoal"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri} className="border-b border-charcoal/5">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-2 text-charcoal/70">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) {
        headerParsed = true;
        continue;
      }
      if (!inTable) {
        tableRows = [];
        inTable = true;
      }
      tableRows.push(cells);
      continue;
    }

    if (inTable) {
      elements.push(flushTable(i));
      tableRows = [];
      inTable = false;
      headerParsed = false;
    }

    if (trimmed === "") {
      continue;
    }
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          className="mb-3 mt-8 font-heading text-xl font-bold text-charcoal"
        >
          {trimmed.slice(4)}
        </h3>
      );
    } else if (trimmed.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="mb-4 mt-10 font-heading text-2xl font-bold text-charcoal sm:text-3xl"
        >
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      elements.push(
        <p key={i} className="my-3 text-sm font-semibold text-charcoal/80">
          {trimmed.slice(2, -2)}
        </p>
      );
    } else {
      const html = trimmed
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");
      elements.push(
        <p
          key={i}
          className="my-3 text-base leading-relaxed text-charcoal/75"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
  }

  if (inTable) {
    elements.push(flushTable(lines.length));
  }

  return <>{elements}</>;
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const currentIndex = articles.findIndex((a) => a.slug === slug);
  const related = articles.filter((_, i) => i !== currentIndex).slice(0, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    ...(article.image ? { image: article.image } : {}),
    datePublished: new Date(article.date).toISOString(),
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
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Stories",
        item: `${siteConfig.url}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
      },
    ],
  };

  return (
    <main className="bg-ivory bg-linen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Hero */}
      <section className="relative bg-charcoal pb-20 pt-24 sm:pb-24 sm:pt-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-ivory/70 transition-colors hover:text-gold"
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
              className={`inline-block rounded-full px-4 py-1.5 text-xs font-bold ${article.categoryColor}`}
            >
              {article.category}
            </span>
          </div>
          <h1 className="mt-5 font-heading text-3xl font-bold leading-tight text-ivory sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>
          <div className="mt-5 flex items-center gap-4 text-sm text-ivory/60">
            <time dateTime={new Date(article.date).toISOString().split("T")[0]}>{article.date}</time>
            <span className="text-gold/40">·</span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </section>

      {article.image && (
        <section className="mx-auto -mt-10 max-w-4xl px-4 sm:-mt-14 sm:px-6 lg:px-8">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-gold/10">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 900px"
              priority
            />
          </div>
        </section>
      )}

      {/* Article content */}
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <article className="prose-kashmir">
          <MarkdownContent content={article.content} />
        </article>

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-charcoal p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">
            Explore Our Collection
          </p>
          <p className="mt-3 font-heading text-xl font-bold text-ivory sm:text-2xl">
            Ready to own a piece of this heritage?
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-charcoal transition-all hover:scale-105"
            >
              Browse on Instagram
            </a>
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

      {/* Related articles */}
      <section className="border-t border-gold/10 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-2xl font-bold text-charcoal">
            Continue Reading
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {related.map((a) => (
              <Link
                key={a.slug}
                href={`/blog/${a.slug}`}
                className="group overflow-hidden rounded-xl border border-gold/10 bg-white shadow-sm transition-all hover:border-gold/25 hover:shadow-md"
              >
                {a.image && (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={a.image}
                      alt={a.title}
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
                  <span className="mt-2 block text-xs text-charcoal/70">
                    {a.readTime}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
