/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Enable edge runtime for faster API responses
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Enable compression
  compress: true,
  // Optimize production build
  swcMinify: true,
  // Performance optimizations
  poweredByHeader: false,
};

export default nextConfig;
