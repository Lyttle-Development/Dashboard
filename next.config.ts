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
};

export default nextConfig;
