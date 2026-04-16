import Link from "next/link";
import AnimatedLogo from "./AnimatedLogo";
import { siteConfig, whatsappLink } from "@/config/site";

const quickLinks = [
  { label: "Our Heritage", href: "#heritage" },
  { label: "Pashmina Types", href: "/pashmina-types" },
  { label: "Stories", href: "/blog" },
  { label: "Contact Us", href: "#contact" },
  { label: "Privacy Policy", href: "/privacy" },
];

const shopLinks = [
  { label: "Plain Pashmina", href: whatsappLink(siteConfig.whatsappMessages.product("Plain Pashmina")) },
  { label: "Kani Collection", href: whatsappLink(siteConfig.whatsappMessages.product("Kani Pashmina")) },
  { label: "Sozni Embroidery", href: whatsappLink(siteConfig.whatsappMessages.product("Sozni Embroidery")) },
  { label: "Jamawar", href: whatsappLink(siteConfig.whatsappMessages.product("Jamawar")) },
  { label: "Corporate Gifting", href: "#contact" },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal">
      {/* Gold accent top */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <AnimatedLogo size={44} variant="footer" />
              <div>
                <p className="font-heading text-xl font-bold text-ivory">The Kashmir Weaver</p>
                <p className="font-accent text-[9px] font-light tracking-[0.4em] text-gold">EST. IN THE VALLEY</p>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ivory/50">
              Preserving the 600-year heritage of Kashmiri Pashmina — handwoven by artisans, delivered to the world. Every fibre tells a story of the Himalayas.
            </p>
            {/* Social icons */}
            <div className="mt-6 flex gap-3">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 text-ivory/50 transition-all hover:border-gold/50 hover:text-gold"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href={siteConfig.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 text-ivory/50 transition-all hover:border-whatsapp/50 hover:text-whatsapp"
                aria-label="WhatsApp"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h4 className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold">
              Quick Links
            </h4>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-ivory/60 transition-colors hover:text-gold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop via WhatsApp */}
          <div className="lg:col-span-3">
            <h4 className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold">
              Shop via WhatsApp
            </h4>
            <ul className="mt-5 space-y-3">
              {shopLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-sm text-ivory/60 transition-colors hover:text-gold"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold">
              Visit Us
            </h4>
            <div className="mt-5 space-y-4 text-sm text-ivory/60">
              <p className="leading-relaxed">
                {siteConfig.name}<br />
                {siteConfig.address.line1}<br />
                {siteConfig.address.city}, {siteConfig.address.state} {siteConfig.address.postalCode}
              </p>
              <a
                href={siteConfig.address.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-gold transition-colors hover:text-ivory"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                View on Maps
              </a>
              <div className="space-y-1">
                <p>
                  <a href={`mailto:${siteConfig.contact.email}`} className="transition-colors hover:text-gold">
                    {siteConfig.contact.email}
                  </a>
                </p>
                <p>
                  <a href={`tel:${siteConfig.contact.phone}`} className="transition-colors hover:text-gold">
                    {siteConfig.contact.phoneDisplay}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ivory/8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-ivory/50">
            &copy; {new Date().getFullYear()} The Kashmir Weaver. Handwoven in Kashmir.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-ivory/50">
            <span>GI Tag No. 46</span>
            <span className="text-gold/30">◆</span>
            <span>MCA Registered</span>
            <span className="text-gold/30">◆</span>
            <Link href="/privacy" className="transition-colors hover:text-gold">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
