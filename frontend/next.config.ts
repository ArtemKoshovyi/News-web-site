import type { NextConfig } from "next";

const directusUrl =
  process.env.NEXT_PUBLIC_DIRECTUS_URL ??
  "https://directus-production-1839.up.railway.app";

function directusRemotePattern() {
  try {
    const url = new URL(directusUrl);

    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
    };
  } catch {
    return {
      protocol: "https" as const,
      hostname: "directus-production-1839.up.railway.app",
    };
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      directusRemotePattern(),
      {
        protocol: "http",
        hostname: "localhost",
        port: "8055",
      },
    ],
  },
};

export default nextConfig;
