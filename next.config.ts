import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  logging: {
    fetches: {
      fullUrl: true,
    }
  },
  images: {
    // Allow external domains for book cover images
    domains: ["shopping-phinf.pstatic.net"],
    // For internal images served through API proxy
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'dailyfeed.local',
        port: '8889',
        pathname: '/api/images/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/api/**',
      },
    ],
    // Optimize images with these formats
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images for 60 days
    minimumCacheTTL: 5184000,
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // Enable standalone output for Docker deployment
  // This creates a minimal production build with only required files
  output: 'standalone',
  // Environment variables with NEXT_PUBLIC_ prefix are automatically
  // exposed to the browser and can be used in client-side code
  // The following variables are defined in .env (local) or ConfigMap (k8s):
  // - NEXT_PUBLIC_MEMBER_SERVICE_URL
  // - NEXT_PUBLIC_CONTENT_SERVICE_URL
  // - NEXT_PUBLIC_TIMELINE_SERVICE_URL
  // - NEXT_PUBLIC_ACTIVITY_SERVICE_URL
  // - NEXT_PUBLIC_IMAGE_SERVICE_URL
  // - NEXT_PUBLIC_SEARCH_SERVICE_URL
};

export default nextConfig;
