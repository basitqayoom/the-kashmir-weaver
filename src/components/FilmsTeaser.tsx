import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function Flourish({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 12h36"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M80 12h36"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M52 12c0-3 3-5 6-5 4 0 6 2 6 5 0 4-4 7-6 7-2 0-6-3-6-7z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

const EASE = "cubic-bezier(0.22,1,0.36,1)";

export default function FilmsTeaser() {
  return (
    <section
      id="films"
      className="bg-ivory bg-linen py-20 sm:py-28"
      aria-labelledby="films-teaser-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="reveal text-center">
          <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
            Films &middot; Watch
          </p>
          <h2
            id="films-teaser-heading"
            className="mt-4 font-heading text-3xl font-bold text-charcoal sm:text-4xl lg:text-5xl"
          >
            Pashmina in Moving Picture
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-heading text-base italic text-charcoal/70 sm:text-lg">
            Two short films — an anatomy of a single shawl, and the full
            journey from Himalayan fleece to finished weave.
          </p>
          <p className="mt-3 text-xs italic tracking-wide text-charcoal/50 sm:text-sm">
            Creative films &middot; Some AI-assisted
          </p>
        </div>

        {/* Grid */}
        <div className="reveal mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2 md:gap-8">
          {siteConfig.films.map((film) => (
            <Link
              key={film.slug}
              href={`/films#${film.slug}`}
              aria-label={`Watch ${film.title} (${film.runtime})`}
              className="group relative block overflow-hidden rounded-2xl border border-gold/15 shadow-lg transition-[box-shadow,border-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-gold/40 hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-charcoal">
                {/* Layer 1 — heritage image, always at full opacity. The
                    burgundy "tint" at rest is produced by a blended overlay
                    (Layer 2), not by fading the image. This guarantees the
                    image is present from first paint, even in headless
                    browsers where intersection-observer lazy-loading can lag. */}
                <Image
                  src={film.hoverImage}
                  alt={film.hoverImageAlt}
                  fill
                  sizes="(min-width: 1024px) 480px, (min-width: 768px) 45vw, 95vw"
                  className="scale-[1.04] object-cover will-change-transform group-hover:scale-100 group-focus-visible:scale-100 motion-reduce:transition-none"
                  style={{ transition: `transform 900ms ${EASE}` }}
                  loading="eager"
                  fetchPriority="low"
                />

                {/* Layer 2 — burgundy blend overlay. mix-blend-mode: multiply
                    dyes the image in burgundy at rest (editorial tone) while
                    preserving all photographic detail (highlights, shadows,
                    composition). On hover the overlay fades away and the
                    photograph emerges in its true colour. */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-burgundy-light via-burgundy to-charcoal opacity-[0.92] mix-blend-multiply group-hover:opacity-10 group-focus-visible:opacity-10 motion-reduce:transition-none"
                  aria-hidden="true"
                  style={{ transition: `opacity 600ms ${EASE}` }}
                />

                {/* Layer 3 — soft darken for legibility of the centre text at
                    rest; fades on hover so the photo centre breathes. */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-60 group-hover:opacity-0 group-focus-visible:opacity-0 motion-reduce:transition-none"
                  aria-hidden="true"
                  style={{
                    transition: `opacity 500ms ${EASE}`,
                    background:
                      "radial-gradient(ellipse at center, rgba(42,27,27,0.35) 0%, rgba(42,27,27,0.65) 100%)",
                  }}
                />

                {/* Layer 4 — bottom contrast sliver on hover; keeps runtime
                    and play badge readable over whatever the photo shows. */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-charcoal/75 to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
                  aria-hidden="true"
                  style={{ transition: `opacity 500ms ${EASE}` }}
                />

                {/* Layer 5 — top contrast sliver on hover; keeps eyebrow
                    readable. */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-charcoal/55 to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
                  aria-hidden="true"
                  style={{ transition: `opacity 500ms ${EASE}` }}
                />

                {/* Layer 6 — gold corner frame (tightens + brightens on hover) */}
                <div
                  className="pointer-events-none absolute inset-4 border border-gold/20 transition-[border-color,inset] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:inset-3 group-hover:border-gold/60 group-focus-visible:inset-3 group-focus-visible:border-gold/60 sm:inset-5 sm:group-hover:inset-4 sm:group-focus-visible:inset-4"
                  aria-hidden="true"
                />

                {/* Layer 7 — eyebrow */}
                <div className="absolute left-8 top-8 sm:left-10 sm:top-10">
                  <p
                    className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold"
                    style={{
                      textShadow:
                        "0 1px 3px rgba(0,0,0,0.9), 0 2px 14px rgba(0,0,0,0.6)",
                    }}
                  >
                    {film.eyebrow}
                  </p>
                </div>

                {/* Layer 8 — centre content. Tagline fades on hover so the
                    photo's centre isn't crowded with text. */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center sm:px-12">
                  <Flourish className="h-4 w-24 text-gold/60 transition-colors duration-500 group-hover:text-gold group-focus-visible:text-gold" />
                  <h3
                    className="mt-5 font-heading text-2xl font-light leading-tight text-ivory sm:text-3xl lg:text-[2rem]"
                    style={{
                      textShadow:
                        "0 2px 6px rgba(0,0,0,0.85), 0 4px 24px rgba(0,0,0,0.7)",
                    }}
                  >
                    {film.title}
                  </h3>
                  <p
                    className="mt-3 max-w-xs text-xs italic leading-relaxed text-ivory/80 opacity-100 group-hover:opacity-0 group-focus-visible:opacity-0 sm:text-sm motion-reduce:transition-none"
                    style={{
                      transition: `opacity 400ms ${EASE}`,
                      textShadow: "0 1px 6px rgba(0,0,0,0.75)",
                    }}
                  >
                    {film.teaser}
                  </p>
                </div>

                {/* Layer 9 — runtime */}
                <div className="absolute bottom-8 left-8 sm:bottom-10 sm:left-10">
                  <p
                    className="font-accent text-[10px] tracking-[0.25em] uppercase text-ivory/80"
                    style={{
                      textShadow:
                        "0 1px 3px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.7)",
                    }}
                  >
                    {film.runtime}
                  </p>
                </div>

                {/* Layer 10 — play badge (glows on hover) */}
                <div className="absolute bottom-8 right-8 flex items-center gap-2.5 sm:bottom-10 sm:right-10">
                  <span
                    className="font-accent text-[10px] tracking-[0.25em] uppercase text-ivory/80 transition-colors duration-500 group-hover:text-gold group-focus-visible:text-gold"
                    style={{
                      textShadow:
                        "0 1px 3px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.7)",
                    }}
                  >
                    Watch
                  </span>
                  <span
                    className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-gold/10 backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-hover:border-gold group-hover:bg-gold group-hover:shadow-[0_0_28px_rgba(212,175,55,0.55)] group-focus-visible:scale-110 group-focus-visible:border-gold group-focus-visible:bg-gold group-focus-visible:shadow-[0_0_28px_rgba(212,175,55,0.55)] sm:h-11 sm:w-11"
                  >
                    <PlayIcon className="ml-0.5 h-4 w-4 text-gold transition-colors duration-500 group-hover:text-charcoal group-focus-visible:text-charcoal sm:h-[18px] sm:w-[18px]" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer link */}
        <div className="reveal mt-12 text-center">
          <Link
            href="/films"
            className="font-accent inline-flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-gold-text transition-colors hover:text-burgundy"
          >
            View Both Films
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
