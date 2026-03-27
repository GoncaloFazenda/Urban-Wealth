/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@urban-wealth/core'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

export default nextConfig;
