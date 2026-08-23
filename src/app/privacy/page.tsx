import { siteConfig } from "@/config/site";
import Link from "next/link";
import Navbar from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/FabSpeedDial";
import { getShopPolicy } from "@/lib/shopify/policies";
import { LEGAL_HTML_CLASS } from "@/lib/shopify/legal-html-class";
import { seoBundle } from "@/lib/seo";

export const metadata = seoBundle({
  title: "Privacy Policy",
  description: "How The Kashmir Weaver collects, uses, and protects your personal information.",
  pathname: "/privacy",
});

export default async function PrivacyPage() {
  const shopPrivacyPolicy = await getShopPolicy("privacyPolicy");

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <h1 className="font-heading text-3xl font-bold text-charcoal">Privacy Policy</h1>
        <p className="mt-4 text-sm text-charcoal/70">Last updated: April 15, 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-charcoal/75">
          <section>
            <h2 className="font-heading text-lg font-bold text-charcoal">Information We Collect</h2>
            <p className="mt-2">
              When you submit an inquiry through our contact form, we collect your name, email address,
              phone number (if provided), inquiry type, company name (if provided), estimated volume,
              and message. This information is collected via Google Forms and delivered to our email.
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
              Our contact form is powered by Google Forms. Please refer to{" "}
              <a href="https://policies.google.com/privacy" className="text-gold-text underline" target="_blank" rel="noopener noreferrer">
                Google&rsquo;s privacy policy
              </a>{" "}
              for information on how they handle data.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-charcoal">Contact</h2>
            <p className="mt-2">
              For questions about this privacy policy, please contact us at{" "}
              <a href={`mailto:${siteConfig.contact.email}`} className="text-gold-text underline">
                {siteConfig.contact.email}
              </a>.
            </p>
          </section>

          {shopPrivacyPolicy && (
            <section>
              <h2 className="font-heading text-lg font-bold text-charcoal">
                Orders &amp; Checkout (Shopify)
              </h2>
              <p className="mt-2">
                When you place an order, checkout is handled by Shopify on our behalf. The
                policy below is Shopify&rsquo;s live {shopPrivacyPolicy.title.toLowerCase()},
                covering how your order, payment, and account data is processed.
              </p>
              <div
                className={`mt-4 rounded-xl border border-gold/15 bg-paper-alt p-5 ${LEGAL_HTML_CLASS}`}
                dangerouslySetInnerHTML={{ __html: shopPrivacyPolicy.body }}
              />
            </section>
          )}
        </div>

        <div className="mt-12">
          <Link href="/" className="text-sm font-semibold text-gold-text hover:text-gold-dark transition-colors">
            ← Back to Home
          </Link>
        </div>
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}
