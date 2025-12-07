/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Turbopack configuration (empty config to silence warning)
  turbopack: {
    resolveAlias: {
      // Add any necessary aliases here
    },
  },
};

module.exports = nextConfig;
