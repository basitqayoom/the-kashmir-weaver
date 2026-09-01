import type { Metadata } from "next";
import { PolicyPage } from "@/components/shop/PolicyPage";
import { seoBundle } from "@/lib/seo";

export const metadata: Metadata = seoBundle({
    title: "Returns & Refunds",
    description:
        "Our 14-day returns and refunds policy for handwoven Kashmiri Pashmina \u2014 eligibility, condition requirements, and how to start a return by mail.",
    pathname: "/returns",
});

export default function ReturnsPage() {
    return <PolicyPage policyKey="refundPolicy" />;
}
