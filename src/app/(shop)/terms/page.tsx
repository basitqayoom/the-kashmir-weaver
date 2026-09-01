import type { Metadata } from "next";
import { PolicyPage } from "@/components/shop/PolicyPage";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
    title: "Terms of Service",
    description:
        "The terms governing purchases, wholesale enquiries and use of The Kashmir Weaver storefront, including pricing, authenticity and GI certification.",
    pathname: "/terms",
});

export default function TermsPage() {
    return <PolicyPage policyKey="termsOfService" />;
}
