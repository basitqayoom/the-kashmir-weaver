"use client";

/**
 * Display-only currency conversion — mirrors Hydrogen's DisplayCurrencyProvider/
 * useFormatPrice. Converts prices shown in the catalog/PDP using live FX rates;
 * cart and checkout always stay in the store's native currency (Shopify is the
 * source of truth there), which is why there are two separate formatter hooks.
 */

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import {
    DEFAULT_DISPLAY_CURRENCY,
    DISPLAY_CURRENCIES,
    CHECKOUT_CURRENCY,
    displayCurrencyOption,
    isDisplayCurrencyCode,
    type DisplayCurrencyOption,
} from "./display-currencies";
import { convertAmount, loadUsdFxRates, type FxRates } from "./fx-rates";

const STORAGE_KEY = "tkwDisplayCurrency";

function readStoredCurrency(): string {
    if (typeof window === "undefined") return DEFAULT_DISPLAY_CURRENCY;
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY)?.toUpperCase();
        if (stored && isDisplayCurrencyCode(stored)) return stored;
    } catch {
        // ignore
    }
    return DEFAULT_DISPLAY_CURRENCY;
}

/** Always renders whole units, matching the FX-converted (rounded) amount. */
export function formatWholeMoney(amount: number, currencyCode: string): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    }).format(amount);
}

type DisplayCurrencyContextValue = {
    currencies: DisplayCurrencyOption[];
    displayCurrency: DisplayCurrencyOption;
    checkoutCurrency: string;
    ratesReady: boolean;
    setDisplayCurrency: (code: string) => void;
    convertFrom: (amount: number, fromCurrencyCode: string) => number;
};

const DisplayCurrencyContext = createContext<DisplayCurrencyContextValue | null>(null);

export function DisplayCurrencyProvider({ children }: { children: ReactNode }) {
    // SSR + first client render always use the default so streamed Suspense
    // sections (e.g. HomeShopSection) hydrate against matching price text.
    // localStorage is applied in useEffect after hydration — same as Hydrogen.
    const [code, setCode] = useState(DEFAULT_DISPLAY_CURRENCY);
    const [rates, setRates] = useState<FxRates | null>(null);

    useEffect(() => {
        setCode(readStoredCurrency());
    }, []);

    useEffect(() => {
        let cancelled = false;
        loadUsdFxRates().then((data) => {
            if (!cancelled) setRates(data);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const setDisplayCurrency = useCallback((nextCode: string) => {
        const normalized = nextCode.toUpperCase();
        if (!isDisplayCurrencyCode(normalized)) return;
        setCode((current) => {
            if (current === normalized) return current;
            try {
                window.localStorage.setItem(STORAGE_KEY, normalized);
            } catch {
                // ignore
            }
            return normalized;
        });
    }, []);

    const ratesReady = Boolean(rates && Object.keys(rates.rates).length > 1);

    const convertFrom = useCallback(
        (amount: number, fromCurrencyCode: string) => {
            if (!rates) return amount;
            return convertAmount(amount, fromCurrencyCode, code, rates.rates);
        },
        [rates, code]
    );

    const value = useMemo<DisplayCurrencyContextValue>(
        () => ({
            currencies: DISPLAY_CURRENCIES,
            displayCurrency: displayCurrencyOption(code),
            checkoutCurrency: CHECKOUT_CURRENCY,
            ratesReady,
            setDisplayCurrency,
            convertFrom,
        }),
        [code, ratesReady, setDisplayCurrency, convertFrom]
    );

    return <DisplayCurrencyContext.Provider value={value}>{children}</DisplayCurrencyContext.Provider>;
}

export function useDisplayCurrency(): DisplayCurrencyContextValue {
    const ctx = useContext(DisplayCurrencyContext);
    if (!ctx) throw new Error("useDisplayCurrency must be used within DisplayCurrencyProvider");
    return ctx;
}

type Money = { amount: string; currencyCode: string };

/** Approximate display price in the visitor's chosen currency (catalog/PDP). */
export function useFormatPrice() {
    const { displayCurrency, convertFrom, checkoutCurrency, ratesReady } = useDisplayCurrency();

    return useCallback(
        (money: Money) => {
            const sourceCode = money.currencyCode || checkoutCurrency;
            if (displayCurrency.code === checkoutCurrency || !ratesReady) {
                return formatWholeMoney(Number(money.amount), sourceCode);
            }
            const converted = convertFrom(Number(money.amount), sourceCode);
            return formatWholeMoney(Math.round(converted), displayCurrency.code);
        },
        [checkoutCurrency, convertFrom, displayCurrency.code, ratesReady]
    );
}

/** Native store currency — always used for cart/checkout, never converted. */
export function useCheckoutFormatPrice() {
    return useCallback(
        (money: Money) => formatWholeMoney(Number(money.amount), money.currencyCode || CHECKOUT_CURRENCY),
        []
    );
}
