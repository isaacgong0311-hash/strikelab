import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

// Source map upload is skipped (no authToken/org/project configured) — add
// SENTRY_AUTH_TOKEN plus org/project here later to enable it. Error
// reporting itself is controlled separately by NEXT_PUBLIC_SENTRY_DSN
// (see src/instrumentation.ts, src/instrumentation-client.ts, .env.example).
export default withSentryConfig(nextConfig, {
  silent: true,
});
