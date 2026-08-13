"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Next.js App Router's root error boundary — catches render errors that
 * escape every other error.tsx (including one thrown from the root layout
 * itself, which no nested error.tsx can catch). Without this file, those
 * crashes never reach Sentry: instrumentation.ts only covers request/route
 * handler errors, not client render errors.
 *
 * Replaces the whole document (must render its own <html>/<body>) since a
 * root-layout crash means the layout itself can't be trusted to render.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            fontFamily: "system-ui, sans-serif",
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
            Something broke on our end
          </h1>
          <p style={{ color: "#666", maxWidth: "28rem" }}>
            We&apos;ve logged this. Reloading usually fixes it — if not, come
            back in a bit.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
