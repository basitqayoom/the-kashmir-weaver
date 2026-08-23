// "Snow & Saffron" — original palette, deliberately distinct from the
// Hydrogen storefront's warm walnut/bronze theme. Cool white/stone base,
// Pampore-saffron primary accent, Dal Lake teal secondary accent.
export type HeroTheme = "snow" | "teal" | "ink" | "gradient";

export const HERO_THEME: HeroTheme = "snow";

export const heroThemes = {
  snow: {
    background: "#FFFFFF",
    text: "#1C2321",
    accent: "#CE7A21",
    logo: "/images/logo/logo-ivory-bg.png",
  },
  teal: {
    background: "#103B3A",
    text: "#F5F6F3",
    accent: "#CE7A21",
    logo: "/images/logo/logo-green-bg.png",
  },
  ink: {
    background: "#1C2321",
    text: "#F5F6F3",
    accent: "#CE7A21",
    logo: "/images/logo/logo-white-bg.png",
  },
  gradient: {
    background: "linear-gradient(135deg, #FFFFFF 0%, #F5F6F3 100%)",
    text: "#1C2321",
    accent: "#CE7A21",
    logo: "/images/logo/logo-ivory-bg.png",
  },
} as const;

export const colors = {
  paper: "#FFFFFF",
  paperAlt: "#F5F6F3",
  ink: "#1C2321",
  inkMuted: "#5B655F",
  border: "#E2E6E0",
  saffron: "#CE7A21",
  saffronDeep: "#A5601A",
  dalTeal: "#103B3A",
  chinar: "#8C3B2E",
  whatsapp: "#25D366",
} as const;
