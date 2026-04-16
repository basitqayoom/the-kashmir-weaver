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
    mapsUrl:
      "https://www.google.com/maps/search/Ali+Jan+Complex+Lal+Chowk+Srinagar",
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
} as const;

export function whatsappLink(message?: string) {
  const msg = message ?? siteConfig.whatsappMessages.default;
  return `${siteConfig.social.whatsapp}?text=${encodeURIComponent(msg)}`;
}
