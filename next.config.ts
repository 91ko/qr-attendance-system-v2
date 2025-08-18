import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['k.kakaocdn.net'],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
