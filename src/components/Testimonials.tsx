const testimonials = [
  {
    quote:
      "I gifted a Sozni Pashmina to my mother for her 60th birthday. She hasn't stopped wearing it since — it's become her most treasured possession.",
    name: "Priya M.",
    context: "Individual Buyer, Mumbai",
  },
  {
    quote:
      "We ordered 200 shawls in our brand colours for our leadership retreat. The quality was impeccable, and the heritage boxes made each gift feel truly personal.",
    name: "Rahul S.",
    context: "Head of HR, Tech Company",
  },
  {
    quote:
      "The Kani weave I purchased is a work of art. Eighteen months of an artisan's life in one shawl — that's luxury you can feel.",
    name: "Sarah L.",
    context: "Private Client, London",
  },
  {
    quote:
      "We stock The Kashmir Weaver's collection in our boutique. Our clients trust the GI certification and keep coming back.",
    name: "Amara K.",
    context: "Boutique Owner, Dubai",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" aria-label="Client testimonials" className="bg-paper-alt py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center">
          <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold-text">
            Trusted By
          </p>
          <h2 className="mt-4 font-heading text-4xl font-bold text-charcoal sm:text-5xl">
            What Our Clients Say
          </h2>
        </div>

        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-charcoal/10">
          {testimonials.map((t, i) => (
            <article
              key={i}
              className="reveal lg:px-10 lg:first:pl-0 lg:last:pr-0"
            >
              <span className="font-heading text-4xl leading-none text-gold/50" aria-hidden="true">
                &ldquo;
              </span>
              <p className="mt-2 text-sm italic leading-relaxed text-charcoal/80">
                {t.quote}
              </p>
              <div className="mt-5 flex gap-0.5" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, j) => (
                  <svg key={j} className="h-3.5 w-3.5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <div className="mt-4 border-t border-charcoal/10 pt-4">
                <p className="text-sm font-semibold text-charcoal">{t.name}</p>
                <p className="text-xs text-charcoal/70">{t.context}</p>
              </div>
              <span className="sr-only">Rated 5 out of 5 stars</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
