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
}

module.exports = nextConfig

