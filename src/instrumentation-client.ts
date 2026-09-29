import { captureAttribution } from "@/lib/attribution";
import { startMonitoring } from "@/lib/monitoring";

// Runs client-side before hydration. Sentry itself loads after the page does
// (src/lib/monitoring.ts). No-op when NEXT_PUBLIC_SENTRY_DSN isn't set; see
// .env.example.
startMonitoring(process.env.NEXT_PUBLIC_SENTRY_DSN);

// First-touch UTM capture, so growth-funnel events can be attributed to a
// channel (Reddit, AoPS, cold email, ...). See src/lib/attribution.ts.
captureAttribution();

export { onRouterTransitionStart } from "@/lib/monitoring";
