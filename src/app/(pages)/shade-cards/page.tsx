import type { Metadata } from "next";
import ShadeCardsView from "@/components/ShadeCardsView";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
  title: "Shade Cards — The Kashmir Weaver",
  description:
    "Browse the complete Kashmir Weaver shade palette and view the official shade card PDF.",
  pathname: "/shade-cards",
});

export default function ShadeCardsPage() {
  return <ShadeCardsView />;
}
