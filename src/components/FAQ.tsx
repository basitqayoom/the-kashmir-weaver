"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";

const faqs = [
  {
    q: "What is the difference between Pashmina and Cashmere?",
    a: 'Both come from goats, and the word "cashmere" derives from "Kashmir." True Pashmina uses fibre from the Changthangi goat of Ladakh, measuring 12–16 microns — significantly finer than commercial cashmere (18–22 microns). Pashmina is hand-spun and hand-woven; most cashmere is machine-processed. The result: Pashmina is warmer, softer, lighter, and lasts decades longer.',
  },
  {
    q: "How do I know if a Pashmina shawl is genuine?",
    a: "The only reliable proof is the GI mark — Geographical Indication No. 46, issued by the Government of India after lab testing at PTQCC in Srinagar. The popular \"ring test\" is a myth — many synthetics pass it. A burn test can confirm natural fibre, but only GI certification confirms it is specifically Changthangi Pashm. Every Kashmir Weaver piece carries this mark.",
  },
  {
    q: "How is a Pashmina shawl made?",
    a: "Over 20 hand processes: the fibre is hand-combed from Changthangi goats in Ladakh, dehaired, hand-spun, hand-dyed, and hand-woven on a wooden Saaz loom. After weaving, the shawl is washed in spring water and struck against river stones for softness. If embroidered, months or years of additional needlework follow. Zero machines at any stage.",
  },
  {
    q: "Why is Pashmina so expensive?",
    a: "Rarity and craft time. Each goat yields only 80–170g of raw fibre per year. A single shawl requires months of hand-processing. Kani weaving takes 12–18 months. Sozni embroidery takes 7–10 years to learn. Fewer than 900 active Kani weavers remain worldwide. You are paying for irreplaceable human skill and centuries of tradition.",
  },
  {
    q: "What sizes are available?",
    a: "Stole: 70×200cm · Shawl: 100×200cm · Large Square: 137×137cm · Oversized Wrap: 100×250–300cm. Custom sizes are available for bespoke orders.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes. We ship worldwide — USA, UK, Canada, Europe, UAE, Australia, and more. All shipments are tracked and insured.",
  },
  {
    q: "How do I care for a Pashmina shawl?",
    a: "Dry clean for best results. If hand washing: use lukewarm water with mild detergent, never wring or twist. Lay flat to dry away from direct sunlight. Store folded in breathable fabric with cedar or lavender. Pashmina actually improves with age — it gets softer over decades.",
  },
  {
    q: "Do you offer custom/bespoke orders?",
    a: "Absolutely. Custom embroidery designs, colour selection, sizing, private labelling, and wedding/event orders are all available. Lead times: plain 4–6 weeks, embroidered 8–16 weeks, Kani up to 6 months.",
  },
  {
    q: "What is the Executive Heritage Box?",
    a: "A handcrafted walnut-wood case lined with silk, containing the shawl, GI certificate of authenticity, artisan story card, and (for corporate orders) custom branding and personalised messaging. It transforms a gift into an experience.",
  },
  {
    q: "How do I place an order?",
    a: `Three ways: browse our latest collection on Instagram (${siteConfig.social.instagramHandle}), message us on WhatsApp (${siteConfig.contact.phoneDisplay}), or fill out the inquiry form below. We'll guide you personally through selection, sizing, and customisation.`,
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-ivory bg-linen py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center">
          <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold">
            FAQ
          </p>
          <h2 className="mt-4 font-heading text-3xl font-bold text-charcoal sm:text-4xl">
            Common Questions
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="reveal rounded-xl border border-gold/10 bg-white/70 shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${i}`}
                >
                  <span className="pr-4 font-heading text-base font-semibold text-charcoal sm:text-lg">
                    {faq.q}
                  </span>
                  <span className="flex-shrink-0 text-gold transition-transform duration-300" style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0)" }}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </button>
                <div
                  id={`faq-answer-${i}`}
                  role="region"
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? "500px" : "0" }}
                >
                  <p className="px-6 pb-5 text-sm leading-relaxed text-charcoal/70">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
