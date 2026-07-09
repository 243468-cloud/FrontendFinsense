/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: true,
  },
};

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: true,
  workboxOptions: {
    disableDevLogs: true,
    exclude: [
      /\[.*\]/,
      /%5B.*%5D/,
      /_next\/static\/chunks\/app\/.*\/\[.*\]/,
    ],
  },
});

module.exports = withPWA(nextConfig);
