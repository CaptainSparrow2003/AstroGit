/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com'],
    // Add unoptimized for Render deployment
    unoptimized: process.env.NODE_ENV === 'production',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL + '/:path*',
      }
    ];
  },
  // Add output: 'standalone' for better optimization on Render
  output: 'standalone',
};

module.exports = nextConfig; 