import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{ hostname: 'res.cloudinary.com' }],
  },
};

export default withSentryConfig(nextConfig, {
  org: "supersquad-aa",
  project: "supersquad-nextjs",

  authToken: process.env.SENTRY_AUTH_TOKEN,

  widenClientFileUpload: true,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
});
