/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['images.pexels.com', 'your-domain.vercel.app']
  },
  // Admin system with NextAuth requires dynamic API routes
};

module.exports = nextConfig;
