import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Evita que Turbopack “adivine” el root por lockfiles fuera del repo
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        // Cloudflare R2 - URL por defecto
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
        port: '',
        pathname: '/**',
      },
      {
        // Cloudflare R2 - Dominio personalizado (si se configura)
        protocol: 'https',
        hostname: '**.cloudflare.com',
        port: '',
        pathname: '/**',
      },
      {
        // Cloudflare R2 - Subdominio público r2.dev (recomendado)
        protocol: 'https',
        hostname: '**.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
