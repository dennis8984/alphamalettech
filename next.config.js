/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['images.pexels.com', 'your-domain.vercel.app']
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        path: false,
        os: false,
        crypto: false,
      }
    }
    return config
  },
  async generateStaticParams() {
    return []
  },
  // Skip static generation for admin routes
  async generateBuildId() {
    return 'build-' + Date.now()
  }
};

module.exports = nextConfig;
