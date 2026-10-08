# Pilot-readiness verification: work plan

**Date:** 2026-10-08. **Why this stream:** the gate (a leader's yes by Oct 16) is founder work, and the PR queue is waiting on the founder's merge. The one kind of agent work that is neither blocked nor a duplicate is *checking claims we are about to make to a school*. A wrong IT allowlist or a wrong "how long does Python take" is found on kickoff day, in front of 20 students. This plan checks each claim against the running app.

**Rule it follows:** nothing here changes product behavior. It measures, corrects documents, and adds guards. Anything that would change the product is listed as a proposal and waits for a decision.

## Done (Oct 8)

| Claim made to schools | How it was checked | Result |
|---|---|---|
| The IT allowlist in `kickoff-kit.md` §1 is complete | `scripts/audit/network-hosts.mjs` loads 16 routes on a production build (including a real Python run) and records every host | Only `strikelab.dev`. No new third-party host since the Sep 29 capture; the Python runtime comes from our own origin, never jsdelivr. Supabase, Google and Sentry can't be exercised without keys. Dev builds show a `va.vercel-scripts.com` script that production doesn't use, so audit a production build |
| "Python takes 5–30s the first time" (`kickoff-kit.md` §2 step 5) | Throttled network on `/lesson/3`, time until the runtime is ready | 5s at 20 Mbps, 8s at 10, 13s at 5, 28s at 2. The claim holds down to about 2 Mbps; below that it is longer. Measured locally with gzip, not against the deployment (this sandbox can't reach it) |
| The runtime is cached after the first load | Response headers | `Cache-Control: public, max-age=31536000, immutable` |
| The public pages work after a deploy | `npm run smoke` (plan `2026-10-08-post-deploy-smoke.md`) | 20 checks, read-only |

## Next, with what each needs

| # | Check | Needs | Why |
|---|---|---|---|
| N1 | School-Chromebook conditions: 4x CPU throttle plus 5 Mbps, time to the cohort home and to the first session | #37's `tests/chromebook.spec.ts` (A1) | The kit says the cohort home should appear in about 3s; nothing measures it |
| N2 | The invite card prints on one page | A class with an invite page (staging) or a demo fixture | Smoke-test step 1 asks for it; the leave-behind needed the same check and a naive version printed a blank page |
| N3 | Sign-up under classroom load: 25 sign-ups in a minute from one school IP | Staging with real SMTP | Supabase's built-in sender is rate-limited; this is the failure P2 warns about |
| N4 | Re-run `network-hosts.mjs` with production keys and a Google sign-in | Production or staging | Exercises the three hosts this run could not |

## Proposal, not started (needs a decision)

**Prefetch the Python runtime from the cohort home during week 2.** The kit says weeks 1–2 don't need Python and week 3 does, so a student on 2 Mbps school Wi-Fi first waits 30s or more in the middle of the week-3 meeting. A low-priority prefetch during week 2 (the file is immutable-cached) would make week 3's first Run instant. It changes product code off the gate's critical path, so it needs a line in `decision-log.md` and a yes from the founder. Recommendation: yes, after the #40 and #37 merges, as one small PR.
