import type { JournalArticle } from "@/lib/shopify/journal";
import { slugEquals } from "@/lib/feeds/slugs";

export const JOURNAL_CATEGORIES = [
  "All",
  "Heritage",
  "Craft",
  "Style",
  "Travel",
  "Literature",
  "Luxury Living",
  "Gift Guide",
] as const;

export type JournalFilterKind = "category" | "tag" | "author";

export type JournalPageInfo = {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  perPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export const JOURNAL_PER_PAGE = 12;

export function parseJournalPageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function paginate<T>(
  items: T[],
  page: number,
  perPage: number,
): { slice: T[]; pageInfo: JournalPageInfo } {
  const safePage = Math.max(1, Math.floor(page));
  const safePerPage = Math.max(1, Math.floor(perPage));
  const totalPosts = items.length;
  const totalPages = totalPosts === 0 ? 0 : Math.ceil(totalPosts / safePerPage);
  const start = (safePage - 1) * safePerPage;
  const slice = items.slice(start, start + safePerPage);
  return {
    slice,
    pageInfo: {
      currentPage: safePage,
      totalPages,
      totalPosts,
      perPage: safePerPage,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
}

export function filterJournalArticles(
  articles: JournalArticle[],
  kind: JournalFilterKind,
  param: string,
): JournalArticle[] {
  if (kind === "author") {
    return articles.filter((article) => slugEquals(article.author, param));
  }
  return articles.filter((article) =>
    article.tags.some((tag) => slugEquals(tag, param)),
  );
}

export function getJournalArticlesPage(
  articles: JournalArticle[],
  options: {
    page?: number;
    perPage?: number;
    kind?: JournalFilterKind;
    param?: string;
  } = {},
): { articles: JournalArticle[]; pageInfo: JournalPageInfo } {
  const perPage = options.perPage ?? JOURNAL_PER_PAGE;
  const page = Math.max(1, options.page ?? 1);
  const filtered =
    options.kind && options.param
      ? filterJournalArticles(articles, options.kind, options.param)
      : articles;
  const sorted = [...filtered].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
  const { slice, pageInfo } = paginate(sorted, page, perPage);
  return { articles: slice, pageInfo };
}

export function journalLandingPath(
  kind: JournalFilterKind,
  param: string,
): string {
  return `/blog/${kind}/${encodeURIComponent(param)}`;
}

export function journalPageHref(
  basePath: string,
  page: number,
): string {
  if (page <= 1) return basePath;
  return `${basePath}?page=${page}`;
}

export function collectJournalAuthors(articles: JournalArticle[]): string[] {
  const seen = new Set<string>();
  const authors: string[] = [];
  for (const article of articles) {
    const key = article.author.trim();
    if (!key || seen.has(key.toLowerCase())) continue;
    seen.add(key.toLowerCase());
    authors.push(key);
  }
  return authors.sort((a, b) => a.localeCompare(b));
}

export function collectJournalTags(articles: JournalArticle[]): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const article of articles) {
    for (const tag of article.tags) {
      if (!tag || tag.toLowerCase() === "all") continue;
      const key = tag.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      tags.push(tag);
    }
  }
  return tags.sort((a, b) => a.localeCompare(b));
}
