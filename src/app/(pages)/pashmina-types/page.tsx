import Image from "next/image";
import type { Metadata } from "next";
import { siteConfig, whatsappLink } from "@/config/site";

export const metadata: Metadata = {
  title: "Types of Pashmina Shawls — A Complete Guide",
  description:
    "Discover the seven distinct styles of handwoven Kashmiri Pashmina — Jamawar, Kani, Sozni Border, Jali, Tilla, Reversible, and Pure Plain. Each one a living tradition.",
  openGraph: {
    title: "Types of Pashmina Shawls — A Complete Guide",
    description:
      "Discover the seven distinct styles of handwoven Kashmiri Pashmina — Jamawar, Kani, Sozni Border, Jali, Tilla, Reversible, and Pure Plain.",
    type: "website",
  },
  alternates: {
    canonical: "/pashmina-types",
  },
};

const PK = "https://purekashmir.com/cdn/shop/files";

const types = [
  {
    id: "jamawar",
    number: "01",
    title: "Jamawar",
    subtitle: "The Emperor\u2019s Canvas",
    timeToMake: "6\u201312 months",
    era: "15th-century Kashmir",
    technique: "All-over Sozni needlework",
    image: `${PK}/Black_Jamawar_Embroidery_Pashmina_Shawl_2341_600x.jpg?v=1774504384`,
    description:
      "Derived from the Persian \u2018jama\u2019 (garment) and \u2018var\u2019 (yard), Jamawar represents the most ambitious expression of Kashmiri embroidery. Unlike border work, Jamawar covers the entire surface \u2014 field, border, and pallu \u2014 in interlocking floral and paisley motifs so densely stitched that the finest pieces reveal the pattern from both sides.",
    story:
      "Mughal emperors adopted these shawls as symbols of rank. When the Maharaja of Kashmir gifted one to Queen Victoria, Europe fell so deeply in love with its motifs that they renamed the Kashmiri \u2018keri\u2019 as the \u2018paisley\u2019 \u2014 a word borrowed from the Scottish town that tried to replicate it.",
    keyFact: "A single artisan may spend their entire winter on one Jamawar piece. No two are identical.",
  },
  {
    id: "kani",
    number: "02",
    title: "Kani",
    subtitle: "Woven by Wooden Bobbins",
    timeToMake: "12\u201318 months",
    era: "15th-century Kanihama",
    technique: "Interlocked bobbin weaving from a talim manuscript",
    image: `${PK}/Natural_Kani_white_Buteh_Pashmina_Shawl_IMG_1345_600x.jpg?v=1775114939`,
    description:
      "The Kani shawl is not embroidered \u2014 it is woven. Dozens of small wooden bobbins, each carrying a different coloured thread, are placed by hand into the warp in a precise sequence dictated by a coded manuscript called a \u2018talim\u2019. A single row may require sixty bobbins. A single shawl has thousands of rows.",
    story:
      "The talim system is essentially a human algorithm \u2014 read aloud by a caller as the weaver works, line by line, colour by colour. The weaver doesn\u2019t see the pattern emerge until he is deep into it. Today, fewer than nine hundred Kani weavers remain in the world.",
    keyFact: "Each Kani shawl is the work of one named artisan. It is not a product \u2014 it is a signed work of time.",
  },
  {
    id: "border-embroidery",
    number: "03",
    title: "Sozni Border",
    subtitle: "Restraint as Craft",
    timeToMake: "Several weeks",
    era: "Centuries-old tradition",
    technique: "Single-needle Sozni kari along the edges",
    image: `${PK}/Ivory_Base_Big_Border_Embroidery_Cashmere_Pashmina_Shawl_IMG_0010_600x.jpg?v=1775487749`,
    description:
      "If Jamawar is the opera, the Sozni border shawl is the sonnet \u2014 disciplined in form, restrained in expression. The embroidery stays at the edges, leaving the centre field \u2014 the pure, unadorned Pashmina \u2014 to speak for itself. A single fine needle, a single thread, stitched through the weave to produce a pattern visible from both faces.",
    story:
      "The motifs are stamped onto the fabric freehand by a specialist artisan called the Chapangor. No transfer paper, no printed guides. Then an embroiderer takes over \u2014 sometimes for weeks \u2014 following the stamped lines with meditative precision.",
    keyFact: "The most versatile style \u2014 as natural over a coat on a November morning as it is over an evening dress.",
  },
  {
    id: "jali",
    number: "04",
    title: "Jali",
    subtitle: "The Art of Negative Space",
    timeToMake: "Several weeks to months",
    era: "Mughal-era technique",
    technique: "Openwork \u2014 creating windows in the weave itself",
    image: `${PK}/Ivory_Jali_Embroidery_Pashmina_cashmere_shawl_600x.jpg?v=1773037498`,
    description:
      "Where most embroidery adds thread to fabric, Jali removes it. The needle pushes threads aside to open small lattice windows through which light passes. Hold a Jali shawl to a window and it shifts as you move it \u2014 the light catching each aperture from a different angle. Simultaneously diaphanous and warm, architectural and fluid.",
    story:
      "The technique mirrors the carved stone \u2018jali\u2019 screens found in Mughal palaces \u2014 the same mathematics of light and shadow, rendered here in Pashmina fibre. It requires a mastery of tension that borders on the surgical: too much force and the weave tears, too little and the aperture closes.",
    keyFact: "The highest technical difficulty of all Kashmir\u2019s embroidery traditions.",
  },
  {
    id: "tilla",
    number: "05",
    title: "Tilla",
    subtitle: "The Language of the Court",
    timeToMake: "Weeks to months",
    era: "Mughal court tradition",
    technique: "Gold & silver metallic threadwork (couching)",
    image: `${PK}/DSC_1433_600x.jpg?v=1687507455`,
    description:
      "Tilla uses genuine metallic thread \u2014 fine wire drawn from gold or silver alloy wound around a silk core \u2014 producing a lustre that no other textile material on earth can replicate. The motifs are the same that appear carved into the marble walls of the Taj Mahal: flowers, vines, the iconic Kashmiri boteh.",
    story:
      "Unlike silk-threaded Sozni, metallic thread cannot be drawn through the weave \u2014 it must be \u2018couched\u2019, laid on the surface and anchored with tiny invisible stitches. The artisan watches the gold build the motif from the outside in. In afternoon light, a Tilla shawl appears to glow from within.",
    keyFact: "Historically worn at court for investiture ceremonies, weddings, and state receptions.",
  },
  {
    id: "reversible",
    number: "06",
    title: "Reversible",
    subtitle: "Two Faces, One Weave",
    timeToMake: "5\u20137 days on the loom",
    era: "Traditional pit-loom technique",
    technique: "Simultaneous two-colour warp interlocking",
    image: `${PK}/Dusty_Blue_And_Taupe_Reversible_Handwoven_Cashmere_Pashmina_Shawl_IMG_2029_600x.jpg?v=1775312962`,
    description:
      "Woven simultaneously in two contrasting colours on a traditional pit loom, each face is a different hue \u2014 with no visible seam, no wrong side, no place where you can see how the two faces connect. The weaver runs two sets of warp threads simultaneously, interlocking them in a precisely controlled sequence.",
    story:
      "The practical appeal is immediate: one shawl that functions as two. Navy with stone grey, forest green with sage, burgundy with blush. It has been our most requested travel piece \u2014 the single item clients tell us they reach for on every long flight.",
    keyFact: "Classic pairings: deep shade on one face, lighter complement on the other.",
  },
  {
    id: "plain",
    number: "07",
    title: "Pure Plain",
    subtitle: "The Fibre, Nothing More",
    timeToMake: "4\u20137 days",
    era: "The oldest form",
    technique: "Handwoven on a traditional Saaz loom",
    image: `${PK}/1_7792e793-39dd-4079-83ff-d2544ed08ee4_600x.jpg?v=1705754799`,
    description:
      "The hardest to make well, the easiest to counterfeit. Without embroidery to signal a skilled hand, the plain shawl must speak entirely through the quality of its fibre and the evenness of its weave. When it is genuine, it is the most quietly spectacular thing you can wear \u2014 lighter than it should be for its warmth, softer than it should be for its durability.",
    story:
      "Available across 200+ hand-dyed shades, three sizes (stole, shawl, and large square), and the two natural undyed tones of the Changthangi fibre. This is where Pashmina began \u2014 and where its argument is most clearly stated: this material, woven this carefully, needs nothing added.",
    keyFact: "50+ colours \u00b7 3 sizes \u00b7 The argument for fibre, distilled.",
  },
];

const sizeGuide = [
  {
    name: "Stole",
    dimensions: "70 \u00d7 200 cm",
    weight: "\u223c100g",
    use: "Lightweight neck scarf, travel, gifting",
  },
  {
    name: "Shawl",
    dimensions: "100 \u00d7 200 cm",
    weight: "\u223c180g",
    use: "Full shoulder wrap, eveningwear, everyday",
  },
  {
    name: "Large Square",
    dimensions: "137 \u00d7 137 cm",
    weight: "\u223c180g",
    use: "Multi-style wrap, weddings, formal occasions",
  },
];

export default function PashminaTypesPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Pashmina Types" },
    ],
  };

  return (
    <main className="bg-ivory bg-linen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Hero */}
      <section className="relative bg-forest-green pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 6px, #D4AF37 6px, #D4AF37 7px), repeating-linear-gradient(90deg, transparent, transparent 6px, #D4AF37 6px, #D4AF37 7px)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold">
            The Kashmir Weaver &middot; Shawl Guide
          </p>
          <h1 className="mt-6 font-heading text-4xl font-light leading-[1.1] text-ivory sm:text-5xl lg:text-6xl">
            Seven Styles of{" "}
            <span className="italic">Pashmina</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-[1.8] text-ivory/70">
            Each tradition carries centuries of meaning. From the dense
            needlework of a Jamawar to the quiet elegance of a plain shawl —
            here is every style we weave, and the story behind it.
          </p>
          {/* Quick nav */}
          <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-3">
            {types.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="font-accent rounded-full border border-ivory/15 px-4 py-1.5 text-[10px] tracking-[0.15em] uppercase text-ivory/70 transition-all hover:border-gold/40 hover:text-gold"
              >
                {t.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Shawl Types */}
      {types.map((type, i) => (
        <section
          key={type.id}
          id={type.id}
          className={`py-16 sm:py-24 ${
            i % 2 === 0 ? "bg-ivory bg-linen" : "bg-white/50"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                i % 2 !== 0 ? "lg:[direction:rtl]" : ""
              }`}
            >
              {/* Image */}
              <div className="reveal lg:[direction:ltr]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-xl">
                  <Image
                    src={type.image}
                    alt={`${type.title} Pashmina shawl — handwoven in Kashmir`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <span className="font-heading text-5xl font-light text-ivory/30 sm:text-6xl">
                      {type.number}
                    </span>
                    <span className="font-accent rounded-full bg-charcoal/60 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-ivory/80 backdrop-blur-sm">
                      {type.timeToMake}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="reveal lg:[direction:ltr]">
                <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold">
                  {type.subtitle}
                </p>
                <h2 className="mt-3 font-heading text-3xl font-light text-charcoal sm:text-4xl lg:text-5xl">
                  The{" "}
                  <span className="italic">{type.title}</span>{" "}
                  Shawl
                </h2>

                <p className="mt-5 text-base leading-[1.9] text-charcoal/75">
                  {type.description}
                </p>

                <p className="mt-4 text-base leading-[1.9] text-charcoal/75">
                  {type.story}
                </p>

                {/* At a glance */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-gold/10 bg-white/60 p-3">
                    <p className="font-accent text-[9px] uppercase tracking-[0.2em] text-charcoal/60">
                      Time to Make
                    </p>
                    <p className="mt-1 text-sm font-medium text-charcoal">
                      {type.timeToMake}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gold/10 bg-white/60 p-3">
                    <p className="font-accent text-[9px] uppercase tracking-[0.2em] text-charcoal/60">
                      Technique
                    </p>
                    <p className="mt-1 text-sm font-medium text-charcoal">
                      {type.technique}
                    </p>
                  </div>
                </div>

                {/* Key fact */}
                <div className="mt-5 border-l-4 border-gold/30 pl-5">
                  <p className="text-sm italic leading-relaxed text-charcoal/70">
                    {type.keyFact}
                  </p>
                </div>

                <a
                  href={whatsappLink(siteConfig.whatsappMessages.product(`${type.title} Pashmina shawls`))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-accent mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-[10px] font-semibold tracking-[0.2em] uppercase text-charcoal transition-all hover:scale-105 hover:bg-gold-muted"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Inquire About {type.title}
                </a>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Size Guide */}
      <section className="bg-charcoal py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="reveal text-center">
            <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold">
              Choosing the Right Size
            </p>
            <h2 className="mt-4 font-heading text-3xl font-light text-ivory sm:text-4xl">
              Pashmina <span className="italic">Size Guide</span>
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {sizeGuide.map((size) => (
              <div
                key={size.name}
                className="reveal rounded-xl border border-ivory/5 bg-ivory/[0.03] p-6 text-center"
              >
                <h3 className="font-heading text-xl font-semibold text-ivory">
                  {size.name}
                </h3>
                <p className="font-accent mt-2 text-[10px] tracking-[0.2em] text-gold/70">
                  {size.dimensions}
                </p>
                <p className="mt-1 text-xs text-ivory/60">{size.weight}</p>
                <div className="mx-auto my-4 h-px w-12 bg-gold/20" />
                <p className="text-sm leading-relaxed text-ivory/70">
                  {size.use}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Is Genuine Pashmina */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="reveal text-center">
          <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold">
            The Fibre &middot; The Truth
          </p>
          <h2 className="mt-4 font-heading text-3xl font-light text-charcoal sm:text-4xl">
            What Makes It{" "}
            <span className="italic">Genuine?</span>
          </h2>
        </div>
        <div className="reveal mt-10 rounded-2xl border border-gold/10 bg-white/60 p-8 sm:p-10">
          <p className="text-base leading-[1.9] text-charcoal/80">
            Genuine Pashmina is the undercoat of the <strong>Changthangi goat</strong>,
            a breed native to the Ladakh plateau at over 14,000 feet. At 12\u201316
            microns, it is one of the finest natural fibres in existence \u2014
            finer than commercial cashmere (18\u201322\u03bc), finer than the finest
            merino. Each goat yields just 80\u2013170 grams of usable fibre per
            year, combed by hand each spring.
          </p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gold/20">
                  <th className="font-accent pb-3 text-[10px] uppercase tracking-[0.2em] text-charcoal/70">
                    Fibre
                  </th>
                  <th className="font-accent pb-3 text-[10px] uppercase tracking-[0.2em] text-charcoal/70">
                    Diameter
                  </th>
                  <th className="font-accent pb-3 text-[10px] uppercase tracking-[0.2em] text-charcoal/70">
                    Origin
                  </th>
                  <th className="font-accent pb-3 text-[10px] uppercase tracking-[0.2em] text-charcoal/70">
                    Feel
                  </th>
                </tr>
              </thead>
              <tbody className="text-charcoal/70">
                <tr className="border-b border-charcoal/5 bg-gold/[0.03]">
                  <td className="py-3 font-medium text-charcoal">
                    Changthangi Pashmina
                  </td>
                  <td className="py-3">12\u201316 \u03bcm</td>
                  <td className="py-3">Ladakh, India</td>
                  <td className="py-3">Exceptionally soft</td>
                </tr>
                <tr className="border-b border-charcoal/5">
                  <td className="py-3">Commercial Cashmere</td>
                  <td className="py-3">18\u201322 \u03bcm</td>
                  <td className="py-3">China / Mongolia</td>
                  <td className="py-3">Soft</td>
                </tr>
                <tr className="border-b border-charcoal/5">
                  <td className="py-3">Fine Merino</td>
                  <td className="py-3">15\u201318 \u03bcm</td>
                  <td className="py-3">Australia / NZ</td>
                  <td className="py-3">Soft</td>
                </tr>
                <tr className="border-b border-charcoal/5">
                  <td className="py-3">Standard Wool</td>
                  <td className="py-3">25\u201345 \u03bcm</td>
                  <td className="py-3">Global</td>
                  <td className="py-3">Can irritate</td>
                </tr>
                <tr>
                  <td className="py-3">Viscose / Synthetic</td>
                  <td className="py-3">\u2014</td>
                  <td className="py-3">Factory-made</td>
                  <td className="py-3">No warmth</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-charcoal/70">
            The only verifiable proof of genuine Pashmina is an independent
            laboratory certificate confirming fibre composition and micron
            diameter. Every piece from The Kashmir Weaver ships with this
            certificate \u2014 not a marketing claim, but a laboratory measurement.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-burgundy py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="font-heading text-3xl font-light text-ivory sm:text-4xl">
            Every Shawl, <span className="italic">Made to Order</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ivory/70">
            Tell us the style, the shade, and the size. We&rsquo;ll connect you
            directly with the artisan workshop in Srinagar. Every piece is
            handwoven, lab-verified, and shipped with a Certificate of
            Authenticity.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href={whatsappLink(siteConfig.whatsappMessages.inquiry)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-accent inline-flex items-center gap-2 rounded-full bg-gold px-10 py-3.5 text-[11px] font-semibold tracking-[0.2em] uppercase text-charcoal transition-all hover:scale-105 hover:bg-gold-muted"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Inquire on WhatsApp
            </a>
            <a
              href="#jamawar"
              className="font-accent rounded-full border border-ivory/20 px-8 py-3 text-[11px] font-light tracking-[0.2em] uppercase text-ivory transition-all hover:border-gold hover:text-gold"
            >
              Explore All Styles
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
