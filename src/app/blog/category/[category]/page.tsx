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
  params: Promise<{ category: string }>;
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
  const { category } = await params;
  const label = decodeParam(category);
  const pathname = journalLandingPath("category", label);
  return seoBundle({
    title: `${label} — Stories from the Valley`,
    description: `Journal stories in the ${label} category — heritage, craft, and culture of Kashmiri Pashmina.`,
    pathname,
  });
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { category } = await params;
  const { page: pageParam } = await searchParams;
  const label = decodeParam(category);
  const page = parseJournalPageParam(pageParam);
  const allArticles = await getAllJournalArticles();
  const matching = filterJournalArticles(allArticles, "category", label);
  if (matching.length === 0) notFound();

  const { articles, pageInfo } = getJournalArticlesPage(allArticles, {
    page,
    kind: "category",
    param: label,
  });
  const basePath = journalLandingPath("category", label);

  return (
    <BlogIndexContent
      articles={articles}
      pageInfo={pageInfo}
      basePath={basePath}
      eyebrow={`Category · ${label}`}
      title={label}
      description={`Stories filed under ${label} — from the journal of The Kashmir Weaver.`}
      showFeatured={false}
      emptyMessage={`No stories in the ${label} category yet.`}
    />
  );
}
