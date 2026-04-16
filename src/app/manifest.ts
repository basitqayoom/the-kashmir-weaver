import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Kashmir Weaver",
    short_name: "Kashmir Weaver",
    description: "Authentic GI-Certified Kashmiri Pashmina Shawls",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF7F2",
    theme_color: "#6B1D2A",
    icons: [
      { src: "/icon.png", sizes: "32x32", type: "image/png" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
