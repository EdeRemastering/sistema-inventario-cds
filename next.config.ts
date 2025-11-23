import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Cloudflare R2 - URL por defecto
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
        port: '',
        pathname: '/signatures/**',
      },
      {
        // Cloudflare R2 - Dominio personalizado (si se configura)
        protocol: 'https',
        hostname: '**.cloudflare.com',
        port: '',
        pathname: '/signatures/**',
      },
    ],
  },
};

export default nextConfig;
