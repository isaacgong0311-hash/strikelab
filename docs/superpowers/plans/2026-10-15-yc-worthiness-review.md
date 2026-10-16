# Is StrikeLab YC-worthy? An independent review (2026-10-15)

**Method.** `autoplan` could not run as written (its sub-reviews, helper scripts and Codex are not installed in this environment), so its method was run by hand: four independent reviewers who had not seen each other's work or my conclusions, each covering one phase. **Strategy** (a YC partner), **Engineering** (technical due diligence), **Design and funnel**, and **Market** (YC and K-12 base rates, web search). The DX phase was skipped: StrikeLab is not a developer tool. Then I verified the claims that would drive big decisions against the repo.

**Evidence tags.** **[V]** I verified it in the repo. **[R]** a reviewer reported it from the code and I did not re-check. **[S]** from web-search summaries only; no primary page was readable from this environment. **[I]** inference or judgment.

## 1. Verdict

**Not YC-worthy today, and it would be rejected if it applied now.** That matches what people at your school told you, but for a more specific reason than "it isn't good enough".

The *product* is the strong part. The *company* does not exist yet. A YC partner decides on evidence that real people want the thing, and there is none: `crm.csv` has two EXAMPLE rows, `interview-log.csv` has one EXAMPLE row, `cohorts.csv` and `support-log.csv` are header-only **[V]**. After roughly ten weeks of planning, zero leader conversations are on file.

"Not YC-worthy *today*" is fixable in two places and **not fixable by building** in two others:

| Gap | Fixable by building? |
|---|---|
| Product risks that would embarrass you at the first live cohort | **Yes.** Engineering work, listed below |
| Funnel, copy, proof page | **Yes.** Design work |
| **Evidence that anyone wants it or will pay** | **No.** Only conversations, pilots and asks produce it |
| **Founder situation** (age, signing authority, full-time commitment) | **No.** Needs facts and decisions from you and your parents |

## 2. Scorecard (consolidated from all four reviews)

| Dimension | Score /10 | Why |
|---|---|---|
| Founder quality and speed | 6 | A solo high-school founder built a 23-lesson product with Pyodide, RLS tests and cohort tooling **[V]**. Pulled down by: at the time of the review 38 of 146 commits were authored "Claude" and the other 108 are Isaac's under four git identities (`hogri` is Isaac, confirmed 2026-10-16) **[V]**; YC will still ask who built what, and the founder's own role/hours are still blank in the application draft **[V]** |
| Real problem, real users | 1 | No interviews, no leader contacts, no cohort **[V]**. The premise "club leaders need a ready-to-run lab" is untested **[I]** |
| Traction | 0 | The only outside signal is Search Console: 21 indexed pages, 5 to 25 impressions a day **[V]** |
| Market and path to large | 3 | The repo's own math puts licenses at about $0.1M to $0.6M a year at maturity (`docs/yc/market-sizing.md`) **[V]**. The rungs that could be large (districts, sponsors, talent pipeline) are unsized **[V]** |
| Business model | 2 | Buyers are clubs and teachers without budgets **[I]**; the $199 club license has never been asked of anyone **[V]** |
| Product quality | 7 | Real, tested, thoughtful about minors' data (see section 5) **[V/R]** |
| Reliability and safety for a live cohort | 4 | Several issues that fail in the first ten minutes of a kickoff (section 4) **[R, partly V]** |
| Funnel and credibility | 5 | `/clubs` is strong; the homepage serves two audiences; public proof is empty **[R]** |
| Founder situation and commitment | unscored | Age, signatory, school plan unresolved. See section 6 |

I will not give a probability of admission. Nothing in the repo supports a number, and a made-up one would be worse than none.

## 3. What is wrong, ranked

### A. The company is missing (no amount of code fixes this)

1. **Zero demand evidence.** [V] The plan itself says so (`g1-decision-pack.md`: "0 contacts touched"). Every other problem is secondary to this.
2. **Effort has gone into planning and agent output, not into users.** [V/R] About 520 KB of docs across 12 plan/spec files; the recent commits are almost all documentation. *This session added to that pile*: I wrote about ten more documents. They were useful tools (the G1 pack, the seed script, the source checks), but the review is right that more documents will not move the application. The build plan below puts a hard cap on documentation.
3. **The buyer is probably wrong.** [I, supported by market research S] Club presidents and volunteer teachers rarely have budget; school money moves slowly (reported 6 to 17 months, a vendor blog, weak source). The K-12 companies that worked (Clever, ClassDojo per the research) were bottom-up and free for the user, and charged *a different payer* (app developers, parents). That supports treating leaders as **distribution** and finding the payer elsewhere: a parent, a sponsor from finance, or a partner organization. **This is a hypothesis to test, not a fact.**
4. **The calendar is already failing.** [V] The fall pilot needed a leader with a start date by Nov 2 and school approval clearing by Oct 23. None exists. The first real data would arrive in winter.
5. **Strategy has flipped.** [V] Clubs-only homepage on Sep 23, back to a two-audience homepage on Sep 30 (`decision-log.md`). The README still says "Free, open source" while the plan sells a license. It is unclear to an outsider who the customer is.

### B. The founder situation (needs facts from you, not code)

6. **Age and signing authority.** YC's long-quoted position, from a Paul Graham essay (2007) and a Fortune summary (2025), is that YC generally does not take founders who cannot legally sign contracts; there are exceptions (a 14- and a 16-year-old in 2017) and an 18-year-old in W25 **[S]**. I could not find a current official rule. **Read YC's own FAQ and, if it is unclear, email them.** This single fact decides whether your timeline is "apply in spring" or "apply later".
7. **A new path may matter: YC "Early Decision".** [S] Launched Sept 2025: students apply, get funded now, and join a batch after graduating. Whether *high schoolers* qualify is **unverified**. Check ycombinator.com/early-decision.
8. **Full-time commitment.** The application draft marks it `[NEEDS FOUNDER + PARENTS]`; the spec says you plan to stay enrolled with 10 to 15 hours a week **[V]**. The partner will ask this early.
9. **Authorship.** 38 of 146 commits (26%) say "Claude" and the application draft's "what did you do vs AI" is blank **[V]**. You need an honest, specific answer. **Resolved 2026-10-16:** `hogri` is Isaac, so there is no second contributor: the "solo founder" claim and code ownership are clean, and about three quarters of the commits are the founder's own. A `.mailmap` now shows them as one person.

### C. Product and engineering risks (would hurt at the first live cohort)

| # | Finding | Severity | Evidence |
|---|---|---|---|
| E1 | **Python runs on the browser's main thread with no worker or timeout.** One `while True:` freezes the student's tab; 25 teenagers at a kickoff will do it within minutes. The 13 MB runtime loaded by a whole class on school Wi-Fi is a second risk | High | [V] no `Worker`/`terminate` in `src/lib/pythonRuntime.ts` |
| E2 | **AI tutor is an unfiltered chat for minors.** No moderation, no per-class off switch, no data-processing terms with the provider; and the server keeps the client-supplied message `role`, so a student can plausibly send a `system` message and rewrite the tutor's rules | High | [V] `clampHistory` preserves `role`; [R] the rest. Privacy page says requests are counted, but does not say student code goes to Groq |
| E3 | **Stripe webhook can silently drop a paid subscription.** If `subscription.created` arrives before the customer row exists, the update does nothing, the route returns 200 and Stripe never retries | High | [V] `updateByCustomerId` discards the result of `applySubscriptionEvent` (`"missing" | "error"`). *This corrects my earlier A5 note*, which said the money-path fixes held; the ordering guard holds but the missing-row case was never covered |
| E4 | **Invite codes use `Math.random`**, and the security review states "34 symbols, 1.5 billion codes" but the real alphabet is 32 symbols (about 1.07 billion). The join lookup has no per-IP rate limit | Medium | [V] `src/lib/classes.ts:7-13` |
| E5 | **No age attestation, no teacher verification, no CSP header.** Anyone can create a class and see the display names of whoever joins | Medium | [R] |
| E6 | **No failover.** If Supabase or Vercel is down at kickoff, sign-up and joins are dead; nothing in the repo covers backups/PITR, a status page or a "site is down" plan. Rate limiting fails open | Medium | [R] |
| E7 | **Thin tests on the paths that matter.** Join route, scorecard loader and cohort home are untested; there is no authenticated end-to-end journey (teacher launches, student joins, scorecard updates) | Medium | [R] |
| E8 | **Sprawl dilutes the core.** Paper-trading sandbox, challenges, seven AI routes, Spline 3D, Electron, Capacitor, `archive/`, `marketing/` all ship in a six-week club product, and each widens the surface the trust page must explain. It is also why script size misses the Lighthouse budget | Medium | [V] dirs/deps exist; [R] sizes |
| E9 | **Two content slips.** The "2-year LEAPS vega" figure does not match the code (about 0.50, not 0.80); the box spread is described as "buy a call spread and sell a put spread" | Low | [R] `lessons.ts` near lines 858 and 247. Black-Scholes, theta and delta were recomputed and are correct |

### D. Funnel and student experience

10. **The homepage hero is 50/50 student and leader, and the primary button is the student one** ("Start lesson 1"); the leader door is the secondary button. A teacher sees a student product with a club upsell in the first ten seconds. `/clubs` is the right page (reviewer: 9/10) but the homepage never sends leaders there first. [R]
11. **The leader path starts with a sign-up wall** (about 3 forms and 4 to 5 decisions, timezone defaults to America/Chicago). There is no preview of what the leader gets before creating an account other than `/demo`. [R]
12. **Public proof is empty.** `PROOF = []` renders nothing, and nothing honest replaces it ("recruiting N clubs this term", a named advisor). [R]
13. **Some copy over-claims:** "Zero prep" conflicts with the real kickoff and weekly steps; "we'll help with your district's student-data agreement" promises a service one person cannot deliver; "any laptop or Chromebook" vs the FAQ's own caveat about phones. [R]
14. **The student loop is good within a session and weak across a week.** One clear next action, but no finish-the-week moment, no re-entry after a missed week, nothing between meetings; week 4 (the Greeks) is the hardest and has no extra support. [R]

## 4. Cross-phase themes (flagged by two or more reviewers independently)

- **Building ahead of evidence.** Strategy (docs over users), Engineering (sprawl) and Design (cut list) all say the same thing from different directions: the product surface is wide and the learning is narrow.
- **Who pays?** Strategy and Market both land on the leader being a channel, not the payer.
- **Claims outrun proof.** Strategy (stale numbers, unchecked market figures), Engineering (wrong code-space number in a "security-reviewed" doc, "tests for every policy"), Design (over-claiming copy). The honesty discipline in the *docs* is good; the *public pages* and *trust documents* have slipped in a few places.

## 5. What is genuinely good (so you do not throw it out)

- **Honesty.** The README and the application draft say "no cohort has started" and mark every unknown. That is unusually credible. [V]
- **Measurement design.** Activation and retention are defined precisely, proof thresholds are explicit, kill criteria exist. [V]
- **Data protection.** Row-level security is thoughtful (a recursion bug fixed, column privileges revoked so students cannot set share tokens), every admin-client use is behind an ownership check, the leaderboard name leak was found and fixed, deletion cascades and is tested, and a test fails if a migration adds a table the data map does not cover. [R]
- **Engineering velocity.** A real, tested, browser-based Python lab for school networks, built by one student. [V/R]
- **The wedge idea may still be right.** A market niche with few direct competitors was not disproven; it just was not tested. [I]

## 6. What would change my mind

| If this happens... | ...then |
|---|---|
| 3+ leaders with real start dates, and two ask "how much?" | The club wedge is alive; keep the plan, fix the pilot calendar |
| Leaders love it but nobody has budget | The payer is elsewhere: run the parent-paid and sponsor experiments |
| 20 conversations and nobody cares about the lab | The problem is not what you thought; the interviews will tell you what is |
| YC's FAQ rules out under-18s, no Early Decision for high schoolers | The target changes from "apply in spring 2027" to "build the evidence now, apply at 18 or after graduation", and the work in the build plan is still the right work |

## 7. Questions only you can answer

1. What does YC's own FAQ say about under-18 founders and Early Decision? (15 minutes, and it decides the timeline.)
2. ~~Who is `hogri` in the git history?~~ Answered: it is Isaac.
3. What did you personally build or decide, versus what Claude wrote? Write it plainly; YC will ask.
4. What do your parents think about a full-time commitment, and who is the adult who can sign for you?
5. Do you want to delete the sprawl (sandbox, challenges, Electron, Capacitor, Spline) or hide it behind flags? Deleting is simpler; flags keep optionality. See the build plan, T4.
