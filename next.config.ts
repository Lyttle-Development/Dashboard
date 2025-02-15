import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ALLOWED_USER_IDS: process.env.ALLOWED_USER_IDS,
  },
};

export default nextConfig;
