"use client";

import { useEffect } from "react";
import { captureError } from "@/lib/monitoring";

/**
 * Next.js App Router's root error boundary — catches render errors that
 * escape every other error.tsx (including one thrown from the root layout
 * itself, which no nested error.tsx can catch). Without this file, those
 * crashes never reach Sentry: instrumentation.ts only covers request/route
 * handler errors, not client render errors.
 *
 * Replaces the whole document (must render its own <html>/<body>) since a
 * root-layout crash means the layout itself can't be trusted to render. So it
 * is self-contained: no app CSS or fonts, just the few token values below
 * copied from src/styles/tokens.css, in one inline <style>.
 */
const CSS = `
  .ge { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 1.5rem; background: #f5f6f3; color: #17201b; font: 400 1rem/1.6 system-ui, -apple-system, "Segoe UI", sans-serif; }
  .ge main { width: min(100%, 30rem); }
  .ge h1 { margin: 0 0 0.75rem; font-size: 1.75rem; line-height: 1.2; letter-spacing: -0.02em; }
  .ge p { margin: 0 0 1.5rem; color: #4e5a53; }
  .ge code { font: 0.8125rem/1.4 ui-monospace, monospace; }
  .ge button { min-height: 44px; padding: 0 1rem; border: 1px solid transparent; border-radius: 8px; background: #14733c; color: #fff; font: 600 0.875rem/1 system-ui, -apple-system, "Segoe UI", sans-serif; cursor: pointer; }
  .ge button:hover { background: #0d5c2e; }
  .ge button:focus-visible { outline: 3px solid #075ee8; outline-offset: 2px; }
`;

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    captureError(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="ge">
        <title>Something broke | StrikeLab</title>
        <style>{CSS}</style>
        <main>
          <div role="alert">
            <h1>Something broke on our end</h1>
            <p>
              We&apos;ve logged it. Reloading usually fixes it. If it doesn&apos;t, come back in a few minutes.
            </p>
          </div>
          {error.digest ? <p><code>Reference: {error.digest}</code></p> : null}
          <button type="button" onClick={() => window.location.reload()}>
            Reload the page
          </button>
        </main>
      </body>
    </html>
  );
}
