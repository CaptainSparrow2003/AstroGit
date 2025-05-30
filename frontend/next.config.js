/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com'],
  },
  async rewrites() {
    return [
      {
        // Exclude auth routes from being rewritten
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL + '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-skip-auth-rewrite',
            value: 'false',
          },
        ],
      },
      // Ensure NextAuth routes are not rewritten
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 