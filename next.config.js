/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Don't fail build on ESLint errors during production builds
    // Warnings will still be shown but won't block deployment
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Don't fail build on TypeScript errors
    ignoreBuildErrors: false,
  },
  // Configure webpack to handle pdf-parse and its native dependencies
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't externalize pdf-parse - let it bundle normally
      // This ensures native dependencies are included
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
}

module.exports = nextConfig

