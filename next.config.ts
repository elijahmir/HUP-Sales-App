import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "resources.cloudhi.io",
      },
    ],
  },
};

export default nextConfig;
