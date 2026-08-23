const SIZES = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8",
} as const;

/** Shared loading indicator. Announces itself unless a parent already does. */
export default function Spinner({
  size = "md",
  className = "",
  label = "Loading",
  showLabel = false,
}: {
  size?: keyof typeof SIZES;
  className?: string;
  label?: string;
  /** Renders the label beside the spinner instead of only for screen readers. */
  showLabel?: boolean;
}) {
  return (
    <span role="status" className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        className={`${SIZES[size]} animate-spin motion-reduce:animate-none`}
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      {showLabel ? (
        <span className="font-accent text-[11px] uppercase tracking-[0.2em]">{label}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </span>
  );
}

/** Full-section loading state — used by route-level loading.tsx files. */
export function PageSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-24 text-charcoal/70">
      <Spinner size="lg" label={label} />
    </div>
  );
}

/** Suspense fallback for a streamed page section. */
export function SectionSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center px-4 py-24 text-charcoal/40">
      <Spinner size="lg" label={label} />
    </div>
  );
}
