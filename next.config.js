/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: true,
  },
  // PWA configuration will be enabled after npm install
  // withPWA config goes here
};

module.exports = nextConfig;
