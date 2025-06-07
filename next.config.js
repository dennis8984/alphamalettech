/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: [
      'images.pexels.com',
      'your-domain.vercel.app',
      'images.unsplash.com',
      'via.placeholder.com',
      'example.com',
      'res.cloudinary.com',
      'avatars.githubusercontent.com'
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    appDir: true,
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
  // Skip static generation for admin routes
  async generateBuildId() {
    return 'build-' + Date.now()
  },
  // Ads.txt redirect for Ezoic integration (temporarily disabled - using static file)
  async redirects() {
    return [
      // {
      //   source: '/ads.txt',
      //   destination: 'https://srv.adstxtmanager.com/19390/menshb.com',
      //   permanent: true,
      // },
    ]
  },
};

module.exports = nextConfig;
