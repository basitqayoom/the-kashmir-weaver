"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { DynamicErrorBoundary } from "./SafeDynamic";

const ClientInstagramEmbed = dynamic(
  () =>
    import("react-social-media-embed")
      .then((mod) => mod.InstagramEmbed)
      .catch(() => (() => null) as never),
  { ssr: false },
);

interface Props {
  url: string;
  handle: string;
}

/**
 * Click-to-load Instagram facade.
 *
 * Motivation: the real `react-social-media-embed` widget pulls in
 * `https://www.instagram.com/embed.js`, drops 6 third-party cookies,
 * and blocks the critical network chain for ~2.3 s on mobile.
 *
 * We show a static, zero-JS preview and only mount the real embed
 * after the user explicitly consents to load it. Origin hints are
 * added to <head> lazily on hover for a warmer connection.
 */
export default function InstagramFacade({ url, handle }: Props) {
  const [loaded, setLoaded] = useState(false);
  const warmedRef = useRef(false);

  const warmConnections = useCallback(() => {
    if (warmedRef.current || typeof document === "undefined") return;
    warmedRef.current = true;
    const origins = [
      "https://www.instagram.com",
      "https://static.cdninstagram.com",
    ];
    for (const href of origins) {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = href;
      link.crossOrigin = "";
      document.head.appendChild(link);
    }
  }, []);

  if (loaded) {
    return (
      <DynamicErrorBoundary>
        <ClientInstagramEmbed url={url} width="100%" placeholderDisabled />
      </DynamicErrorBoundary>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      onMouseEnter={warmConnections}
      onFocus={warmConnections}
      onTouchStart={warmConnections}
      className="group relative flex aspect-[4/5] w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#833AB4]/80 via-[#C13584]/70 to-[#F77737]/70 text-ivory transition-all hover:brightness-110"
    >
      <svg
        className="h-12 w-12"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
      <span className="font-accent text-[11px] font-light uppercase tracking-[0.25em]">
        {handle}
      </span>
      <span className="font-accent rounded-full bg-ivory/15 px-5 py-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-ivory backdrop-blur-sm transition-colors group-hover:bg-ivory/25">
        Load Instagram Feed
      </span>
      <span className="px-6 text-center text-[10px] font-light text-ivory/70">
        Loading will share data with Instagram and set third-party cookies.
      </span>
    </button>
  );
}
