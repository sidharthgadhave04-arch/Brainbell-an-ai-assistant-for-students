/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // This will completely skip ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // This will skip TypeScript errors during builds
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  images: {
    domains: ["avatars.githubusercontent.com", "lh3.googleusercontent.com"],
  },
  experimental: {
    serverComponentsExternalPackages: ['canvas'],
  },
  serverRuntimeConfig: {
    maxDuration: 60,
  },
};

export default nextConfig;