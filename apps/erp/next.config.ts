import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: false,
  allowedDevOrigins: ['169.58.132.249', 'techno-mania.az', '*.techno-mania.az', 'erp.techno-mania.az', 'localhost', '127.0.0.1'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      widenClientFileUpload: true,
      silent: true,
    })
  : withSentryConfig(nextConfig, {
      silent: true,
    });

