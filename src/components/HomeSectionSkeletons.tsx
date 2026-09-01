/**
 * Suspense fallbacks for the homepage's streamed async sections.
 *
 * These mirror the real content's structure/spacing (not just a generic
 * spinner) so the layout shift when the streamed HTML swaps in is near
 * zero — a small centered spinner was previously causing a large CLS hit
 * because its height had nothing in common with the multi-row grids it
 * was replaced by.
 */

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-none bg-charcoal/5 ${className}`} />;
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden border border-charcoal/10 bg-ivory">
      <div className="relative aspect-4/5 overflow-hidden bg-paper-alt">
        <Block className="absolute inset-0" />
      </div>
      <div className="p-5">
        <Block className="h-2.5 w-16" />
        <Block className="mt-2.5 h-4 w-3/4" />
      </div>
    </div>
  );
}

export function HomeShopSectionSkeleton() {
  return (
    <section aria-hidden="true" className="bg-ivory pt-0 pb-20 sm:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Block className="h-9 w-64 sm:h-11 sm:w-80" />

        <div className="mt-10 sm:mt-12">
          <Block className="h-2.5 w-32" />
          <Block className="mt-4 h-8 w-40 sm:h-10" />
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
          <div className="mt-12 flex justify-center md:mt-16">
            <Block className="h-13 w-full sm:w-48" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeColourStudioSkeleton() {
  return (
    <section aria-hidden="true" className="border-y border-charcoal/10 bg-paper-alt py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden bg-ivory">
            <Block className="absolute inset-0" />
          </div>

          <div>
            <Block className="h-2.5 w-32" />
            <Block className="mt-4 h-9 w-64 sm:h-11" />
            <Block className="mt-4 h-5 w-full max-w-lg" />
            <Block className="mt-2 h-5 w-2/3 max-w-lg" />

            <div className="mt-8">
              <Block className="h-2.5 w-20" />
              <div className="mt-3 flex flex-wrap gap-2.5">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="h-11 w-11 rounded-full bg-charcoal/5">
                    <Block className="h-full w-full rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Block className="h-13 w-full sm:w-48" />
              <Block className="h-13 w-full sm:w-48" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArticleCardSkeleton() {
  return (
    <div className="overflow-hidden border border-gold/10 bg-white">
      <div className="relative aspect-16/10 overflow-hidden">
        <Block className="absolute inset-0" />
      </div>
      <div className="p-5">
        <Block className="h-4 w-full" />
        <Block className="mt-2 h-4 w-2/3" />
        <Block className="mt-3 h-3.5 w-full" />
        <Block className="mt-1.5 h-3.5 w-4/5" />
        <div className="mt-4 flex items-center justify-between">
          <Block className="h-3.5 w-24" />
          <Block className="h-3.5 w-14" />
        </div>
      </div>
    </div>
  );
}

export function StoriesSkeleton() {
  return (
    <section aria-hidden="true" className="bg-ivory bg-linen py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <Block className="h-2.5 w-40" />
          <Block className="mt-4 h-10 w-72 sm:h-12" />
          <Block className="mt-4 h-5 w-full max-w-2xl" />
        </div>

        <div className="mt-12 overflow-hidden border border-gold/15 bg-white">
          <div className="grid lg:grid-cols-2">
            <div className="relative aspect-4/3 overflow-hidden lg:aspect-auto lg:min-h-88">
              <Block className="absolute inset-0" />
            </div>
            <div className="flex flex-col justify-center gap-4 p-8 sm:p-10 lg:p-12">
              <Block className="h-6 w-24" />
              <Block className="h-8 w-full" />
              <Block className="h-5 w-full" />
              <Block className="h-5 w-2/3" />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
