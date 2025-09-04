import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Allow production builds to successfully complete even if there are ESLint
    // errors. This is useful when lint rules are strict, but we don't want them
    // to block deployments. Local dev should still surface warnings/errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
