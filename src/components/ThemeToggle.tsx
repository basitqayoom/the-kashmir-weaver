"use client";

import { useTheme, type ThemeMode } from "@/lib/theme";

function SunIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-2.227-1.591 1.591M5.25 12H3m2.227-4.773L3.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
    );
}

function MoonIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
        </svg>
    );
}

function SystemIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m-6 0h6m-6 0H4.5A2.25 2.25 0 0 1 2.25 15V6a2.25 2.25 0 0 1 2.25-2.25h15A2.25 2.25 0 0 1 21.75 6v9a2.25 2.25 0 0 1-2.25 2.25H15" />
        </svg>
    );
}

function labelForMode(mode: ThemeMode): string {
    if (mode === "system") return "System";
    if (mode === "light") return "Light";
    return "Dark";
}

function nextLabelFor(mode: ThemeMode): string {
    if (mode === "system") return "Click to switch to light";
    if (mode === "light") return "Click to switch to dark";
    return "Click to switch back to system";
}

/** Icon advertises the mode the click will move *to*, not the current one. */
function renderModeIcon(mode: ThemeMode, className: string) {
    if (mode === "light") return <MoonIcon className={className} />;
    if (mode === "dark") return <SystemIcon className={className} />;
    return <SunIcon className={className} />;
}

/** Cycles system → light → dark → system. `tile` is a labeled square for mobile menus. */
export default function ThemeToggle({
    className = "",
    variant = "icon",
}: {
    className?: string;
    variant?: "icon" | "tile";
}) {
    const { mode, cycle } = useTheme();
    const title = `Theme: ${labelForMode(mode)} — ${nextLabelFor(mode)}`;

    if (variant === "tile") {
        return (
            <button
                type="button"
                onClick={cycle}
                aria-label={title}
                title={title}
                suppressHydrationWarning
                className={`flex aspect-square w-full min-h-22 flex-col items-center justify-center gap-2 border transition active:opacity-80 ${className}`}
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
            >
                {renderModeIcon(mode, "h-5 w-5")}
                <span className="font-accent text-[9px] uppercase tracking-[0.2em] opacity-60">Theme</span>
                <span className="text-[11px] font-medium uppercase tracking-[0.14em]">{labelForMode(mode)}</span>
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={cycle}
            aria-label={title}
            title={title}
            suppressHydrationWarning
            className={`inline-flex h-9 w-9 items-center justify-center transition hover:opacity-70 ${className}`}
            style={{ color: "var(--foreground)" }}
        >
            {renderModeIcon(mode, "h-4.5 w-4.5")}
        </button>
    );
}
