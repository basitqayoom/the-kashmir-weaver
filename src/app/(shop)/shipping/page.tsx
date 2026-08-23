import type { Metadata } from "next";
import { PolicyPage } from "@/components/shop/PolicyPage";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
    title: "Shipping Policy",
    pathname: "/shipping",
});

export default function ShippingPage() {
    return <PolicyPage policyKey="shippingPolicy" />;
}
