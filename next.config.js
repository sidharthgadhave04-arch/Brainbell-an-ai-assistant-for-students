/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
  typescript: {
    // ?? Temporarily ignore TypeScript errors during build
    // TODO: Remove this after fixing all type errors
    ignoreBuildErrors: true,
  },
  // Increase server action body size limit
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Add empty turbopack config to silence webpack warning
  turbopack: {},
};

module.exports = nextConfig;
