const { withKumaUI } = require("@kuma-ui/next-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // kuma-uiで指定が必要なため残す
  experimental: {
    appDir: true,
  },
  swcMinify: true,
};

module.exports = withKumaUI(nextConfig);
