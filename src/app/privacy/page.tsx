import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How The Kashmir Weaver collects, uses, and protects your personal information.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-charcoal">Privacy Policy</h1>
      <p className="mt-4 text-sm text-charcoal/70">Last updated: April 15, 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-charcoal/75">
        <section>
          <h2 className="font-heading text-lg font-bold text-charcoal">Information We Collect</h2>
          <p className="mt-2">
            When you submit an inquiry through our contact form, we collect your name, email address,
            phone number (if provided), inquiry type, company name (if provided), estimated volume,
            and message. This information is sent to us via Formspree and delivered to our email.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-charcoal">How We Use Your Information</h2>
          <p className="mt-2">
            We use the information you provide solely to respond to your inquiry, process your order,
            and provide customer service. We do not sell, rent, or share your personal information
            with third parties for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-charcoal">Cookies</h2>
          <p className="mt-2">
            We use minimal cookies to remember your cookie consent preference. We do not use
            tracking cookies or third-party analytics cookies at this time.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-charcoal">Third-Party Services</h2>
          <p className="mt-2">
            Our contact form is powered by Formspree. Please refer to{" "}
            <a href="https://formspree.io/legal/privacy-policy" className="text-gold underline" target="_blank" rel="noopener noreferrer">
              Formspree&rsquo;s privacy policy
            </a>{" "}
            for information on how they handle data.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-charcoal">Contact</h2>
          <p className="mt-2">
            For questions about this privacy policy, please contact us at{" "}
            <a href={`mailto:${siteConfig.contact.email}`} className="text-gold underline">
              {siteConfig.contact.email}
            </a>.
          </p>
        </section>
      </div>

      <div className="mt-12">
        <a href="/" className="text-sm font-semibold text-gold hover:text-gold-dark transition-colors">
          ← Back to Home
        </a>
      </div>
    </main>
  );
}
