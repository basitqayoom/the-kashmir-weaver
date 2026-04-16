import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ivory px-4 text-center">
      <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold">
        404
      </p>
      <h1 className="mt-4 font-heading text-4xl font-bold text-charcoal sm:text-5xl">
        Page Not Found
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base text-charcoal/60">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
        Let us guide you back to our collection.
      </p>
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/"
          className="font-accent rounded-full bg-burgundy px-8 py-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-ivory transition-all hover:scale-105"
        >
          Back to Home
        </Link>
        <Link
          href="/blog"
          className="font-accent rounded-full border border-charcoal/20 px-8 py-3 text-[11px] font-light tracking-[0.2em] uppercase text-charcoal transition-all hover:border-gold hover:text-gold"
        >
          Read Our Stories
        </Link>
      </div>
    </main>
  );
}
