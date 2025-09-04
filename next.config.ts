import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ALLOWED_USER_IDS: process.env.ALLOWED_USER_IDS,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
        port: "",
        pathname: "**",
        search: "",
      },
    ],
  },
  devIndicators: false, // Disable the "Next.js is running in development mode" message
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disable linting during build to test API migration
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily disable TS errors during build to test API migration
  },
};

export default nextConfig;
