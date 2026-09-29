/**
 * Browser error monitoring with Sentry loaded after the page does (work plan
 * 2026-09-29, AG4). A static `import * as Sentry` in instrumentation-client
 * put the SDK (about 130 KB gzipped with its deps) on every page, ahead of
 * the content, for every visitor. Now the SDK loads once the page has
 * finished loading. Errors thrown before that are buffered and reported when
 * it arrives, so the only gap is a tab closed within the first moments.
 *
 * Server-side Sentry (src/instrumentation.ts) is unchanged.
 */
type SentryModule = typeof import("@sentry/nextjs");
type MonitoringUser = { id: string } | null;

let sentry: SentryModule | null = null;
let pendingUser: MonitoringUser | undefined;
const pendingErrors: unknown[] = [];
let started = false;

function onError(event: ErrorEvent) {
  pendingErrors.push(event.error ?? event.message);
}
function onRejection(event: PromiseRejectionEvent) {
  pendingErrors.push(event.reason);
}

/** Starts browser monitoring. No-op without a DSN or outside the browser. */
export function startMonitoring(dsn: string | undefined): void {
  if (!dsn || typeof window === "undefined" || started) return;
  started = true;
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);

  const load = () => {
    void import("@sentry/nextjs")
      .then((S) => {
        S.init({ dsn, tracesSampleRate: 0.1 });
        window.removeEventListener("error", onError);
        window.removeEventListener("unhandledrejection", onRejection);
        sentry = S;
        for (const error of pendingErrors.splice(0)) S.captureException(error);
        if (pendingUser !== undefined) S.setUser(pendingUser);
      })
      .catch(() => {
        // Blocked by an ad blocker or offline: monitoring is best-effort.
      });
  };
  const whenIdle = () => ("requestIdleCallback" in window ? window.requestIdleCallback(load, { timeout: 4000 }) : setTimeout(load, 1));
  if (document.readyState === "complete") whenIdle();
  else window.addEventListener("load", whenIdle, { once: true });
}

/** Reports an error (e.g. from an error boundary), now or once Sentry loads. */
export function captureError(error: unknown): void {
  if (sentry) sentry.captureException(error);
  else pendingErrors.push(error);
}

/** Tags later reports with the signed-in account's id (never an email or name). */
export function setMonitoringUser(user: MonitoringUser): void {
  if (sentry) sentry.setUser(user);
  else pendingUser = user;
}

/** Router-transition tracing, once Sentry has loaded. */
export function onRouterTransitionStart(...args: Parameters<SentryModule["captureRouterTransitionStart"]>): void {
  sentry?.captureRouterTransitionStart(...args);
}
