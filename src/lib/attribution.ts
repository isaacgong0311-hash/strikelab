/**
 * Lightweight first-touch UTM capture — so upgrade/signup events can be
 * attributed to a channel (Reddit, AoPS, cold email, ...) without a full
 * analytics stack. Session-scoped: resets each browser session, which is
 * fine for "which post drove this click" attribution.
 */
const KEY = "sl_attribution";

interface Attribution {
  [key: string]: string | undefined;
  source?: string;
  campaign?: string;
  medium?: string;
}

/** Call once, client-side, as early as possible (see src/instrumentation-client.ts). */
export function captureAttribution() {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(KEY)) return; // first touch wins for the session
    const params = new URLSearchParams(window.location.search);
    const attribution: Attribution = {
      source: params.get("utm_source") ?? undefined,
      campaign: params.get("utm_campaign") ?? undefined,
      medium: params.get("utm_medium") ?? undefined,
    };
    if (!attribution.source && !attribution.campaign && !attribution.medium) return;
    sessionStorage.setItem(KEY, JSON.stringify(attribution));
  } catch {
    // sessionStorage unavailable (private browsing, etc.) — skip silently
  }
}

/** Reads back whatever captureAttribution() stored this session, if any. */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}
