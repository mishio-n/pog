const { withKumaUI } = require("@kuma-ui/next-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  // kuma-uiで指定が必要なため残す
  experimental: {
    appDir: true,
  },
};

module.exports = withKumaUI(nextConfig);
