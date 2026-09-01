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
            <h2 className="font-heading text-lg font-bold text-charcoal">Cookies &amp; Tracking</h2>
            <p className="mt-2">
              Essential cookies remember your cookie consent preference and your cart. Nothing else
              loads until you choose. If you accept, we may set analytics cookies (Google Analytics 4)
              and advertising cookies (Meta Pixel, Pinterest Tag) to measure how the store is used and
              to measure advertising performance. Google Consent Mode v2 is used so advertising and
              analytics storage stay denied unless you grant them.
            </p>
            <p className="mt-2">
              You can decline all non-essential cookies, or choose analytics and marketing separately,
              from the consent banner. Declining does not affect your ability to browse or order.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-charcoal">Third-Party Services</h2>
            <p className="mt-2">
              With your consent we use{" "}
              <a href="https://policies.google.com/privacy" className="text-gold-text underline" target="_blank" rel="noopener noreferrer">
                Google Analytics
              </a>
              ,{" "}
              <a href="https://www.facebook.com/privacy/policy" className="text-gold-text underline" target="_blank" rel="noopener noreferrer">
                Meta
              </a>{" "}
              and{" "}
              <a href="https://policy.pinterest.com/en/privacy-policy" className="text-gold-text underline" target="_blank" rel="noopener noreferrer">
                Pinterest
              </a>
              . Orders and checkout are processed by Shopify. Please refer to each provider&rsquo;s
              privacy policy for details on how they handle data.
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
