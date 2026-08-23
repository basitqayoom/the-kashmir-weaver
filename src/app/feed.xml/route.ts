import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

/** Root feed alias — `/feed.xml` → blog RSS (Hydrogen parity). */
export function GET() {
  return NextResponse.redirect(`${siteConfig.url}/blog/rss.xml`, 301);
}
