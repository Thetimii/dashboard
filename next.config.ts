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
  // Ensure proper routing
  trailingSlash: false,
  // Make sure all pages are properly built
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'framer-motion'],
  },
}

export default nextConfig;
