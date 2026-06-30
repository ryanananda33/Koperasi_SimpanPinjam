/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* Allow building even with some type check warnings if they arise, but we aim for clean TypeScript */
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
