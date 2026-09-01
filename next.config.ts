import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ["@react-three/fiber", "three", "react-social-media-embed"],
  },
  images: {
    // Vercel's metered image optimizer is over its plan quota (402
    // OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED on /_next/image) — serve
    // originals unoptimized rather than paying/upgrading for more transforms.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    // Shopify CDN assets are content-addressed, so they can be cached hard.
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "purekashmir.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "thepashm.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
      {
        source: "/feeds/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex" },
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // `generateSitemaps()` produces only the child sitemaps, so the index has
      // to be served explicitly — see src/app/sitemap/index.xml/route.ts.
      { source: "/sitemap.xml", destination: "/sitemap/index.xml" },
    ];
  },
  async redirects() {
    return [
      // permanentRedirect() in a page component only emits a real 3xx for a
      // non-streamed render — this route was streaming and served 200 with a
      // client-side meta-refresh instead. A config-level redirect always
      // resolves before rendering, guaranteeing a real 308 for crawlers.
      {
        source: "/collections/all",
        destination: "/shop",
        permanent: true,
      },
      // Legacy / Hydrogen / Shopify RSS & Atom feed aliases
      {
        source: "/products.rss",
        destination: "/products/rss.xml",
        permanent: true,
      },
      {
        source: "/products.atom",
        destination: "/products/atom.xml",
        permanent: true,
      },
      {
        source: "/journal.rss",
        destination: "/blog/rss.xml",
        permanent: true,
      },
      {
        source: "/journal.atom",
        destination: "/blog/atom.xml",
        permanent: true,
      },
      {
        source: "/journal/rss.xml",
        destination: "/blog/rss.xml",
        permanent: true,
      },
      {
        source: "/blogs.rss",
        destination: "/blog/rss.xml",
        permanent: true,
      },
      {
        source: "/blogs/rss.xml",
        destination: "/blog/rss.xml",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
