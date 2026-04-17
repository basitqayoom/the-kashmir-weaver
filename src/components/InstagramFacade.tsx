"use client";

import { useEffect, useRef, useState } from "react";
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
 * Viewport-lazy Instagram embed with a skeleton placeholder.
 *
 * - The heavy `react-social-media-embed` module and the upstream
 *   `instagram.com/embed.js` are only loaded once the host section
 *   scrolls within a 300 px rootMargin of the viewport. This keeps
 *   them out of the Lighthouse navigation audit (third-party cookies,
 *   unused-JS, critical-chain) and out of the initial main-thread
 *   budget for every real user.
 * - Connections to Instagram's origins are warmed via `preconnect`
 *   the moment we decide to load, so the upstream request starts
 *   against an already-negotiated TLS session.
 * - While the embed is in flight (or forever, if the user never
 *   scrolls to it) we show an Instagram-post-shaped skeleton instead
 *   of a blank rectangle, so the layout is stable and the loading
 *   state is obvious.
 */
export default function InstagramFacade({ url, handle }: Props) {
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const warmedRef = useRef(false);

  const warmConnections = () => {
    if (warmedRef.current || typeof document === "undefined") return;
    warmedRef.current = true;
    for (const href of [
      "https://www.instagram.com",
      "https://static.cdninstagram.com",
    ]) {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = href;
      link.crossOrigin = "";
      document.head.appendChild(link);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          warmConnections();
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const el = containerRef.current;
    if (!el) return;

    const attach = (iframe: HTMLIFrameElement) => {
      const markLoaded = () => setLoaded(true);
      iframe.addEventListener("load", markLoaded, { once: true });
      const readyState = iframe.contentDocument?.readyState;
      if (readyState === "complete" || readyState === "interactive") {
        markLoaded();
      }
    };

    const existing = el.querySelector("iframe");
    if (existing) {
      attach(existing);
      return;
    }

    const mo = new MutationObserver(() => {
      const iframe = el.querySelector("iframe");
      if (iframe) {
        attach(iframe);
        mo.disconnect();
      }
    });
    mo.observe(el, { childList: true, subtree: true });

    const safetyTimer = window.setTimeout(() => setLoaded(true), 8000);

    return () => {
      mo.disconnect();
      window.clearTimeout(safetyTimer);
    };
  }, [inView]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={`Instagram feed from ${handle}`}
      className="relative"
    >
      {/* Skeleton is always rendered underneath; it's hidden once the
          real Instagram iframe reports a `load` event (or after a
          safety timeout, so we never leave a skeleton stuck forever). */}
      <div
        aria-hidden={loaded}
        className={`transition-opacity duration-300 ${
          loaded ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <InstagramSkeleton handle={handle} />
      </div>

      {inView && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <DynamicErrorBoundary>
            <ClientInstagramEmbed url={url} width="100%" placeholderDisabled />
          </DynamicErrorBoundary>
        </div>
      )}
    </div>
  );
}

function InstagramSkeleton({ handle }: { handle: string }) {
  return (
    <div className="flex aspect-[4/5] w-full animate-pulse flex-col gap-3 bg-white p-4">
      {/* Header: avatar + username + menu dots */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#833AB4]/25 via-[#C13584]/25 to-[#F77737]/25" />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="h-3 w-32 rounded bg-gray-200">
            <span className="sr-only">{handle}</span>
          </div>
          <div className="h-2.5 w-20 rounded bg-gray-100" />
        </div>
        <div className="flex gap-1">
          <span className="h-1 w-1 rounded-full bg-gray-300" />
          <span className="h-1 w-1 rounded-full bg-gray-300" />
          <span className="h-1 w-1 rounded-full bg-gray-300" />
        </div>
      </div>

      {/* Image placeholder */}
      <div className="relative flex-1 overflow-hidden rounded-sm bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="h-12 w-12 text-gray-300"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </div>
      </div>

      {/* Action icons row */}
      <div className="flex items-center gap-4 pt-1">
        <div className="h-6 w-6 rounded-full bg-gray-200" />
        <div className="h-6 w-6 rounded-full bg-gray-200" />
        <div className="h-6 w-6 rounded-full bg-gray-200" />
        <div className="ml-auto h-6 w-6 rounded-full bg-gray-200" />
      </div>

      {/* Caption */}
      <div className="flex flex-col gap-1.5 pb-1">
        <div className="h-2.5 w-40 rounded bg-gray-200" />
        <div className="h-2.5 w-56 rounded bg-gray-100" />
        <div className="h-2.5 w-24 rounded bg-gray-100" />
      </div>
    </div>
  );
}
