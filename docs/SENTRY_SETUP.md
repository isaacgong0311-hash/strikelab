# Sentry go-live checklist

Code is ready — `src/instrumentation.ts` and `src/instrumentation-client.ts`
already init Sentry (server + client), `next.config.ts` already wraps the
build with `withSentryConfig`. Added today: `src/app/global-error.tsx` (root
render crashes weren't being caught before — request errors were, render
errors weren't) and user-tagging (`Sentry.setUser` in `AuthProvider.tsx`, so
a crash report includes which account hit it, not just a stack trace).

## Steps (you do this part — I can't create the account)

1. [sentry.io](https://sentry.io) → free account → new project → platform: Next.js
2. Copy the DSN (`https://...@....ingest.sentry.io/...`) — safe to expose client-side
3. Set `NEXT_PUBLIC_SENTRY_DSN` in Vercel (Production env), redeploy
4. Optional, for readable stack traces instead of minified bundles: generate an
   auth token at [sentry.io/settings/account/api/auth-tokens](https://sentry.io/settings/account/api/auth-tokens),
   set `SENTRY_AUTH_TOKEN` + org/project slugs — `next.config.ts` already has
   a comment showing where these plug into `withSentryConfig`

## Verify after deploy

- Trigger a real error (e.g. temporarily throw in a page) and confirm it shows
  up in the Sentry dashboard within a minute, tagged with your test account's email
- Confirm a request-handler error (e.g. hit an API route with malformed input)
  also shows up — that path uses `onRequestError`, separate from the render path
