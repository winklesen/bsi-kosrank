import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["kosrank-web"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
