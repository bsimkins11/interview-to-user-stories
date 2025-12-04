/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  // Simple config like the working project
  images: {
    domains: ['localhost'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Removed CopyWebpackPlugin - Next.js handles public directory automatically
};

module.exports = nextConfig;
