"use client";

import Image from "next/image";
import YouTubeFacade from "./YouTubeFacade";
import { useImageModal } from "./ImageModal";

const CDN = "https://cdn.shopify.com/s/files/1/0175/0928/files";

export default function Heritage() {
  const { open } = useImageModal();
  return (
    <section id="heritage" className="bg-ivory bg-linen py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text */}
          <div className="reveal">
            <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
              Our Heritage
            </p>
            <h2 className="mt-4 font-heading text-3xl font-bold text-charcoal sm:text-4xl lg:text-5xl">
              Centuries of Craft,
              <br />
              Woven by Hand
            </h2>
            <p className="mt-6 text-base leading-relaxed text-charcoal/80 sm:text-lg">
              In the Kashmir Valley, where the Jhelum bends through Srinagar&rsquo;s
              old city, a tradition older than the Mughal Empire still lives in
              the hands of master weavers. For over six hundred years, the{" "}
              <em>Wovur</em> has sat at the wooden <em>Saaz</em>, hands and feet
              moving like a pianist&rsquo;s — tossing the shuttle, pressing the
              treadles, beating the weft into place.
            </p>
            <p className="mt-4 text-base leading-relaxed text-charcoal/80 sm:text-lg">
              The craft was brought to Kashmir by Sultan Zayn ul Abidin in the
              15th century. The Mughal emperors wore Pashmina daily, gifting it
              as diplomatic currency. European traders carried Kashmiri shawls
              west, where the Paisley pattern — actually a Kashmiri <em>keri</em>{" "}
              motif — became the most sought-after textile design in history.
            </p>

            {/* Stat callout */}
            <div className="mt-8 border-l-4 border-gold pl-6">
              <p className="font-heading text-3xl font-bold text-burgundy sm:text-4xl">
                20 Hand Processes
              </p>
              <p className="mt-1 text-sm text-charcoal/70">
                from raw fleece to finished shawl — unchanged since the 15th century
              </p>
            </div>
          </div>

          {/* Image + Video */}
          <div className="reveal space-y-8">
            <div className="relative">
              <div
                className="relative aspect-[4/5] cursor-pointer overflow-hidden rounded-2xl shadow-2xl"
                onClick={() => open(`${CDN}/pashmina-handloom-weaving-artisan.webp`, "Kashmiri artisan weaving Pashmina on a traditional Saaz handloom")}
              >
                <Image
                  src={`${CDN}/pashmina-handloom-weaving-artisan.webp`}
                  alt="Kashmiri artisan weaving Pashmina on a traditional Saaz handloom"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
              </div>
              {/* Floating stat cards */}
              <div className="absolute -bottom-6 left-4 right-4 flex gap-3 sm:left-6 sm:right-6">
                {[
                  { value: "15th C.", label: "Origin of Craft" },
                  { value: "12km", label: "Walking per Warp" },
                  { value: "1,200", label: "Threads per Warp" },
                ].map((s, i) => (
                  <div key={i} className="flex-1 rounded-xl border border-gold/20 bg-white/95 p-3 text-center shadow-lg backdrop-blur">
                    <p className="font-heading text-lg font-bold text-burgundy sm:text-xl">{s.value}</p>
                    <p className="text-[10px] uppercase tracking-wider text-charcoal/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Video — How Pashmina is Made */}
            <div className="mt-10 pt-4">
              <p className="font-accent mb-3 text-center text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
                Watch the Craft
              </p>
              <div className="overflow-hidden rounded-2xl border border-gold/10 shadow-lg">
                <div className="relative aspect-video">
                  <YouTubeFacade
                    videoId="0UOEyt4ViZA"
                    title="How Pashmina is Made — The Kashmir Weaver"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gold flourish divider */}
      <div className="divider-gold mt-24" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
            fill="#D4AF37"
            opacity="0.6"
          />
        </svg>
      </div>
    </section>
  );
}
