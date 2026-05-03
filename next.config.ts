import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/adapter-pg", "@prisma/client", "pg"],
  sassOptions: {
    includePaths: [path.join(process.cwd())],
  },
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
