import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const LEGACY_HOST = "strikelabco.vercel.app";

/**
 * Content-Security-Policy in REPORT-ONLY mode (build plan T3.6): browsers
 * enforce nothing, they report what this policy would have blocked to
 * /api/csp-report, which logs it. Once a few weeks of real traffic report
 * nothing unexpected, rename the header to Content-Security-Policy.
 *
 * - 'unsafe-inline' scripts: Next's inline bootstrap scripts (no nonces yet).
 * - 'wasm-unsafe-eval': the in-browser Python (Pyodide) compiles WebAssembly.
 * - cdn.jsdelivr.net: Pyodide's fallback source when /pyodide is blocked.
 * - *.supabase.co: auth and data (https + realtime wss).
 * - *.sentry.io: browser error reports. va.vercel-scripts.com: Analytics.
 * - api.web3forms.com: the newsletter form.
 */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://cdn.jsdelivr.net https://va.vercel-scripts.com",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://cdn.jsdelivr.net https://*.sentry.io https://api.web3forms.com https://va.vercel-scripts.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "report-uri /api/csp-report",
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return [
      // The buyer page moved to /clubs (decision log 2026-09-23).
      { source: "/for-schools", destination: "/clubs", permanent: true },
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
        // The Python runtime (scripts/copy-pyodide.mjs): about 13 MB, and the
        // path is versioned, so a student downloads it once per version.
        source: "/pyodide/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
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
