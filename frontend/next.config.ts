import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'icons.llama.fi',
      },
    ],
  },
};

export default nextConfig;
