/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 20,
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
