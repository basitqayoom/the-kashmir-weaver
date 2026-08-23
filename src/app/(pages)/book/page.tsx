import type { Metadata } from "next";
import BookIndexView from "@/components/book/BookIndexView";
import { getBookIndexData } from "@/lib/book/registry";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
  title: "The Book — The Kashmir Weaver",
  description:
    "Read The Kashmir Weaver Research Handbook — an in-depth exploration of authentic Kashmiri pashmina, from the high Himalayas to the loom, free online.",
  pathname: "/book",
});

export default function BookPage() {
  const data = getBookIndexData();
  return <BookIndexView {...data} />;
}
