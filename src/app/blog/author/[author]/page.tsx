import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllJournalArticles } from "@/lib/shopify/journal";
import {
  filterJournalArticles,
  getJournalArticlesPage,
  journalLandingPath,
  parseJournalPageParam,
} from "@/lib/journal-page";
import BlogIndexContent from "@/components/blog/BlogIndexContent";
import { seoBundle } from "@/lib/seo";

type PageProps = {
  params: Promise<{ author: string }>;
  searchParams: Promise<{ page?: string }>;
};

function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { author } = await params;
  const label = decodeParam(author);
  const pathname = journalLandingPath("author", label);
  return seoBundle({
    title: `${label} — Stories from the Valley`,
    description: `Journal stories by ${label} — heritage, craft, and culture of Kashmiri Pashmina.`,
    pathname,
  });
}

export default async function BlogAuthorPage({
  params,
  searchParams,
}: PageProps) {
  const { author } = await params;
  const { page: pageParam } = await searchParams;
  const label = decodeParam(author);
  const page = parseJournalPageParam(pageParam);
  const allArticles = await getAllJournalArticles();
  const matching = filterJournalArticles(allArticles, "author", label);
  if (matching.length === 0) notFound();

  const { articles, pageInfo } = getJournalArticlesPage(allArticles, {
    page,
    kind: "author",
    param: label,
  });
  const basePath = journalLandingPath("author", label);

  return (
    <BlogIndexContent
      articles={articles}
      pageInfo={pageInfo}
      basePath={basePath}
      eyebrow="Author"
      title={label}
      description={`Stories written by ${label} — from the journal of The Kashmir Weaver.`}
      showFeatured={false}
      emptyMessage={`No stories by ${label} yet.`}
    />
  );
}
