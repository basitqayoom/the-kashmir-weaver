"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorViewProps = {
  status?: number;
  title?: string;
  message?: string;
  reset?: () => void;
};

export default function ErrorView({
  status = 500,
  title,
  message,
  reset,
}: ErrorViewProps) {
  useEffect(() => {
    console.error(`[ErrorView] ${status}`, message);
  }, [status, message]);

  const heading =
    title ??
    (status === 404 ? "Page Not Found" : "Something went wrong");

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center bg-ivory px-4 py-24 text-center">
      <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
        Error {status}
      </p>
      <h1 className="mt-4 font-heading text-4xl font-bold text-charcoal sm:text-5xl">
        {heading}
      </h1>
      {message ? (
        <p className="mx-auto mt-4 max-w-lg text-base text-charcoal/70">
          {message}
        </p>
      ) : (
        <p className="mx-auto mt-4 max-w-lg text-base text-charcoal/70">
          We couldn&rsquo;t load this page. Please try again or return to the
          collection.
        </p>
      )}
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
        {reset ? (
          <button
            type="button"
            onClick={reset}
            className="font-accent rounded-full bg-burgundy px-8 py-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-ivory transition-all hover:scale-105"
          >
            Try Again
          </button>
        ) : null}
        <Link
          href="/"
          className="font-accent rounded-full border border-charcoal/20 px-8 py-3 text-[11px] font-light tracking-[0.2em] uppercase text-charcoal transition-all hover:border-gold-text hover:text-gold-text"
        >
          Back to Home
        </Link>
        <Link
          href="/shop"
          className="font-accent rounded-full border border-charcoal/20 px-8 py-3 text-[11px] font-light tracking-[0.2em] uppercase text-charcoal transition-all hover:border-gold-text hover:text-gold-text"
        >
          Shop Collection
        </Link>
      </div>
    </main>
  );
}
