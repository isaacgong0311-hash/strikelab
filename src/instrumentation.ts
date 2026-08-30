import * as Sentry from "@sentry/nextjs";
import { notifyOps } from "./lib/opsAlert";

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

export const onRequestError: typeof Sentry.captureRequestError = (error, request, context) => {
  // Sentry stays the system of record; the Discord ping is a best-effort
  // nudge so a solo operator notices without having to watch a dashboard.
  const message = error instanceof Error ? error.message : String(error);
  notifyOps("Unhandled request error", `${request.method} ${request.path}\n${message}`);
  return Sentry.captureRequestError(error, request, context);
};
