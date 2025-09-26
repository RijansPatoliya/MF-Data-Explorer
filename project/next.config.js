/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['images.pexels.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Vercel-specific optimizations
  experimental: {
    serverComponentsExternalPackages: ['node-cache'],
  },
  // Ensure proper API route handling
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  // Output configuration for Vercel
  output: 'standalone',
  // Disable x-powered-by header
  poweredByHeader: false,
  // Compress responses
  compress: true,
};

module.exports = nextConfig;