import fs from "fs";
import path from "path";
import type { BookMeta, BookPart, BookSection } from "./types";

const manifestPath = path.join(process.cwd(), "src/content/book/book-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
  title: string;
  subtitle: string;
  edition: string;
  sections: BookSection[];
};

const BOOK_DIR = path.join(process.cwd(), "src/content/book");

const sectionsBySlug = new Map(manifest.sections.map((s) => [s.slug, s]));

export const bookSections: BookSection[] = [...manifest.sections].sort(
  (a, b) => a.order - b.order,
);

export function bookMeta(): BookMeta {
  return {
    title: manifest.title,
    subtitle: manifest.subtitle,
    edition: manifest.edition,
  };
}

export function getBookSection(slug: string): BookSection | undefined {
  return sectionsBySlug.get(slug);
}

export function bookSectionBody(slug: string): string {
  const filePath = path.join(BOOK_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return "";
  const raw = fs.readFileSync(filePath, "utf8");
  return raw.replace(/^---[\s\S]*?---\s*/, "");
}

const chapterInOrder = new Map<string, number>();
{
  let seq = 0;
  for (const section of bookSections) {
    if (section.kind === "chapter" || section.kind === "soul") {
      seq += 1;
      chapterInOrder.set(section.slug, seq);
    }
  }
}

export function bookChapterNumber(section: BookSection): number {
  return chapterInOrder.get(section.slug) ?? section.number ?? 0;
}

export function bookSectionLabel(section: BookSection): string {
  switch (section.kind) {
    case "chapter":
    case "soul":
      return `Chapter ${bookChapterNumber(section)}`;
    case "appendix":
      return `Appendix ${section.slug.replace("appendix-", "").toUpperCase()}`;
    case "part":
      return section.title;
    case "acknowledgements":
      return "Acknowledgements";
    case "preface":
      return "Preface";
  }
}

export const BOOK_PARTS: BookPart[] = [
  {
    label: "Part I",
    title: "Origins",
    sectionSlugs: [
      "chapter-1",
      "chapter-3",
      "chapter-11",
      "chapter-21",
      "chapter-22",
    ],
  },
  {
    label: "Part II",
    title: "The Historical Journey",
    sectionSlugs: [
      "chapter-2",
      "chapter-10",
      "chapter-19",
      "chapter-20",
      "chapter-31",
    ],
  },
  {
    label: "Part III",
    title: "The Craft",
    sectionSlugs: [
      "chapter-4",
      "chapter-5",
      "chapter-6",
      "chapter-7",
      "chapter-23",
      "chapter-27",
      "chapter-28",
    ],
  },
  {
    label: "Part IV",
    title: "The People",
    sectionSlugs: ["chapter-14", "chapter-15", "chapter-24", "chapter-25"],
  },
  {
    label: "Part V",
    title: "Art, Motifs & Philosophy",
    sectionSlugs: ["chapter-16", "chapter-18", "chapter-30"],
  },
  {
    label: "Part VI",
    title: "The Collector's Guide",
    sectionSlugs: [
      "chapter-8",
      "chapter-9",
      "chapter-12",
      "chapter-13",
      "chapter-26",
      "chapter-29",
      "chapter-32",
      "chapter-33",
      "chapter-34",
      "chapter-35",
      "chapter-36",
    ],
  },
  {
    label: "Part VII",
    title: "The Future of Pashmina",
    sectionSlugs: ["chapter-17", "chapter-39", "chapter-40"],
  },
  {
    label: "Reference",
    title: "Glossary & Sources",
    sectionSlugs: ["chapter-37", "chapter-38"],
  },
  {
    label: "Part IX",
    title: "The Masters of Kashmir",
    sectionSlugs: ["masters-of-kashmir"],
  },
  {
    label: "Part X",
    title: "The Soul of Kashmir",
    sectionSlugs: [
      "soul-of-kashmir",
      "soul-1",
      "soul-2",
      "soul-3",
      "soul-4",
      "soul-5",
      "soul-6",
      "soul-7",
      "soul-8",
      "soul-9",
      "soul-10",
    ],
  },
  {
    label: "Back Matter",
    title: "Acknowledgements & Appendices",
    sectionSlugs: [
      "acknowledgements",
      "appendix-a",
      "appendix-b",
      "appendix-c",
      "appendix-d",
    ],
  },
];

export function getBookIndexData() {
  const meta = bookMeta();
  const sections = bookSections;
  const frontMatter = sections.filter((s) => s.slug === "preface");
  const parts = BOOK_PARTS.map((part) => ({
    label: part.label,
    title: part.title,
    sections: part.sectionSlugs
      .map((slug) => sections.find((s) => s.slug === slug))
      .filter((s): s is BookSection => Boolean(s)),
  }));
  const wordCount = sections.reduce(
    (total, section) =>
      total +
      bookSectionBody(section.slug).split(/\s+/).filter(Boolean).length,
    0,
  );
  return { meta, parts, frontMatter, wordCount };
}
