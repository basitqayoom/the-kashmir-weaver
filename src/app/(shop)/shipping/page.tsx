import type { Metadata } from "next";
import { PolicyPage } from "@/components/shop/PolicyPage";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
    title: "Shipping Policy",
    description:
        "Worldwide shipping from Srinagar, Kashmir \u2014 delivery timelines, tracked dispatch, duties and taxes, and free shipping thresholds for Pashmina orders.",
    pathname: "/shipping",
});

export default function ShippingPage() {
    return <PolicyPage policyKey="shippingPolicy" />;
}
