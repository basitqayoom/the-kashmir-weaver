"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Collection } from "@/lib/shopify/types";

/** Desktop "Collections" nav item — click-to-open dropdown of Shopify collections. */
export default function CollectionsNavDropdown({ collections }: { collections: Collection[] }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: PointerEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    if (collections.length === 0) return null;

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-haspopup="true"
                className="group relative inline-flex items-center gap-1 py-1 font-accent text-[11px] font-light tracking-[0.2em] uppercase text-charcoal/80 transition-colors hover:text-charcoal"
            >
                Collections
                <svg
                    className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold transition-all duration-300 ease-out group-hover:w-full" aria-hidden="true" />
            </button>

            {open && (
                <div className="absolute left-1/2 top-full z-10 mt-3 w-56 -translate-x-1/2 border border-charcoal/10 bg-ivory py-2 shadow-lg">
                    {collections.map((c) => (
                        <Link
                            key={c.handle}
                            href={`/collections/${c.handle}`}
                            onClick={() => setOpen(false)}
                            className="block px-4 py-2 text-sm text-charcoal/80 transition-colors hover:bg-paper-alt hover:text-gold-text"
                        >
                            {c.title}
                        </Link>
                    ))}
                    <Link
                        href="/collections"
                        onClick={() => setOpen(false)}
                        className="mt-1 block border-t border-charcoal/10 px-4 pt-2 text-xs uppercase tracking-[0.15em] text-gold-text transition-colors hover:text-gold-dark"
                    >
                        View All Collections
                    </Link>
                </div>
            )}
        </div>
    );
}
