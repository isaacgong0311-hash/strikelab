---
name: ship
description: Land a change on StrikeLab end to end. Branch, verify, commit, push, open a PR, wait for green CI, merge to master, smoke-test production. Use whenever work is ready to go out, or when told to "ship it", "land this", "merge when green" or "keep going".
---

# Ship a change to StrikeLab

The standing permission and the ask-first list live in `docs/PLAN.md` ("Working agreement"). Read that section if unsure. Merging to master deploys to production on Vercel, so every step below is a gate, not a suggestion.

## 0. Before you start
- `git fetch origin`. Work on a branch cut from `origin/master`, never on master. Name it `feat/…`, `fix/…`, `chore/…` or `docs/…`.
- Check the date against the freeze (Nov 27 to Dec 1, 2026). During it, ship only fixes for something a real user hit.
- Read `node_modules/next/dist/docs/` for anything you touch in the framework. This is not the Next.js you know (see `AGENTS.md`).

## 1. Verify locally (all of these, in this order)
```bash
npx tsc --noEmit
npx eslint src tests
npx vitest run
npm run build
```
- `next build` has historically flaked on a security advisory. On a failure, read the first lines of the real error before retrying. Retrying a different failure hides it.
- For UI changes, load the page in the built-in browser at 1280px and 375px (use the `qa-walkthrough` subagent for anything non-trivial). Check the console and network tab.
- If dev serves stale CSS, stop the server and `rm -rf .next/dev` (Turbopack stale-CSS issue).
- Touched `src/app/seasons`, signed-in flows or anything with a Playwright spec? Run that spec: `npx playwright test tests/<name>.spec.ts`. The seeded-database season specs run in CI, not locally.

## 2. Review your own diff
Spawn the `pr-reviewer` subagent on the diff. Fix what it confirms. For auth, scoring, payments or anything touching the hidden season tests, also run `/security-review`.

## 3. Commit and push
- Small, scoped commits. Message says why, not just what.
- Add `AGENTS.md` only if it is the sole change you want; `next dev` regenerates it and it is otherwise noise. Never commit `generated_images/`, `test-results/` or anything under `.env*`.
- `git push -u origin <branch>`. If TLS to GitHub fails (ContentKeeper filter), push through the git data API (see the `git-tls-filter-push-via-api` memory). Never disable `http.sslVerify`.

## 4. Open the PR
`gh pr create --base master`. Body: Why, What, Verified, Not covered. Be honest about what you did not run. After creating it, call `mcp__ccd_pr__get_status` and bind it if it is not reported.

## 5. Wait for green
- Required: GitHub `test` job (lint, unit, e2e, build, Lighthouse budgets) and the Vercel preview build.
- Wait for the `test` check-run **by name** on the PR's head commit (`gh api repos/<o>/<r>/commits/<sha>/check-runs`). Do not trust `gh pr checks --watch` alone: right after a push it can return green with only the Vercel checks listed, before GitHub Actions registers `test` (this merged #98 untested on Nov 22, 2026). When landing several PRs, merge one at a time and wait for master's own `test` run to pass before the next.
- Do not poll in a loop. Use the PR pane's auto-fix monitor so CI failures, conflicts and comments wake you.
- Red CI: read the failing log, fix on the same branch, push. Never merge on red, never skip a check, never `--no-verify`.
- Open the Vercel preview and smoke-test the changed page before merging.

## 6. Merge and verify production
- `gh pr merge <n> --merge` (this repo uses merge commits; the history shows "Merge pull request #N").
- Find the new production deployment: Vercel MCP `list_deployments` for project `strikelab`, expect `target: production`, `state: READY`, and the merge commit SHA.
- Smoke-test with the Vercel MCP `web_fetch_vercel_url` (server-side fetch; `strikelab.dev` can fail TLS in the browser on some networks). Fetch `/`, `/seasons` and the page you changed. Check for the expected text and no error markers.
- If production is broken: `request_rollback` to the previous READY deployment first, then fix forward on a branch.

## 7. Report
One short message: PR link, what changed, what you verified, what you did not, and a list of **migrations Isaac must apply** (file names, in order), or "none". If a step needs Isaac, say exactly what and where.

## Stop and ask instead of continuing when
The change needs a migration applied before it can work, sends a message to a real person, spends money, writes production data, needs a force-push, or upgrades a dependency by a minor or major version.
