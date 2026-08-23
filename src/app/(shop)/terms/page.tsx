import type { Metadata } from "next";
import { PolicyPage } from "@/components/shop/PolicyPage";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
    title: "Terms of Service",
    pathname: "/terms",
});

export default function TermsPage() {
    return <PolicyPage policyKey="termsOfService" />;
}
