import type { Metadata } from "next";
import { PolicyPage } from "@/components/shop/PolicyPage";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
    title: "Returns & Refunds",
    pathname: "/returns",
});

export default function ReturnsPage() {
    return <PolicyPage policyKey="refundPolicy" />;
}
