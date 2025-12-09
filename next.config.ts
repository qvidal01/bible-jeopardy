import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",

  // Performance optimizations
  poweredByHeader: false,

  // Strict mode for better development experience
  reactStrictMode: true,

  // Experimental features for performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ["zustand", "pusher-js"],
  },

  // Security headers
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
      ],
    },
  ],
};

export default nextConfig;
