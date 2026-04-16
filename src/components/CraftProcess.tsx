"use client";

import Image from "next/image";
import YouTubeFacade from "./YouTubeFacade";
import { useImageModal } from "./ImageModal";

const CDN = "https://cdn.shopify.com/s/files/1/0175/0928/files";

const steps = [
  {
    num: 1,
    term: "",
    title: "The Source",
    description:
      "At 4,500 metres on the Changthang plateau of Ladakh, nomadic herders tend the Changthangi goat. Each spring, the goat sheds its ultra-fine undercoat — the raw Pashm that becomes Pashmina.",
  },
  {
    num: 2,
    term: "Pashm",
    title: "The Fibre",
    description:
      "The undercoat is hand-combed — never sheared — and dehaired to separate 12–16 micron fibres from coarser guard hairs. Each goat yields only 80–170 grams per year.",
  },
  {
    num: 3,
    term: "Ranger",
    title: "The Colour",
    description:
      "The master dyer (Ranger) transforms raw pashm into over 50 vibrant, azo-free colours. Each shade is mixed by hand — no two dyers produce the exact same hue.",
  },
  {
    num: 4,
    term: "Yarun",
    title: "The Warp",
    description:
      "Over 1,200 warp threads are laid across the frame — a process requiring up to 12 kilometres of walking back and forth. The warp is the skeleton of every shawl.",
  },
  {
    num: 5,
    term: "Bharangur · Saaz",
    title: "Dressing the Loom",
    description:
      "The Bharangur threads each warp yarn through the heddles and reed of the wooden Saaz. A single error can cascade through the entire weave.",
  },
  {
    num: 6,
    term: "Prech",
    title: "The Yarn",
    description:
      "Weft yarn is wound onto small wooden Prech spindles. For Kani weaving, dozens of tiny bobbins are prepared — one for each colour in the pattern.",
  },
  {
    num: 7,
    term: "Wovur · Wonun",
    title: "The Weaving",
    description:
      "The Wovur sits at the Saaz, hands throwing the shuttle, feet pressing the treadles — like a pianist. A plain stole takes 3–4 days. A Kani shawl takes 12–18 months.",
  },
  {
    num: 8,
    term: "Chapangur",
    title: "The Finishing",
    description:
      "The woven shawl is washed in spring water, struck against smooth river stones for softness. The Chapangur stretches and dries it on a wooden frame.",
  },
  {
    num: 9,
    term: "Voste",
    title: "The Final Touch",
    description:
      "The Voste examines every inch for flaws. Fringes are hand-knotted. If destined for embroidery, the Naqash draws the design and the Rafugar begins months of needlework.",
  },
];

const craftImages = [
  { src: `${CDN}/rearing1.jpg`, alt: "Changthangi goats grazing at 4,500m in Ladakh" },
  { src: `${CDN}/weaving-1.jpg`, alt: "Master weaver at the traditional Saaz handloom" },
  { src: `${CDN}/dye2.jpg`, alt: "Master dyer hand-dyeing Pashmina yarn" },
];

export default function CraftProcess() {
  const { open } = useImageModal();

  return (
    <section id="craft" className="bg-ivory bg-linen py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="reveal text-center">
          <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
            The Craft
          </p>
          <h2 className="mt-4 font-heading text-3xl font-bold text-charcoal sm:text-4xl lg:text-5xl">
            The Art of Pashmina
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-heading text-base italic text-charcoal/70 sm:text-lg">
            &ldquo;Twenty ancient processes transform Himalayan fleece into the world&rsquo;s most treasured cashmere fabric.&rdquo;
          </p>
        </div>

        {/* Stats row */}
        <div className="reveal mt-10 flex flex-wrap justify-center gap-8 text-center">
          {[
            { value: "12–16μm", label: "Fibre Fineness" },
            { value: "4,500m", label: "Altitude of Origin" },
            { value: "20+", label: "Hand Processes" },
            { value: "3–18mo", label: "Per Shawl" },
          ].map((s, i) => (
            <div key={i}>
              <p className="font-heading text-2xl font-bold text-burgundy">{s.value}</p>
              <p className="text-xs uppercase tracking-wider text-charcoal/70">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Image row */}
        <div className="reveal mt-12 grid grid-cols-3 gap-3 sm:gap-4">
          {craftImages.map((img, i) => (
            <div
              key={i}
              className="relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl"
              onClick={() => open(img.src, img.alt)}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 768px) 33vw, 300px"
              />
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="mt-16">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`reveal flex gap-6 ${i > 0 ? "mt-6" : ""}`}
            >
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-burgundy font-heading text-base font-bold text-gold">
                  {String(step.num).padStart(2, "0")}
                </div>
                {i < steps.length - 1 && (
                  <div className="my-1 w-px flex-1 bg-gradient-to-b from-gold/30 to-transparent" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                {step.term && (
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gold-text">
                    {step.term}
                  </p>
                )}
                <h3 className="font-heading text-xl font-bold text-charcoal sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/70 sm:text-base">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pull quote */}
        <div className="reveal mt-12 border-l-4 border-gold pl-6">
          <span className="font-heading text-5xl leading-none text-gold/30" aria-hidden="true">&ldquo;</span>
          <p className="mt-1 font-heading text-lg italic text-charcoal/80 sm:text-xl">
            The weaver works like a pianist — simultaneously controlling foot pedals and hand shuttles, reading the pattern from memory.
          </p>
        </div>

        {/* Video — Full Pashmina Process */}
        <div className="reveal mt-16">
          <p className="font-accent mb-3 text-center text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
            Watch the Full Process
          </p>
          <p className="mx-auto mb-6 max-w-xl text-center text-sm text-charcoal/70">
            From raw Changthangi fleece to finished Pashmina — every hand process captured in a single film.
          </p>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-gold/10 shadow-lg">
            <div className="relative aspect-video">
              <YouTubeFacade
                videoId="yT-aXywFA0I"
                title="From Thread to Pashmina — The Complete Journey"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
