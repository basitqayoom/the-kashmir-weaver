import { notFound } from "next/navigation";
import Link from "next/link";
import { getShopPolicy, type PolicyKey } from "@/lib/shopify/policies";
import { LEGAL_HTML_CLASS } from "@/lib/shopify/legal-html-class";

export async function PolicyPage({ policyKey }: { policyKey: PolicyKey }) {
    const policy = await getShopPolicy(policyKey);
    if (!policy) notFound();

    return (
        <main className="bg-ivory">
            <div className="reveal mx-auto max-w-3xl px-4 py-16 sm:px-6">
                <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold-text">
                    The Kashmir Weaver &middot; Legal
                </p>
                <h1 className="mt-3 font-heading text-3xl font-bold text-charcoal sm:text-4xl">
                    {policy.title}
                </h1>
                <div
                    className={`mt-8 ${LEGAL_HTML_CLASS}`}
                    dangerouslySetInnerHTML={{ __html: policy.body }}
                />
                <div className="mt-12">
                    <Link
                        href="/"
                        className="text-sm font-semibold text-gold transition-colors hover:text-gold-dark"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}
