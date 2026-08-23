"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { openCartDrawer, subscribeCartUi, getCartUiSnapshot, getCartUiServerSnapshot } from "@/lib/cart-ui";
import { whatsappLink } from "@/config/site";

function WhatsAppIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

function BagIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m-.75 10.5h9a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
    );
}

/**
 * Bottom-right FAB. WhatsApp-only when the bag is empty; once it has items
 * (and we're not already on the home/cart page) it becomes a two-item
 * speed-dial so the bag stays reachable without crowding the header.
 */
export default function FabSpeedDial() {
    const pathname = usePathname();
    const { cart } = useSyncExternalStore(subscribeCartUi, getCartUiSnapshot, getCartUiServerSnapshot);
    const cartQuantity = cart?.totalQuantity ?? 0;
    const [open, setOpen] = useState(false);

    const close = useCallback(() => setOpen(false), []);
    const toggle = useCallback(() => setOpen((v) => !v), []);

    const showCart = cartQuantity > 0 && pathname !== "/" && pathname !== "/cart";

    const handleCart = useCallback(() => {
        openCartDrawer();
        close();
    }, [close]);

    if (!showCart) {
        return (
            <nav aria-label="Quick actions">
                <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat with us on WhatsApp"
                    className="animate-pulse-fab group fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-whatsapp shadow-lg transition-shadow hover:shadow-xl sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
                >
                    <WhatsAppIcon className="h-6 w-6 text-white sm:h-7 sm:w-7" />
                    <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap bg-charcoal px-3 py-1.5 text-xs font-medium text-ivory opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                        Chat with us on WhatsApp
                    </span>
                </a>
            </nav>
        );
    }

    return (
        <nav aria-label="Quick actions" className="fixed bottom-4 right-4 z-40 flex flex-col items-center gap-3 sm:bottom-6 sm:right-6">
            {open && (
                <>
                    <button
                        type="button"
                        onClick={handleCart}
                        aria-label={`View your bag (${cartQuantity} items)`}
                        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-charcoal text-ivory shadow-lg transition-transform hover:scale-105 sm:h-14 sm:w-14"
                    >
                        <BagIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-charcoal">
                            {cartQuantity > 9 ? "9+" : cartQuantity}
                        </span>
                    </button>
                    <a
                        href={whatsappLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={close}
                        aria-label="Chat with us on WhatsApp"
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-whatsapp shadow-lg transition-transform hover:scale-105 sm:h-14 sm:w-14"
                    >
                        <WhatsAppIcon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                    </a>
                </>
            )}
            <button
                type="button"
                onClick={toggle}
                aria-label={open ? "Close quick actions" : "Open quick actions"}
                aria-expanded={open}
                className={`flex h-12 w-12 items-center justify-center rounded-full bg-gold text-charcoal shadow-lg transition-all hover:shadow-xl sm:h-14 sm:w-14 ${open ? "rotate-45" : ""}`}
            >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </nav>
    );
}
