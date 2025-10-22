import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Disable static optimization for build
  // This allows the app to build without environment variables
  output: "standalone",
};

export default nextConfig;
