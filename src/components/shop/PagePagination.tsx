import Spinner from "@/components/Spinner";

export default function PagePagination({
    currentPage,
    hasNextPage,
    hasPreviousPage,
    onNext,
    onPrevious,
    isLoading,
}: {
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    onNext: () => void;
    onPrevious: () => void;
    isLoading: boolean;
}) {
    return (
        <nav className="flex items-center justify-center gap-4 py-12 sm:gap-6" aria-label="Pagination">
            <button
                type="button"
                onClick={onPrevious}
                disabled={!hasPreviousPage || isLoading}
                className="font-accent inline-flex min-h-11 items-center gap-1.5 border border-charcoal/15 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-charcoal/70 transition-colors hover:border-gold/40 hover:text-charcoal disabled:pointer-events-none disabled:opacity-30 sm:px-5"
            >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Previous
            </button>

            {isLoading ? (
                <Spinner className="text-charcoal/70" label="Loading more pieces" />
            ) : (
                <span className="whitespace-nowrap text-sm tabular-nums text-charcoal/70">Page {currentPage}</span>
            )}

            <button
                type="button"
                onClick={onNext}
                disabled={!hasNextPage || isLoading}
                className="font-accent inline-flex min-h-11 items-center gap-1.5 border border-charcoal/15 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-charcoal/70 transition-colors hover:border-gold/40 hover:text-charcoal disabled:pointer-events-none disabled:opacity-30 sm:px-5"
            >
                Next
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>
        </nav>
    );
}
