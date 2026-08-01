import * as Sentry from "@sentry/nextjs";
import { captureAttribution } from "@/lib/attribution";

// Runs client-side before hydration. No-op when NEXT_PUBLIC_SENTRY_DSN isn't
// set — see .env.example.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
  });
}

// First-touch UTM capture, so growth-funnel events can be attributed to a
// channel (Reddit, AoPS, cold email, ...). See src/lib/attribution.ts.
captureAttribution();

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
