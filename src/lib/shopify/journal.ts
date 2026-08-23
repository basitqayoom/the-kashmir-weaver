import { shopifyFetch } from "./client";

export type JournalArticle = {
  handle: string;
  title: string;
  excerpt: string | null;
  contentHtml: string;
  publishedAt: string;
  tags: string[];
  author: string;
  image: {
    url: string;
    altText: string | null;
    width: number | null;
    height: number | null;
  } | null;
};

const ARTICLE_FIELDS = /* GraphQL */ `
  handle
  title
  excerpt
  contentHtml
  publishedAt
  tags
  authorV2 {
    name
  }
  image {
    url
    altText
    width
    height
  }
`;

type RawArticle = {
  handle: string;
  title: string;
  excerpt: string | null;
  contentHtml: string;
  publishedAt: string;
  tags: string[];
  authorV2: { name: string } | null;
  image: JournalArticle["image"];
};

function imageFileName(url: string): string | null {
  const last = url.split(/[?#]/)[0].split("/").pop();
  if (!last) return null;
  try {
    return decodeURIComponent(last).toLowerCase();
  } catch {
    return last.toLowerCase();
  }
}

/**
 * Articles migrated with the cover also embedded at the top of the body render
 * it twice. Matched by file name because the cover is served from `/articles/`
 * while the in-body copy comes from `/files/`.
 */
function stripDuplicateCoverImage(
  html: string,
  coverUrl: string | null | undefined,
): string {
  const cover = coverUrl ? imageFileName(coverUrl) : null;
  if (!cover || !html) return html;

  let removed = false;
  const stripped = html.replace(/<img\b[^>]*>/gi, (tag) => {
    if (removed) return tag;
    const src = /\ssrc\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    if (!src || imageFileName(src) !== cover) return tag;
    removed = true;
    return "";
  });
  if (!removed) return html;

  // Drop the wrapper the image left behind (twice, for <figure><p><img>).
  return stripped
    .replace(/<(p|figure|div)\b[^>]*>\s*<\/\1>/gi, "")
    .replace(/<(p|figure|div)\b[^>]*>\s*<\/\1>/gi, "");
}

function mapArticle(raw: RawArticle): JournalArticle {
  return {
    handle: raw.handle,
    title: raw.title,
    excerpt: raw.excerpt,
    contentHtml: stripDuplicateCoverImage(raw.contentHtml, raw.image?.url),
    publishedAt: raw.publishedAt,
    tags: raw.tags,
    author: raw.authorV2?.name || "The Kashmir Weaver",
    image: raw.image,
  };
}

const JOURNAL_ARTICLES_QUERY = /* GraphQL */ `
  query JournalArticles($first: Int!, $after: String) {
    blog(handle: "journal") {
      articles(
        first: $first
        after: $after
        sortKey: PUBLISHED_AT
        reverse: true
      ) {
        nodes {
          ${ARTICLE_FIELDS}
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

const JOURNAL_ARTICLE_BY_HANDLE_QUERY = /* GraphQL */ `
  query JournalArticleByHandle($handle: String!) {
    blog(handle: "journal") {
      articleByHandle(handle: $handle) {
        ${ARTICLE_FIELDS}
      }
    }
  }
`;

const JOURNAL_FETCH_PAGE_SIZE = 50;
const JOURNAL_MAX_PAGES = 25;
const JOURNAL_MAX_ARTICLES = JOURNAL_FETCH_PAGE_SIZE * JOURNAL_MAX_PAGES;

export async function getJournalArticles(
  first = 50,
): Promise<JournalArticle[]> {
  const data = await shopifyFetch<{
    blog: { articles: { nodes: RawArticle[] } } | null;
  }>({
    query: JOURNAL_ARTICLES_QUERY,
    variables: { first },
  });
  return (data.blog?.articles.nodes ?? []).map(mapArticle);
}

/** Fetch all published journal articles via cursor pagination (bounded). */
export async function getAllJournalArticles(
  maxArticles = JOURNAL_MAX_ARTICLES,
): Promise<JournalArticle[]> {
  const collected: JournalArticle[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < JOURNAL_MAX_PAGES; page++) {
    const remaining = Math.max(0, maxArticles - collected.length);
    if (remaining === 0) break;

    const first = Math.min(JOURNAL_FETCH_PAGE_SIZE, remaining);
    type JournalPage = {
      blog: {
        articles: {
          nodes: RawArticle[];
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
        };
      } | null;
    };
    const data: JournalPage = await shopifyFetch<JournalPage>({
      query: JOURNAL_ARTICLES_QUERY,
      variables: { first, after: cursor },
    });

    const articles = data.blog?.articles;
    if (!articles) break;

    collected.push(...articles.nodes.map(mapArticle));

    if (
      articles.pageInfo.hasNextPage &&
      articles.pageInfo.endCursor &&
      collected.length < maxArticles
    ) {
      cursor = articles.pageInfo.endCursor;
    } else {
      break;
    }
  }

  return collected;
}

export async function getJournalArticleByHandle(
  handle: string,
): Promise<JournalArticle | null> {
  const data = await shopifyFetch<{
    blog: { articleByHandle: RawArticle | null } | null;
  }>({
    query: JOURNAL_ARTICLE_BY_HANDLE_QUERY,
    variables: { handle },
  });
  const raw = data.blog?.articleByHandle;
  return raw ? mapArticle(raw) : null;
}
