import * as Sentry from "@sentry/nextjs";

// Runs once when a new server instance starts (Node.js and Edge runtimes).
// No-op when NEXT_PUBLIC_SENTRY_DSN isn't set — see .env.example.
export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
  });
}

export const onRequestError = Sentry.captureRequestError;
