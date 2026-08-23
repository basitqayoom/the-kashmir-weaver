/**
 * One-off migration: upserts the-kashmir-weaver's hardcoded src/data/articles.ts
 * into the SAME Shopify "journal" blog Hydrogen already reads from, under matching
 * slugs — mirrors the exact Admin API mutation shape used by
 * hydrogen-the-kashmir-weaver/scripts/sync-journal-articles.ts.
 *
 * Run with: SHOPIFY_ADMIN_ACCESS_TOKEN=... npx tsx scripts/migrate-blog-to-shopify.ts
 * (token intentionally NOT stored in .env.local — passed only at script-run-time)
 */
import { articles } from "../src/data/articles";

const STORE_DOMAIN =
  process.env.PUBLIC_STORE_DOMAIN || "70yuey-sr.myshopify.com";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API_VERSION = "2025-01";
const BLOG_HANDLE = "journal";
const VALID_CATEGORIES = [
  "Heritage",
  "Craft",
  "Style",
  "Travel",
  "Literature",
  "Luxury Living",
  "Gift Guide",
];

if (!ADMIN_TOKEN) {
  console.error("Missing SHOPIFY_ADMIN_ACCESS_TOKEN env var. Aborting.");
  process.exit(1);
}

async function adminFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(
    `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_TOKEN as string,
      },
      body: JSON.stringify({ query, variables }),
    },
  );
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data as T;
}

/** Mirrors the site's own MarkdownContent renderer (blog/[slug]/page.tsx) so migrated HTML matches exactly. */
function markdownToHtml(content: string): string {
  const lines = content.split("\n");
  const out: string[] = [];
  let tableRows: string[][] = [];
  let inTable = false;

  function escape(s: string) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function inline(s: string) {
    return escape(s)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");
  }

  function flushTable() {
    if (tableRows.length === 0) return;
    const [header, ...body] = tableRows;
    out.push("<table>");
    out.push(
      `<thead><tr>${header.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead>`,
    );
    out.push(
      `<tbody>${body
        .map(
          (row) =>
            `<tr>${row.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`,
        )
        .join("")}</tbody>`,
    );
    out.push("</table>");
    tableRows = [];
  }

  for (const raw of lines) {
    const trimmed = raw.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) continue;
      inTable = true;
      tableRows.push(cells);
      continue;
    }
    if (inTable) {
      flushTable();
      inTable = false;
    }

    if (trimmed === "") continue;
    if (trimmed.startsWith("### "))
      out.push(`<h3>${escape(trimmed.slice(4))}</h3>`);
    else if (trimmed.startsWith("## "))
      out.push(`<h2>${escape(trimmed.slice(3))}</h2>`);
    else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      out.push(`<p><strong>${escape(trimmed.slice(2, -2))}</strong></p>`);
    } else out.push(`<p>${inline(trimmed)}</p>`);
  }
  if (inTable) flushTable();
  return out.join("\n");
}

function mapCategory(rawCategory: string): string {
  return VALID_CATEGORIES.includes(rawCategory) ? rawCategory : "Craft";
}

async function getOrCreateBlogId(): Promise<string> {
  const data = await adminFetch<{
    blogs: { edges: { node: { id: string; handle: string } }[] };
  }>(`query { blogs(first: 20) { edges { node { id handle } } } }`);
  const match = data.blogs.edges.find((e) => e.node.handle === BLOG_HANDLE);
  if (match) return match.node.id;

  const created = await adminFetch<{
    blogCreate: {
      blog: { id: string } | null;
      userErrors: { message: string }[];
    };
  }>(
    `mutation($blog:BlogCreateInput!){ blogCreate(blog:$blog){ blog{id} userErrors{message} } }`,
    {
      blog: { title: "Journal", handle: BLOG_HANDLE },
    },
  );
  if (created.blogCreate.userErrors.length) {
    throw new Error(
      created.blogCreate.userErrors.map((e) => e.message).join(", "),
    );
  }
  return created.blogCreate.blog!.id;
}

async function getExistingArticlesByHandle(
  blogId: string,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let after: string | null = null;
  for (;;) {
    const data: {
      blog: {
        articles: {
          nodes: { id: string; handle: string }[];
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
        };
      };
    } = await adminFetch(
      `query($id:ID!,$after:String){ blog(id:$id){ articles(first:50, after:$after){ nodes{id handle} pageInfo{hasNextPage endCursor} } } }`,
      { id: blogId, after },
    );
    for (const node of data.blog.articles.nodes) map.set(node.handle, node.id);
    if (!data.blog.articles.pageInfo.hasNextPage) break;
    after = data.blog.articles.pageInfo.endCursor;
  }
  return map;
}

async function main() {
  console.log(
    `Migrating ${articles.length} articles into Shopify blog "${BLOG_HANDLE}"...`,
  );
  const blogId = await getOrCreateBlogId();
  const existing = await getExistingArticlesByHandle(blogId);

  for (const post of articles) {
    const bodyHtml = markdownToHtml(post.content);
    const common = {
      title: post.title,
      author: { name: "The Kashmir Weaver" },
      body: bodyHtml,
      summary: post.excerpt,
      tags: [mapCategory(post.category)],
      isPublished: true,
      publishDate: new Date(post.date).toISOString(),
      image: { url: post.image, altText: post.title },
    };

    const existingId = existing.get(post.slug);
    if (existingId) {
      const result = await adminFetch<{
        articleUpdate: {
          article: { handle: string } | null;
          userErrors: { message: string }[];
        };
      }>(
        `mutation($id:ID!,$article:ArticleUpdateInput!){ articleUpdate(id:$id, article:$article){ article{handle} userErrors{message} } }`,
        { id: existingId, article: common },
      );
      if (result.articleUpdate.userErrors.length) {
        console.error(
          `  ✗ ${post.slug} (update): ${result.articleUpdate.userErrors.map((e) => e.message).join(", ")}`,
        );
      } else {
        console.log(`  ✓ ${post.slug} (updated)`);
      }
    } else {
      const result = await adminFetch<{
        articleCreate: {
          article: { handle: string } | null;
          userErrors: { message: string }[];
        };
      }>(
        `mutation($article:ArticleCreateInput!){ articleCreate(article:$article){ article{handle} userErrors{message} } }`,
        { article: { ...common, blogId, handle: post.slug } },
      );
      if (result.articleCreate.userErrors.length) {
        console.error(
          `  ✗ ${post.slug} (create): ${result.articleCreate.userErrors.map((e) => e.message).join(", ")}`,
        );
      } else {
        console.log(`  ✓ ${post.slug} (created)`);
      }
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
