export type HeroTheme = "burgundy" | "forest-green" | "charcoal" | "gradient";

export const HERO_THEME: HeroTheme = "burgundy";

export const heroThemes = {
  burgundy: {
    background: "#6B1D2A",
    text: "#FAF7F2",
    accent: "#D4AF37",
    logo: "/images/logo/logo-burgundy-bg.png",
  },
  "forest-green": {
    background: "#0A2E1C",
    text: "#FAF7F2",
    accent: "#D4AF37",
    logo: "/images/logo/logo-green-bg.png",
  },
  charcoal: {
    background: "#1A1A1A",
    text: "#FAF7F2",
    accent: "#D4AF37",
    logo: "/images/logo/logo-white-bg.png",
  },
  gradient: {
    background: "linear-gradient(135deg, #6B1D2A 0%, #0A2E1C 100%)",
    text: "#FAF7F2",
    accent: "#D4AF37",
    logo: "/images/logo/logo-burgundy-bg.png",
  },
} as const;

export const colors = {
  burgundy: "#6B1D2A",
  gold: "#D4AF37",
  goldMuted: "#C9A84C",
  forestGreen: "#1B4332",
  ivory: "#FAF7F2",
  charcoal: "#2D2A26",
  whatsapp: "#25D366",
} as const;
