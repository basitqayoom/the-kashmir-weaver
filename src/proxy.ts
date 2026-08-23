import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PRIMARY_HOST = "thekashmirweaver.com";

const REDIRECT_HOSTS = new Set([
  "thekashmirweaver.shop",
  "www.thekashmirweaver.shop",
  "thekashmirweaver.in",
  "www.thekashmirweaver.in",
]);

function mapJournalPath(pathname: string): string | null {
  if (pathname === "/journal" || pathname === "/journal/") return "/blog";
  if (pathname.startsWith("/journal/")) {
    return `/blog${pathname.slice("/journal".length)}`;
  }
  if (pathname.startsWith("/blogs/")) {
    return `/blog${pathname.slice("/blogs".length)}`;
  }
  if (pathname.startsWith("/articles/")) {
    return `/blog${pathname.slice("/articles".length)}`;
  }
  return null;
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const { pathname, search } = request.nextUrl;

  const journalTarget = mapJournalPath(pathname);
  if (journalTarget) {
    const url = request.nextUrl.clone();
    url.pathname = journalTarget;
    return NextResponse.redirect(url, 301);
  }

  if (host === `www.${PRIMARY_HOST}`) {
    const url = request.nextUrl.clone();
    url.host = PRIMARY_HOST;
    return NextResponse.redirect(url, 301);
  }

  if (REDIRECT_HOSTS.has(host)) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = PRIMARY_HOST;
    return NextResponse.redirect(url, 301);
  }

  if (pathname !== request.nextUrl.pathname || search) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt)$).*)",
  ],
};
