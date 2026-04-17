import Link from "next/link";
import type { Metadata } from "next";
import YouTubeFacade from "@/components/YouTubeFacade";
import { siteConfig, whatsappLink } from "@/config/site";

export const metadata: Metadata = {
  title: "Films — The Kashmir Weaver",
  description:
    "Two short films on the art of Kashmiri Pashmina — from the Changthangi goat of Ladakh to the handwoven shawl. Watch the anatomy of a shawl and the journey of the craft.",
  openGraph: {
    title: "Films — The Kashmir Weaver",
    description:
      "Two short films on the art of Kashmiri Pashmina — from Himalayan fleece to handwoven shawl.",
    type: "website",
    images: siteConfig.films.map((film) => ({
      url: `https://i.ytimg.com/vi/${film.youtubeId}/maxresdefault.jpg`,
      width: 1280,
      height: 720,
      alt: film.title,
    })),
  },
  twitter: {
    card: "summary_large_image",
    title: "Films — The Kashmir Weaver",
    description:
      "Two short films on the art of Kashmiri Pashmina — from Himalayan fleece to handwoven shawl.",
  },
  alternates: {
    canonical: "/films",
  },
};

const runtimeToISO = (runtime: string) => {
  const [m, s] = runtime.split(":").map((n) => Number(n));
  return `PT${m}M${s}S`;
};

export default function FilmsPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Films", item: `${siteConfig.url}/films` },
    ],
  };

  const videoJsonLd = siteConfig.films.map((film) => ({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: film.title,
    description: film.description,
    thumbnailUrl: `https://i.ytimg.com/vi/${film.youtubeId}/maxresdefault.jpg`,
    uploadDate: "2026-04-01",
    duration: runtimeToISO(film.runtime),
    contentUrl: `https://www.youtube.com/watch?v=${film.youtubeId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${film.youtubeId}`,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/images/logo/logo-green-bg.png`,
      },
    },
  }));

  return (
    <main className="bg-ivory bg-linen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {videoJsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ld).replace(/</g, "\\u003c"),
          }}
        />
      ))}

      {/* Hero */}
      <section className="relative overflow-hidden bg-charcoal pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 6px, #D4AF37 6px, #D4AF37 7px), repeating-linear-gradient(90deg, transparent, transparent 6px, #D4AF37 6px, #D4AF37 7px)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold">
            The Kashmir Weaver &middot; Films
          </p>
          <h1 className="mt-6 font-heading text-4xl font-light leading-[1.1] text-ivory sm:text-5xl lg:text-6xl">
            Moving Portraits of the{" "}
            <span className="italic">Craft</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-[1.8] text-ivory/70">
            Two short films on the art of Kashmiri Pashmina — from the
            Changthangi goat of Ladakh to the handwoven shawl, and the
            anatomy of a single piece.
          </p>
          <p className="mx-auto mt-6 max-w-lg font-heading text-sm italic leading-relaxed text-ivory/50">
            Some films on this page are AI-generated creative interpretations —
            artistic tributes to a craft practised by hand for over six
            centuries.
          </p>
        </div>
      </section>

      {/* Films */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="space-y-24 sm:space-y-32">
          {siteConfig.films.map((film, idx) => (
            <article
              key={film.slug}
              id={film.slug}
              className="reveal scroll-mt-24"
            >
              <div className="mx-auto max-w-3xl">
                {/* Intro */}
                <div className="text-center">
                  <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
                    {film.eyebrow}
                  </p>
                  <h2 className="mt-4 font-heading text-3xl font-bold text-charcoal sm:text-4xl lg:text-5xl">
                    {film.title}
                  </h2>
                  <p className="mx-auto mt-5 max-w-2xl font-heading text-base italic leading-relaxed text-charcoal/70 sm:text-lg">
                    {film.description}
                  </p>
                </div>

                {/* Video */}
                <div className="mt-10 overflow-hidden rounded-2xl border border-gold/15 shadow-lg">
                  <div className="relative aspect-video bg-charcoal">
                    <YouTubeFacade
                      videoId={film.youtubeId}
                      title={film.title}
                    />
                  </div>
                </div>

                {/* Meta */}
                <div className="mt-5 flex flex-col items-center justify-between gap-3 text-xs sm:flex-row">
                  <p className="font-accent tracking-[0.2em] uppercase text-charcoal/60">
                    Runtime &middot; {film.runtime}
                  </p>
                  <a
                    href={`https://www.youtube.com/watch?v=${film.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-accent inline-flex items-center gap-1.5 tracking-[0.2em] uppercase text-gold-text transition-colors hover:text-burgundy"
                  >
                    Watch on YouTube
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Separator between films (not after the last one) */}
              {idx < siteConfig.films.length - 1 && (
                <div
                  className="divider-gold mx-auto mt-24 max-w-xl sm:mt-28"
                  aria-hidden="true"
                >
                  <span className="font-accent text-[10px] uppercase tracking-[0.35em] text-gold/60">
                    &sect;
                  </span>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden bg-burgundy py-20 sm:py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 8px, #D4AF37 8px, #D4AF37 9px), repeating-linear-gradient(90deg, transparent, transparent 8px, #D4AF37 8px, #D4AF37 9px)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold">
            After the Film
          </p>
          <h2 className="mt-4 font-heading text-3xl font-bold text-ivory sm:text-4xl">
            See the Craft in Your Hands
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ivory/75">
            Films capture a fraction of the story. The shawl itself carries the
            rest — the weight of the weave, the depth of the dye, the warmth of
            twenty pairs of hands. Browse the current collection or ask for a
            personalised lookbook.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href={whatsappLink(siteConfig.whatsappMessages.lookbook)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-accent inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-charcoal transition-all hover:scale-105 hover:bg-gold-muted"
            >
              Request Lookbook on WhatsApp
            </a>
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="font-accent inline-flex items-center gap-2 rounded-full border border-ivory/20 px-8 py-3 text-[11px] font-light tracking-[0.2em] uppercase text-ivory transition-all hover:scale-105 hover:border-ivory/40"
            >
              Browse on Instagram
            </a>
          </div>

          <div className="mt-10">
            <Link
              href="/"
              className="font-accent text-[10px] uppercase tracking-[0.35em] text-ivory/50 transition-colors hover:text-gold"
            >
              &larr; Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
