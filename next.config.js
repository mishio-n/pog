const { withKumaUI } = require("@kuma-ui/next-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // kuma-uiで指定が必要なため残す
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.externals.push({
      "chrome-aws-lambda": "chrome-aws-lambda",
      "playwright-core": "playwright-core",
    });

    return config;
  },
};

module.exports = withKumaUI(nextConfig);
