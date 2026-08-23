"use client";

/**
 * The Kashmir Weaver — theme controller (light/dark/system).
 *
 * Mirrors the Hydrogen storefront's theme system so behaviour matches
 * across both properties: `system` defers to `prefers-color-scheme`;
 * `resolved` is what actually gets painted via `<html data-theme>`.
 * The `ThemeBootScript` (rendered in the root layout) paints `<html>`
 * before first paint using the same `tkw-theme` localStorage key, so
 * there is no flash of the wrong theme and no hydration mismatch.
 */

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from "react";
import { STORAGE_KEY } from "./theme-boot-script";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const VALID_MODES = new Set<ThemeMode>(["light", "dark", "system"]);

// SSR has no window; fall back to a no-op effect so the provider doesn't warn.
const useIsomorphicLayoutEffect =
    typeof window === "undefined" ? useEffect : useLayoutEffect;

function isThemeMode(value: unknown): value is ThemeMode {
    return typeof value === "string" && VALID_MODES.has(value as ThemeMode);
}

function readStoredMode(): ThemeMode {
    if (typeof window === "undefined") return "system";
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return isThemeMode(raw) ? raw : "system";
    } catch {
        return "system";
    }
}

function readBootAttribute(name: string): string | null {
    if (typeof document === "undefined") return null;
    return document.documentElement.getAttribute(name);
}

function readBootModeFromDom(): ThemeMode {
    const v = readBootAttribute("data-theme-mode");
    return isThemeMode(v) ? v : "system";
}

function systemPreference(): ResolvedTheme {
    if (typeof window === "undefined" || !window.matchMedia) return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function writeDom(mode: ThemeMode, resolved: ResolvedTheme) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (resolved === "dark") {
        root.setAttribute("data-theme", "dark");
    } else {
        root.removeAttribute("data-theme");
    }
    root.setAttribute("data-theme-mode", mode);
    root.style.colorScheme = resolved;
}

function persist(mode: ThemeMode) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
        // Safari private mode etc. — the boot script falls back to "system".
    }
}

type ThemeContextValue = {
    mode: ThemeMode;
    resolved: ResolvedTheme;
    cycle: () => void;
    setMode: (next: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    // SSR and the first client render must share these defaults — reading
    // localStorage/boot attributes here would desync from the server HTML.
    const [mode, setModeState] = useState<ThemeMode>("system");
    const [systemPref, setSystemPref] = useState<ResolvedTheme>("light");
    const [hydrated, setHydrated] = useState(false);

    // Restore the real preference after hydrate (boot script already painted <html>).
    useIsomorphicLayoutEffect(() => {
        const fromDom = readBootModeFromDom();
        const fromStore = readStoredMode();
        const next = readBootAttribute("data-theme-mode") ? fromDom : fromStore;
        setModeState((current) => (current === next ? current : next));
        setSystemPref(systemPreference());
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const onStorage = (e: StorageEvent) => {
            if (e.key !== STORAGE_KEY) return;
            setModeState(isThemeMode(e.newValue) ? e.newValue : "system");
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = (e: MediaQueryListEvent) => setSystemPref(e.matches ? "dark" : "light");
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    const resolved: ResolvedTheme = mode === "system" ? systemPref : mode;

    useEffect(() => {
        if (!hydrated || typeof window === "undefined") return;
        const root = document.documentElement;
        persist(mode);

        const previous = readBootAttribute("data-theme") === "dark" ? "dark" : "light";
        if (previous !== resolved) {
            root.classList.add("theme-animating");
            writeDom(mode, resolved);
            const t = window.setTimeout(() => root.classList.remove("theme-animating"), 320);
            return () => {
                window.clearTimeout(t);
                root.classList.remove("theme-animating");
            };
        }

        writeDom(mode, resolved);
        return undefined;
    }, [hydrated, mode, resolved]);

    const setMode = useCallback((next: ThemeMode) => {
        persist(next);
        setModeState(next);
    }, []);

    const cycle = useCallback(() => {
        setModeState((current) => {
            const order: ThemeMode[] = ["system", "light", "dark"];
            const next = order[(order.indexOf(current) + 1) % order.length];
            persist(next);
            return next;
        });
    }, []);

    const value = useMemo<ThemeContextValue>(
        () => ({ mode, resolved, cycle, setMode }),
        [mode, resolved, cycle, setMode],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
}

/** Reactive OS-preference reader for places that don't need the full provider. */
export function useSystemTheme(): ResolvedTheme {
    return useSyncExternalStore(
        (notify) => {
            if (typeof window === "undefined" || !window.matchMedia) return () => { };
            const mq = window.matchMedia("(prefers-color-scheme: dark)");
            mq.addEventListener("change", notify);
            return () => mq.removeEventListener("change", notify);
        },
        () => systemPreference(),
        () => "light",
    );
}
