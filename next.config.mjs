// @ts-check
import { createRequire } from 'module';
import path from 'path';
const require = createRequire(import.meta.url);

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Enable React Server Components
  reactStrictMode: true,
  
  // Turbopack configuration
  turbopack: {
    // Configure default resolve extensions
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '.css']
  },
  
  // Skip ESLint and TypeScript checks during build for faster builds
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  
  // Image optimization configuration
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Experimental features
  experimental: {
    // Enable React Compiler
    reactCompiler: true,
    
    // Enable Partial Prerendering
    ppr: true,
    
    // Configure stale times for different route segments
    staleTimes: {
      static: 60,  // Static routes cache time in seconds
      dynamic: 10, // Dynamic routes cache time in seconds
    },
    
    // Server Actions configuration
    serverActions: { 
      allowedOrigins: ['localhost:3000', 'pulse-app.vercel.app']
    },
    
    // Optimize package imports
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
    ],
  },
  
  // Security and performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=31536000',
          },
        ],
      },
      {
        source: '/',
        headers: [
          {
            key: 'Link',
            value: [
              '<https://fonts.googleapis.com>; rel=preconnect',
              '<https://fonts.gstatic.com>; rel=preconnect; crossorigin',
            ].join(', '),
          },
        ],
      },
    ];
  },
};

// Bundle Analyzer Integration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Export the final config with bundle analyzer
export default withBundleAnalyzer(nextConfig);
