export default function PageHero({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: React.ReactNode;
    description?: string;
}) {
    return (
        <section className="relative overflow-hidden bg-paper-alt pb-16 pt-28 sm:pb-20 sm:pt-32">
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                aria-hidden="true"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 6px, #CE7A21 6px, #CE7A21 7px), repeating-linear-gradient(90deg, transparent, transparent 6px, #CE7A21 6px, #CE7A21 7px)",
                }}
            />
            <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
                    {eyebrow}
                </p>
                <h1 className="mt-6 font-heading text-4xl font-light leading-[1.1] text-charcoal sm:text-5xl lg:text-6xl">
                    {title}
                </h1>
                {description && (
                    <p className="mx-auto mt-6 max-w-xl text-base leading-[1.8] text-charcoal/70">
                        {description}
                    </p>
                )}
            </div>
        </section>
    );
}
