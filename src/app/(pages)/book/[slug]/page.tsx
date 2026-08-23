import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookSectionView from "@/components/book/BookSectionView";
import {
  bookMeta,
  bookSectionBody,
  bookSectionLabel,
  bookSections,
  getBookSection,
} from "@/lib/book/registry";
import {
  blocksToHtml,
  inlineToPlain,
  parseBookMarkdown,
} from "@/lib/book/markdown";
import { seoBundle } from "@/lib/seo";

function truncateMetaDescription(text: string, max = 160): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function sectionDescription(markdown: string): string | undefined {
  const firstParagraph = parseBookMarkdown(markdown).find(
    (block) => block.type === "paragraph",
  );
  if (!firstParagraph || firstParagraph.type !== "paragraph") return undefined;
  return truncateMetaDescription(
    inlineToPlain(firstParagraph.text).replace(/\s+/g, " "),
  );
}

export function generateStaticParams() {
  return bookSections.map((section) => ({ slug: section.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const section = getBookSection(slug);
  if (!section) return { title: "The Book — The Kashmir Weaver" };

  const description =
    section.subtitle.trim() ||
    sectionDescription(bookSectionBody(section.slug)) ||
    undefined;

  return seoBundle({
    title: `${bookSectionLabel(section)} — ${section.title} — The Kashmir Weaver`,
    description,
    pathname: `/book/${section.slug}`,
    type: "article",
  });
}

export default async function BookSectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = getBookSection(slug);
  if (!section) notFound();

  const html = blocksToHtml(
    parseBookMarkdown(bookSectionBody(section.slug)),
    section.title,
  );

  const sections = bookSections;
  const index = sections.findIndex((s) => s.slug === section.slug);

  return (
    <BookSectionView
      meta={bookMeta()}
      section={section}
      html={html}
      prev={index > 0 ? (sections[index - 1] ?? null) : null}
      next={
        index >= 0 && index < sections.length - 1
          ? (sections[index + 1] ?? null)
          : null
      }
    />
  );
}
