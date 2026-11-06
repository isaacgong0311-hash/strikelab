# StrikeLab work plan: Isaac + Claude

**As of:** Thu Oct 29, 2026 · **Horizon:** now → Dec 20 (end of Season 1) · **Review:** every Sunday

This plan sets out who does what. The detail is in other documents: [YC submission plan](yc/w27-submission-plan.md) and [application draft](yc/application-draft.md) (both on PR #72), the [investor readiness plan](INVESTOR_READINESS_WORK_PLAN.md), the [claim ledger](investor/claim-ledger.md) and the [founder plan](STRIKELAB_FOUNDER_WORK_PLAN.md). If this plan conflicts with them, the more specific document wins for its own topic. This plan wins on ownership.

## Codex workstream added October 29

Isaac asked Codex to work alongside Claude on outreach drafts, learning research, curriculum, and AI help. [Draft PR #79](https://github.com/isaacgong0311-hash/strikelab/pull/79) contains the first isolated slice: five unsent email drafts, an options lesson converted to short sessions, and an optional AI explanation after a missed answer. Codex owns that PR's files until review. Claude's YC submission, production checks, and existing PR work remain the current priority. Isaac reviews the copy and decides when the PR ships; outreach remains unsent.

## Where things stand

- **Production:** strikelab.dev runs master `e5ebe32` (PR #77). Students and clubs are free. The Intensive ($349) is waitlist-only. Season 1 opens Nov 30 with three challenges, which run through Dec 20.
- **YC W27 deadline:** **Mon Nov 2, 8pm PT**. The target is to submit **Sun Nov 1**. Decisions come by Dec 11.
- **Usage, revenue and retention are unknown, not zero.** Nobody has queried production yet. The Supabase connector Claude has only sees an inactive project (`supabase-byzantine-mirror`), not production (`urmfsymdmmzstbelqryw`), so production SQL is Isaac's job.
- **Open PRs:** #72 (YC draft v0.7), #74 (class workspace), #67 (13+ / adult confirmations, CSP report-only) and #64 (desk briefings) are mergeable with green CI. #37, #40, #41, #43 and #70 are drafts and have gone stale.
- **This checkout** (`feat/perf-budget`) is 118 commits behind master and has uncommitted edits to docs that master already has in newer form (landed in #75). Don't build or ship from it.

## Ground rules

| Isaac only | Claude only | Together |
|---|---|---|
| Anything in your voice: YC personal answers, both videos, outreach to leaders, parent conversations | Code, PRs, CI, verifying what production actually shows, checking claims against sources, draft text that isn't about you | Decisions that change the plan, and the Sunday review |
| Logins and dashboards Claude can't or shouldn't use: YC form, production Supabase SQL editor, Stripe, creating accounts on production | Asks before merging, deploying, or applying a migration (ship when green: build → PR → green CI → merge → smoke test) | |
| Sending any message to a real person | Never sends messages, never writes a number without a dated source, never writes your personal answers | |

**Handoff format:** when one of us finishes an item, it goes in the PR, the doc, or a commit, not just in chat. Claude doesn't remember chats between sessions, so the repo has to.

## Phase 1: YC submission (Thu Oct 29 → Mon Nov 2)

| Day | Isaac | Claude |
|---|---|---|
| **Thu Oct 29** (today) | Catch up on anything left from Wednesday: **batch decision** (W27 or Early Decision, with your parents) and copy the live form questions and limits into a private draft. Then in the prod Supabase SQL editor run `check-migrations.sql` and `yc-snapshot.sql` (on PR #72), and paste the aggregate output to Claude or into the draft. Check Stripe revenue. | Merge PR #72 once you say go, so the plan, draft and `yc-snapshot.sql` are on master. Confirm the Vercel prod deployment is READY and record its commit. Turn your query output into the draft's Progress section and claim-ledger rows (dated, "source: production query"). |
| **Fri Oct 30** | Write checklist items 4–5 yourself (why this, why YC, impressive thing, non-computer hack). **Record the 1-minute founder video.** | Re-verify every row of the draft's claims table against live strikelab.dev (lessons, `/lab`, `/pricing`, `/intensive`, `/seasons`) and the test count on the deployed commit. Flag anything that changed. Keep the shot list current. |
| **Sat Oct 31** | Create a fresh demo student account on production. **Record the ~2-minute product demo** following the shot list. Fill checklist items 6–7 (team, short fills). | Before you record, walk the demo path in the browser: sample data labelled, no real names, practice problems reject a wrong answer. Report anything that shouldn't be on screen. |
| **Sun Nov 1** | Get a cold reader to say back what it is. Paste into the live form, attach both videos, **submit**. | Run a line-by-line claim audit against the ledger and list every sentence without a source. After you submit, commit the submitted text as `docs/yc/submitted-2026-11-01.md` (no personal details). |
| **Mon Nov 2** | Buffer only: submit by noon Central if Sunday slipped. | Nothing new. |

**Gate:** submitted, every number dated and sourced, availability answers consistent with the batch choice.

## Phase 1b: repo hygiene (Claude, alongside Phase 1, no customer-facing risk)

- [ ] Retire this stale checkout. Make sure nothing in the uncommitted edits is newer than master, then start from a clean master worktree. Ask before discarding anything.
- [ ] Triage the open PRs. Merge #74, #67 and #64 one at a time with green CI and a smoke test, each only with your go-ahead and **not during the video window (Fri–Sat)**, so the demo records against a stable production. Propose to close or rebase the stale drafts #37/#40/#41/#43/#70 with a one-line reason each.
- [ ] `graphify update .` after code lands.

## Phase 2: Season 1 run-up and first real users (Nov 3 → Nov 29)

The goal is real students with a season handle and at least one real club leader committed before Nov 30. The tech already exists, so this phase is about distribution.

| Isaac | Claude |
|---|---|
| List 30 reachable leaders (club, teacher, program organizer) in a **private** CRM, not this public repo. Send 5 personal messages a week. Log each send and next step. | Production rehearsal on staging or local with test accounts: invite → join → first lesson → save/reopen code → scorecard → capstone → season attempt. File and fix whatever breaks. |
| Run 5 discovery calls, using the questions in the founder plan §6. Write down exact quotes, with permission. | Keep `check-migrations.sql` / `rls-audit.sql` / `yc-snapshot.sql` in sync with every new migration. Write the weekly scorecard query so Friday takes 10 minutes. |
| Get one leader to a named date, group and approver for a cohort or for Season 1 as a club. | Fix only observed blockers: what a leader or student actually hit. No new features without a named person who ran into the problem. |
| Run the Supabase/Stripe checks Claude can't reach (production readiness checklist A1–A5). Record date and evidence. | Pre-flight check of the Season 1 schedule: challenges, scoring and records on production by **Nov 27**. Freeze nonessential merges from **Nov 27 to Dec 1**. |

**Gate (Nov 29):** Season 1 verified on production, and at least one real leader or student group committed. If no conversations are booking, change the message or segment. Don't add product.

## Phase 3: Season 1 live and YC decision (Nov 30 → Dec 20)

| Isaac | Claude |
|---|---|
| Be there for kickoff. Have a weekly 10-minute check-in with each leader. Talk with two consented students. | Watch for errors on production (Sentry, Vercel runtime errors) and fix blockers same-day. |
| Dec 6: run the week-1 count (students with an official score). If YC accepts updates, send that one dated fact. | Write the Dec 6 query and the update draft, numbers only; you send it. |
| Dec 11: YC decision. If it's an interview, prep with Claude. | Mock interview: hard questions drawn from the claim ledger's gaps. |
| Dec 20: ask each leader whether they'd run it again and introduce another leader. | Season 1 report: funnel with denominators, failures and the next change. It reconciles against raw queries. |

## Open decisions (Isaac)

1. **Batch:** Winter 2027 full-time, or Early Decision for a later batch? Every availability answer depends on this.
2. **Outreach teammate:** cofounder (in the video, on the form) or collaborator? Decide and write it in `docs/gtm/decision-log.md`.
3. **PR merge order** in Phase 1b, and whether anything merges before the demo is recorded.
