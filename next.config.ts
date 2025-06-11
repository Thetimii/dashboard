import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Vercel optimizations
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
  // Remove unsupported experimental options for Turbopack compatibility
}

export default nextConfig;
