
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "directus-production-1839.up.railway.app",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8055",
      },
    ],
  },
};

export default nextConfig;