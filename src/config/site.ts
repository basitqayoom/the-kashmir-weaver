export const siteConfig = {
  name: "The Kashmir Weaver",
  url: "https://thekashmirweaver.com",
  tagline: "Authentic GI-Certified Kashmiri Pashmina",
  description:
    "Handwoven luxury Pashmina shawls direct from Kashmir artisans. GI-certified, ethically sourced. Shop individually or inquire for wholesale, corporate gifting & boutique partnerships.",

  contact: {
    email: "thekashmirweaver@gmail.com",
    phone: "+919796105623",
    phoneSecondary: "+919682132612",
    phoneDisplay: "+91 979 610 5623",
    phoneDisplayFull: "+91 9796105623 / 9682132612",
  },

  address: {
    line1: "Ali Jan Complex, Lal Chowk",
    city: "Srinagar",
    state: "Jammu & Kashmir",
    stateShort: "J&K",
    postalCode: "190001",
    country: "IN",
    mapsUrl: "https://maps.app.goo.gl/4bjkSoCjsdMyNVsf8",
    geo: { latitude: 34.0837, longitude: 74.7973 },
  },

  social: {
    instagram: "https://www.instagram.com/thekashmirweaver/",
    instagramHandle: "@thekashmirweaver",
    linkedin: "https://www.linkedin.com/company/thekashmirweaver",
    googleBusiness: "https://share.google/pBDdfCXg1uR2psXSP",
    whatsapp: "https://wa.me/919796105623",
    whatsappNumber: "919796105623",
  },

  whatsappMessages: {
    default: "Hi, I'm interested in your Pashmina collection",
    blog: "Hi, I just read your blog and I'm interested",
    lookbook: "Hi, I'd like to request a lookbook",
    custom: "Hi, I'd like to discuss a custom order",
    purchase: "Hi, I'm interested in purchasing a Pashmina",
    inquiry: "Hi, I'd like to inquire about a Pashmina shawl",
    product: (name: string) => `Hi, I'm interested in ${name}`,
  },

  films: [
    {
      slug: "anatomy-of-an-artwork",
      title: "Anatomy of an Artwork",
      eyebrow: "Film One",
      youtubeId: "0W-s9iv9F6c",
      description:
        "A close study of a single shawl — the weave, the borders, the motifs — and the generations of knowledge encoded in every thread. A quiet meditation on what the hand can do that the machine cannot.",
      teaser: "A close study of a single shawl — and the generations of knowledge in every thread.",
      runtime: "6:35",
      hoverImage:
        "https://cdn.shopify.com/s/files/1/0175/0928/files/jamawar-embroidery-artisan.jpg",
      hoverImageAlt: "Master artisan hand-stitching Jamawar embroidery",
    },
    {
      slug: "the-art-of-pashmina",
      title: "The Art of Pashmina",
      eyebrow: "Film Two",
      youtubeId: "IzcAQPb2Fqw",
      description:
        "From the Changthangi goat at 4,500 metres to the Srinagar loom — a passage through the twenty hand processes that transform Himalayan fleece into Kashmiri Pashmina.",
      teaser: "From the Himalayan goat to the Srinagar loom — the twenty hands that make a shawl.",
      runtime: "6:42",
      hoverImage:
        "https://cdn.shopify.com/s/files/1/0175/0928/files/dal-lake.jpg",
      hoverImageAlt: "Dal Lake in Srinagar, the valley where Pashmina is handwoven",
    },
  ],
} as const;

export function whatsappLink(message?: string) {
  const msg = message ?? siteConfig.whatsappMessages.default;
  return `${siteConfig.social.whatsapp}?text=${encodeURIComponent(msg)}`;
}
