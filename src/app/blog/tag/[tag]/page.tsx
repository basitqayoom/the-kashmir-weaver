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
  params: Promise<{ tag: string }>;
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
  const { tag } = await params;
  const label = decodeParam(tag);
  const pathname = journalLandingPath("tag", label);
  return seoBundle({
    title: `#${label} — Stories from the Valley`,
    description: `Journal stories tagged ${label} — heritage, craft, and culture of Kashmiri Pashmina.`,
    pathname,
  });
}

export default async function BlogTagPage({ params, searchParams }: PageProps) {
  const { tag } = await params;
  const { page: pageParam } = await searchParams;
  const label = decodeParam(tag);
  const page = parseJournalPageParam(pageParam);
  const allArticles = await getAllJournalArticles();
  const matching = filterJournalArticles(allArticles, "tag", label);
  if (matching.length === 0) notFound();

  const { articles, pageInfo } = getJournalArticlesPage(allArticles, {
    page,
    kind: "tag",
    param: label,
  });
  const basePath = journalLandingPath("tag", label);

  return (
    <BlogIndexContent
      articles={articles}
      pageInfo={pageInfo}
      basePath={basePath}
      eyebrow={`Tag · ${label}`}
      title={`#${label}`}
      description={`Stories tagged ${label} — from the journal of The Kashmir Weaver.`}
      showFeatured={false}
      emptyMessage={`No stories tagged ${label} yet.`}
    />
  );
}
