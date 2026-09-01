"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { addToCartAction } from "@/app/(shop)/cart/actions";
import { useFormatPrice, useDisplayCurrency } from "@/lib/display-currency";
import {
    maxCartQuantity,
    showQuantitySelector,
    variantScarcityLabel,
} from "@/lib/shopify/inventory";
import { openCartDrawer, notifyCartUpdated } from "@/lib/cart-ui";
import { trackAddToCart, trackViewItem } from "@/components/GoogleAnalytics";
import { trackAddToCartMeta, trackViewContent } from "@/components/MetaPixel";
import { trackPinterestAddToCart, trackPinterestCheckout } from "@/components/PinterestTag";
import {
    optionDisplayName,
    parseSizeOptionValue,
    isSizeOptionName,
    isDefaultOption,
    formatVariantWeight,
} from "@/lib/shopify/parse-size-option";
import type { ProductDetail } from "@/lib/shopify/types";
import { siteConfig, whatsappLink } from "@/config/site";
import {
    findShadeByCode,
    getDefaultShadeCode,
    getProductShades,
    productUsesColourStudio,
} from "@/lib/shopify/colour-studio";
import { shadeCartAttributes, buildBuyNowShadeQuery } from "@/lib/shopify/shade-cart";
import { gidTail } from "@/lib/tracking-ids";
import { trackBeginCheckout } from "@/components/GoogleAnalytics";
import { trackInitiateCheckout } from "@/components/MetaPixel";
import ShadeSwatchStack from "./ShadeSwatchStack";
import SelectedColourCard from "./SelectedColourCard";
import ColourStudioModal from "./ColourStudioModal";
import Spinner from "@/components/Spinner";

export default function VariantPicker({
    product,
    selected: controlledSelected,
    onSelectedChange,
    selectedShadeCode: controlledShadeCode,
    onShadeCodeChange,
    initialShadeCode,
}: {
    product: ProductDetail;
    selected?: Record<string, string>;
    onSelectedChange?: (selected: Record<string, string>) => void;
    selectedShadeCode?: string;
    onShadeCodeChange?: (code: string) => void;
    /** Deep link from home Colour Studio (`?shadeCode=`). */
    initialShadeCode?: string | null;
}) {
    const variants = product.variants.nodes;

    const [internalSelected, setInternalSelected] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        product.options.forEach((opt) => {
            initial[opt.name] = opt.values[0];
        });
        return initial;
    });
    const selected = controlledSelected ?? internalSelected;
    const setSelected = onSelectedChange ?? setInternalSelected;
    const [quantity, setQuantity] = useState(1);
    const [isPending, startTransition] = useTransition();
    const [added, setAdded] = useState(false);

    const productShades = useMemo(() => getProductShades(product), [product]);
    const visibleOptions = useMemo(
        () => product.options.filter((option) => !isDefaultOption(option)),
        [product.options]
    );
    const usesColourStudio = productUsesColourStudio(product);
    const [internalShadeCode, setInternalShadeCode] = useState(() => {
        const fromLink = initialShadeCode?.trim();
        if (fromLink && findShadeByCode(productShades, fromLink)) return fromLink;
        return getDefaultShadeCode(productShades);
    });
    const selectedShadeCode = controlledShadeCode ?? internalShadeCode;
    const setSelectedShadeCode = onShadeCodeChange ?? setInternalShadeCode;
    const [studioOpen, setStudioOpen] = useState(false);
    const selectedShade = useMemo(
        () => findShadeByCode(productShades, selectedShadeCode) ?? productShades[0] ?? null,
        [productShades, selectedShadeCode]
    );

    const matchedVariant = useMemo(
        () =>
            variants.find((v) =>
                v.selectedOptions.every((o) => selected[o.name] === o.value)
            ) ?? null,
        [variants, selected]
    );

    useEffect(() => {
        const price = matchedVariant?.price ?? product.priceRange.minVariantPrice;
        const gaItem = {
            item_id: matchedVariant?.id ?? product.id,
            item_name: product.title,
            item_brand: product.vendor,
            item_category: product.productType,
            price: Number(price.amount),
        };
        trackViewItem(gaItem, price.currencyCode);
        trackViewContent({
            content_ids: [matchedVariant?.id ?? product.id],
            content_type: "product",
            content_name: product.title,
            content_category: product.productType,
            value: Number(price.amount),
            currency: price.currencyCode,
        });
        // Fire once per product page view, not on every variant selection change.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product.handle]);

    // Mirrors Hydrogen's ProductView: `custom.request_price` fully replaces the
    // buy box with a "Request price" WhatsApp CTA — no price, no add-to-cart.
    const inquirePrice = product.requestPrice?.value === "true";
    const isLimited = product.limited?.value === "true";

    const price = matchedVariant?.price ?? product.priceRange.minVariantPrice;
    const compareAt = matchedVariant?.compareAtPrice;
    const formatPrice = useFormatPrice();
    const { displayCurrency, checkoutCurrency, ratesReady } = useDisplayCurrency();
    const showCurrencyNote =
        ratesReady && displayCurrency.code !== checkoutCurrency;
    const onSale = Boolean(compareAt && Number(compareAt.amount) > Number(price.amount));
    const soldOut = matchedVariant ? !matchedVariant.availableForSale : false;
    const scarcityLabel = variantScarcityLabel(matchedVariant);
    const canStepQuantity = showQuantitySelector(matchedVariant);
    const maxQty = maxCartQuantity(matchedVariant);

    const requestPriceHref = whatsappLink(
        siteConfig.whatsappMessages.product(product.title)
    );

    const buyNowQuantity = canStepQuantity ? quantity : 1;
    const buyNowHref = matchedVariant
        ? (() => {
            const variantId = gidTail(matchedVariant.id);
            const shadeQuery = usesColourStudio ? buildBuyNowShadeQuery(selectedShade) : "";
            return `/cart/${variantId}:${buyNowQuantity}${shadeQuery ? `?${shadeQuery}` : ""}`;
        })()
        : "/cart";

    function trackBuyNowClick() {
        if (!matchedVariant) return;
        const gaItem = {
            item_id: matchedVariant.id,
            item_name: product.title,
            item_variant: matchedVariant.title,
            item_brand: product.vendor,
            item_category: product.productType,
            price: Number(matchedVariant.price.amount),
            quantity: buyNowQuantity,
        };
        trackBeginCheckout(
            [gaItem],
            Number(matchedVariant.price.amount) * buyNowQuantity,
            matchedVariant.price.currencyCode
        );
        trackInitiateCheckout({
            content_ids: [matchedVariant.id],
            content_type: "product",
            content_name: product.title,
            content_category: product.productType,
            contents: [
                {
                    id: matchedVariant.id,
                    quantity: buyNowQuantity,
                    item_price: Number(matchedVariant.price.amount),
                },
            ],
            value: Number(matchedVariant.price.amount) * buyNowQuantity,
            currency: matchedVariant.price.currencyCode,
            num_items: buyNowQuantity,
        });
        trackPinterestCheckout(
            [
                {
                    product_id: matchedVariant.id,
                    product_name: product.title,
                    product_price: Number(matchedVariant.price.amount),
                    product_quantity: buyNowQuantity,
                    product_category: product.productType,
                    product_brand: product.vendor,
                },
            ],
            Number(matchedVariant.price.amount) * buyNowQuantity,
            matchedVariant.price.currencyCode,
        );
    }

    function handleAddToCart() {
        if (!matchedVariant) return;
        startTransition(async () => {
            const shadeAttrs = usesColourStudio ? shadeCartAttributes(selectedShade) : [];
            await addToCartAction(matchedVariant.id, quantity, shadeAttrs);
            notifyCartUpdated();
            openCartDrawer();
            setAdded(true);
            setTimeout(() => setAdded(false), 2500);
            const gaItem = {
                item_id: matchedVariant.id,
                item_name: product.title,
                item_variant: matchedVariant.title,
                item_brand: product.vendor,
                item_category: product.productType,
                price: Number(matchedVariant.price.amount),
                quantity,
            };
            trackAddToCart(gaItem, matchedVariant.price.currencyCode);
            trackAddToCartMeta({
                content_ids: [matchedVariant.id],
                content_type: "product",
                content_name: product.title,
                content_category: product.productType,
                contents: [
                    {
                        id: matchedVariant.id,
                        quantity,
                        item_price: Number(matchedVariant.price.amount),
                    },
                ],
                value: Number(matchedVariant.price.amount) * quantity,
                currency: matchedVariant.price.currencyCode,
                num_items: quantity,
            });
            trackPinterestAddToCart(
                [
                    {
                        product_id: matchedVariant.id,
                        product_name: product.title,
                        product_price: Number(matchedVariant.price.amount),
                        product_quantity: quantity,
                        product_category: product.productType,
                        product_brand: product.vendor,
                    },
                ],
                Number(matchedVariant.price.amount) * quantity,
                matchedVariant.price.currencyCode,
            );
        });
    }

    const purchaseButtons = soldOut ? null : (
        <div className="flex gap-2">
            <button
                type="button"
                disabled={!matchedVariant || isPending}
                onClick={handleAddToCart}
                className="font-accent flex flex-1 items-center justify-center gap-2 bg-gold px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal transition-all hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isPending && <Spinner size="sm" label="Adding to bag" />}
                {isPending ? "Adding…" : added ? "Added" : "Add to Bag"}
            </button>
            <a
                href={buyNowHref}
                onClick={trackBuyNowClick}
                className="font-accent flex-1 border border-charcoal/20 px-4 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal transition-colors hover:border-gold/40"
            >
                Buy Now
            </a>
        </div>
    );

    if (inquirePrice) {
        return (
            <div>
                {isLimited && (
                    <span className="font-accent inline-block border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-gold-text">
                        Limited Edition
                    </span>
                )}
                <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                    This piece is priced on request — message us on WhatsApp for pricing,
                    availability, and lead time.
                </p>
                <a
                    href={requestPriceHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-accent mt-6 flex w-full items-center justify-center gap-2 bg-whatsapp px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory transition-opacity hover:opacity-90"
                >
                    Request Price on WhatsApp
                </a>
            </div>
        );
    }

    return (
        <>
            <div>
                {isLimited && (
                    <span className="font-accent mb-3 inline-block border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-gold-text">
                        Limited Edition
                    </span>
                )}

                <div className="text-price flex items-baseline gap-3 text-3xl text-charcoal">
                    <span>{formatPrice(price)}</span>
                    {onSale && compareAt && (
                        <span className="text-base text-charcoal/70 line-through">
                            {formatPrice(compareAt)}
                        </span>
                    )}
                </div>
                {showCurrencyNote && (
                    <p className="mt-1 text-xs text-charcoal/70">
                        Approximate {displayCurrency.code} · checkout in {checkoutCurrency}
                    </p>
                )}
                {matchedVariant?.sku && (
                    <p className="mt-2 font-accent text-[10px] uppercase tracking-[0.15em] text-charcoal/70">
                        SKU {matchedVariant.sku}
                    </p>
                )}
                {scarcityLabel && (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-burgundy">
                        {scarcityLabel}
                    </p>
                )}

                {usesColourStudio && (
                    <div className="mt-6">
                        <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-charcoal/70">Colour</p>
                        <div className="mt-2">
                            {selectedShade ? (
                                <SelectedColourCard shade={selectedShade} compact />
                            ) : null}
                            <button
                                type="button"
                                onClick={() => setStudioOpen(true)}
                                className="mt-2 flex w-full items-center justify-between gap-3 border border-charcoal/15 px-4 py-3 text-left transition-colors hover:border-gold/40"
                            >
                                <span className="flex items-center gap-3">
                                    <ShadeSwatchStack shades={productShades} maxVisible={4} />
                                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-charcoal">
                                        Try new colours
                                    </span>
                                </span>
                                <svg className="h-4 w-4 text-charcoal/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>
                        </div>
                        <ColourStudioModal
                            open={studioOpen}
                            onClose={() => setStudioOpen(false)}
                            shades={productShades}
                            selectedCode={selectedShadeCode}
                            productName={product.title}
                            onConfirm={(shade) => setSelectedShadeCode(shade.code)}
                            priceLabel={formatPrice(price)}
                            purchaseControls={purchaseButtons}
                        />
                    </div>
                )}

                {visibleOptions.map((option) => (
                    <div key={option.name} className="mt-6">
                        <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-charcoal/70">
                            {optionDisplayName(option.name)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {option.values.map((value) => {
                                const isSelected = selected[option.name] === value;
                                const { label, dimensions } = isSizeOptionName(option.name)
                                    ? parseSizeOptionValue(value)
                                    : { label: value, dimensions: undefined };
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => {
                                            setSelected({ ...selected, [option.name]: value });
                                            setQuantity(1);
                                        }}
                                        aria-pressed={isSelected}
                                        className={`border px-4 py-2 text-xs transition-colors ${isSelected
                                            ? "border-gold bg-gold/10 font-semibold text-gold-text"
                                            : "border-charcoal/15 text-charcoal/70 hover:border-gold/40"
                                            }`}
                                    >
                                        {label}
                                        {dimensions && (
                                            <span className="ml-1.5 text-charcoal/70">{dimensions}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {matchedVariant && formatVariantWeight(matchedVariant.weight, matchedVariant.weightUnit) && (
                    <p className="mt-2 text-xs text-charcoal/70">
                        Weight: {formatVariantWeight(matchedVariant.weight, matchedVariant.weightUnit)}
                    </p>
                )}

                {canStepQuantity && (
                    <div className="mt-6">
                        <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-charcoal/70">
                            Quantity
                        </p>
                        <div className="mt-2 inline-flex items-center border border-charcoal/15">
                            <button
                                type="button"
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                                className="px-4 py-2 text-charcoal/70 disabled:opacity-40"
                                aria-label="Decrease quantity"
                            >
                                −
                            </button>
                            <span className="w-10 text-center text-sm text-charcoal">{quantity}</span>
                            <button
                                type="button"
                                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                                disabled={quantity >= maxQty}
                                className="px-4 py-2 text-charcoal/70 disabled:opacity-40"
                                aria-label="Increase quantity"
                            >
                                +
                            </button>
                        </div>
                    </div>
                )}

                {soldOut ? (
                    <div className="mt-8 space-y-3">
                        <button
                            type="button"
                            disabled
                            className="font-accent w-full cursor-not-allowed border border-charcoal/15 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal/40"
                        >
                            Sold Out
                        </button>
                        <a
                            href={requestPriceHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-accent flex w-full items-center justify-center gap-2 border border-whatsapp/40 px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-whatsapp transition-colors hover:bg-whatsapp/5"
                        >
                            Ask About Restock
                        </a>
                    </div>
                ) : (
                    <div className="mt-8 hidden lg:block">{purchaseButtons}</div>
                )}
            </div>

            {!inquirePrice && !soldOut && matchedVariant && (
                <div
                    className="fixed inset-x-0 bottom-0 z-40 border-t border-charcoal/10 bg-ivory px-4 py-3 lg:hidden"
                    style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
                >
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                        <p className="truncate text-sm font-medium text-charcoal">{product.title}</p>
                        <p className="text-price text-lg text-charcoal">{formatPrice(price)}</p>
                    </div>
                    {purchaseButtons}
                </div>
            )}
        </>
    );
}

