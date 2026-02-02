import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "resources.cloudhi.io",
      },
    ],
  },
  experimental: {
    // @ts-expect-error - specific to Next.js 15+ turbopack workspace resolution
    turbopack: {
      // Resolve warning about multiple lockfiles by explicitly invalidating parent dirs
      root: process.cwd(),
    },
  },
};

export default nextConfig;
