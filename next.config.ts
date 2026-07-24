import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: "standalone",
};

// Source map upload is skipped (no authToken/org/project configured) — add
// SENTRY_AUTH_TOKEN plus org/project here later to enable it. Error
// reporting itself is controlled separately by NEXT_PUBLIC_SENTRY_DSN
// (see src/instrumentation.ts, src/instrumentation-client.ts, .env.example).
export default withSentryConfig(nextConfig, {
  silent: true,
});
