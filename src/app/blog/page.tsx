import type { Metadata } from "next";
import { getAllJournalArticles } from "@/lib/shopify/journal";
import {
  getJournalArticlesPage,
  parseJournalPageParam,
} from "@/lib/journal-page";
import BlogIndexContent from "@/components/blog/BlogIndexContent";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
  title: "Stories from the Valley",
  description:
    "The history, craft, and culture of Kashmiri Pashmina — written for those who want to understand what they are buying, and why it matters.",
  pathname: "/blog",
});

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function BlogPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = parseJournalPageParam(pageParam);
  const allArticles = await getAllJournalArticles();
  const { articles, pageInfo } = getJournalArticlesPage(allArticles, { page });

  return (
    <BlogIndexContent
      articles={articles}
      pageInfo={pageInfo}
      title="Stories from the Valley"
      description="The history, craft, and culture of Kashmiri Pashmina — written for those who want to understand what they are buying, and why it matters."
    />
  );
}
