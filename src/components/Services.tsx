"use client";

import Image from "next/image";
import { whatsappLink, siteConfig } from "@/config/site";
import { useImageModal } from "./ImageModal";

const CDN = "https://cdn.shopify.com/s/files/1/0175/0928/files";

const b2bCards = [
  {
    title: "Corporate Gifting",
    description: "Custom branding, personalized messaging, and executive heritage box packaging for teams of any size.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    title: "Boutique Partnerships",
    description: "Curated collections, dropship-friendly logistics, and flexible MOQs starting from 10 pieces.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z" />
      </svg>
    ),
  },
  {
    title: "Private Wealth Gifts",
    description: "Bespoke one-of-a-kind pieces with white-glove service and certificate of authenticity.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
];

const benefits = [
  {
    label: "Volume Ordering",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    label: "International Fulfillment",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    label: "Custom Branding",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    label: "Dedicated Account Manager",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
];

export default function Services() {
  const { open } = useImageModal();

  return (
    <section id="services" className="bg-ivory bg-linen py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center">
          <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
            Who We Serve
          </p>
          <h2 className="mt-4 font-heading text-3xl font-bold text-charcoal sm:text-4xl lg:text-5xl">
            For Individuals &amp; Businesses
          </h2>
        </div>

        {/* B2C Section */}
        <div className="reveal mt-16 overflow-hidden rounded-2xl border border-gold/15 bg-white shadow-sm">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-10 lg:p-12">
              <p className="text-xs font-bold uppercase tracking-widest text-burgundy">
                For You
              </p>
              <h3 className="mt-3 font-heading text-3xl font-bold text-charcoal">
                Own a Piece of Heritage
              </h3>
              <ul className="mt-6 space-y-3">
                {[
                  "Handwoven luxury directly from artisan",
                  "Perfect personal indulgence or gift",
                  "Certificate of authenticity with every purchase",
                  "Premium heritage box packaging available",
                  "Worldwide shipping with tracking",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-charcoal/75 sm:text-base">
                    <svg className="mt-1 h-4 w-4 flex-shrink-0 text-gold" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <a
                  href={whatsappLink(siteConfig.whatsappMessages.purchase)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-8 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Browse &amp; Order via WhatsApp
                </a>
              </div>
            </div>
            <div
              className="relative hidden cursor-pointer lg:block"
              onClick={() => open(`${CDN}/dal-lake.jpg`, "Dal Lake, Kashmir — the valley where Pashmina is handwoven")}
            >
              <Image
                src={`${CDN}/dal-lake.jpg`}
                alt="Dal Lake, Kashmir — the valley where Pashmina is handwoven"
                fill
                className="object-cover"
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent" />
            </div>
          </div>
        </div>

        {/* Flourish */}
        <div className="divider-gold" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#D4AF37" opacity="0.4" />
          </svg>
        </div>

        {/* B2B Section */}
        <div className="reveal">
          <div className="grid gap-6 sm:grid-cols-3">
            {b2bCards.map((card, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-gold/15 bg-white p-8 text-center shadow-sm transition-all hover:border-gold/30 hover:shadow-md"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-burgundy/10 text-burgundy transition-colors group-hover:bg-burgundy group-hover:text-gold">
                  {card.icon}
                </div>
                <h4 className="mt-5 font-heading text-xl font-bold text-charcoal">
                  {card.title}
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{card.description}</p>
              </div>
            ))}
          </div>

          {/* Benefits row */}
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            {benefits.map((b, i) => (
              <span key={i} className="flex items-center gap-2.5 text-sm font-medium text-charcoal/70">
                <span className="text-gold">{b.icon}</span>
                {b.label}
              </span>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a
              href="#contact"
              className="inline-block rounded-full bg-burgundy px-8 py-3.5 text-sm font-semibold text-ivory transition-all hover:scale-105 hover:bg-burgundy-light"
            >
              Request Wholesale Catalog
            </a>
          </div>
        </div>

        {/* Bespoke subsection */}
        <div className="reveal mt-16 overflow-hidden rounded-2xl bg-charcoal">
          <div className="grid lg:grid-cols-5">
            <div className="p-8 sm:p-10 lg:col-span-3 lg:p-12">
              <p className="text-xs font-bold uppercase tracking-widest text-gold">
                Bespoke &amp; Custom
              </p>
              <h3 className="mt-3 font-heading text-3xl font-bold text-ivory">
                Made to Your Vision
              </h3>
              <p className="mt-4 text-base leading-relaxed text-ivory/70">
                Custom embroidery designs, colour and fibre selection, size and weight specification,
                private labelling, wedding and event orders — we bring your vision to life in genuine
                Kashmiri Pashmina.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {["Plain: 4–6 weeks", "Embroidered: 8–16 weeks", "Kani: up to 6 months"].map((t, i) => (
                  <span key={i} className="rounded-full border border-gold/25 px-4 py-1.5 text-sm text-ivory/70">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-8">
                <a
                  href={whatsappLink(siteConfig.whatsappMessages.custom)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-sm font-semibold text-charcoal transition-all hover:scale-105"
                >
                  Discuss Your Custom Order
                </a>
              </div>
            </div>
            <div
              className="relative hidden cursor-pointer lg:col-span-2 lg:block"
              onClick={() => open(`${CDN}/jamawar-embroidery-artisan.jpg`, "Jamawar embroidery artisan working on custom Pashmina")}
            >
              <Image
                src={`${CDN}/jamawar-embroidery-artisan.jpg`}
                alt="Jamawar embroidery artisan working on custom Pashmina"
                fill
                className="object-cover"
                sizes="40vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
