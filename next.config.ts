import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const LEGACY_HOST = "strikelabco.vercel.app";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return [
      {
        // The old *.vercel.app host serves the whole site on 200s, so Google
        // has two crawlable copies of every page. The canonical tags already
        // point at strikelab.dev, but a canonical is a hint — a 308 is a
        // directive, and it moves the link equity instead of just deduping.
        //
        // /api/ is excluded because Stripe (and webhooks generally) do not
        // follow redirects, and /auth/ because the Supabase PKCE cookie is
        // bound to the origin the sign-in started on — bouncing the callback
        // to another host would drop the verifier and break login.
        //
        // Only this exact host matches, so preview deployments
        // (strikelab-git-*.vercel.app) are untouched.
        source: "/:path((?!api/|auth/).*)",
        has: [{ type: "host", value: LEGACY_HOST }],
        destination: `https://strikelab.dev/:path`,
        permanent: true,
      },
    ];
  },
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
