# Post-deploy smoke check Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One command, `npm run smoke`, that checks a deployed URL in under a minute, with no account and no data written, so the founder (or the agent) can run it after every deploy instead of clicking through the public half of `docs/gtm/smoke-test.md`.

**Architecture:** A read-only Playwright spec, `tests/smoke.spec.ts`, pointed at any URL through `PLAYWRIGHT_BASE_URL`. It covers the public half of the pilot journey. The signed-in half (sign-up, join, completions, capstone, SQL checks) needs a Supabase project that does not exist yet, so it stays manual and is listed here as a blocked task, not written blind.

**Tech Stack:** Playwright (already in the repo), the existing `playwright.config.ts`.

**Why this and not the whole smoke test as code:** the manual test creates real accounts, reads email and runs SQL with service-role access. None of that can run, or be verified, until staging exists (D4). The public half is verifiable today and catches the failures that cost a kickoff day: a page that 500s, the Python runtime not served (the school-filter failure in smoke-test step 4), the site left un-indexable in production, an admin page that is not hidden.

---

## File structure

- Create `tests/smoke.spec.ts`: the read-only checks, each independent.
- Modify `package.json`: add `"smoke": "playwright test tests/smoke.spec.ts"`.
- Modify `docs/gtm/smoke-test.md`: tell the reader which part is automated and how to run it.
- Modify `playwright.config.ts`: no change. `PLAYWRIGHT_BASE_URL` already skips the local web server.

## Task 1: Public pages load without script errors

**Files:**
- Create: `tests/smoke.spec.ts`

- [ ] **Step 1: Write the test**

```ts
import { expect, test } from "@playwright/test";

const PAGES = ["/", "/pilot", "/clubs", "/demo", "/trust", "/pricing", "/lessons", "/faq", "/sign-in", "/sign-up"];

for (const path of PAGES) {
  test(`${path} loads with a heading and no script errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}
```

- [ ] **Step 2: Run it**

Run: `npx playwright test tests/smoke.spec.ts --reporter=list`
Expected: 10 passed against a running dev server on :3000.

- [ ] **Step 3: Prove it can fail**

Run: `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test tests/smoke.spec.ts -g "/nope" --reporter=list`
Expected: "No tests found" is not a failure signal; instead temporarily add `"/definitely-missing"` to `PAGES`, run, and expect that one test to FAIL on the 200 assertion (the 404 page). Remove it again.

## Task 2: The Python runtime is served from our own origin

School filters block third-party CDNs, so the runtime must come from `/pyodide/`. A missing or truncated file silently breaks every exercise.

- [ ] **Step 1: Add the test**

```ts
const PYODIDE_FILES: Array<[string, number]> = [
  ["pyodide.js", 10_000],
  ["pyodide.asm.js", 1_000_000],
  ["pyodide.asm.wasm", 5_000_000],
  ["python_stdlib.zip", 1_000_000],
  ["pyodide-lock.json", 50_000],
];

for (const [file, minBytes] of PYODIDE_FILES) {
  test(`the Python runtime file ${file} is served from our own origin`, async ({ request }) => {
    const response = await request.fetch(`/pyodide/v0.26.4/${file}`, { method: "HEAD" });
    expect(response.status()).toBe(200);
    expect(Number(response.headers()["content-length"] ?? 0)).toBeGreaterThan(minBytes);
  });
}
```

- [ ] **Step 2: Run it**

Run: `npx playwright test tests/smoke.spec.ts -g "Python runtime" --reporter=list`
Expected: 5 passed. If a `content-length` header is absent (chunked response), change that file's assertion to a GET and check the body length instead.

## Task 3: The pilot entry points work signed out

- [ ] **Step 1: Add the tests**

```ts
test("the pilot page leads to class setup, and signed out that explains itself", async ({ page }) => {
  await page.goto("/pilot?src=smoke");
  await expect(page.getByRole("link", { name: "Set it up now" }).first()).toHaveAttribute("href", /\/teach\/new/);
  const response = await page.goto("/teach/new");
  expect(response?.status()).toBeLessThan(500);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("an invite link that matches no class says so instead of erroring", async ({ page }) => {
  const response = await page.goto("/join/ZZZZZZ");
  expect(response?.status()).toBeLessThan(500);
  await expect(page.getByRole("heading", { level: 1, name: /doesn.t match a class/i })).toBeVisible();
});
```

Note: on a project with Supabase configured, `/teach/new` signed out redirects to sign-in rather than showing "Class setup isn't available here"; both are fine, so the test only asserts a non-5xx status and a visible heading.

- [ ] **Step 2: Run it**

Run: `npx playwright test tests/smoke.spec.ts -g "pilot page|invite link" --reporter=list`
Expected: 2 passed.

## Task 4: Things that must and must not be public

- [ ] **Step 1: Add the tests**

```ts
test("the founder metrics page is hidden from signed-out visitors", async ({ request }) => {
  const response = await request.get("/admin/metrics", { maxRedirects: 0 });
  expect(response.status()).toBe(404);
});

test("the printable leave-behind is not offered to search engines", async ({ page }) => {
  await page.goto("/pilot/leave-behind");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const sitemap = await page.request.get("/sitemap.xml");
  expect(await sitemap.text()).not.toContain("leave-behind");
});

test("robots.txt matches the environment", async ({ request }) => {
  const body = await (await request.get("/robots.txt")).text();
  if (process.env.SMOKE_EXPECT_INDEXABLE === "1") {
    // Production: crawlable, with a sitemap.
    expect(body).not.toMatch(/Disallow:\s*\/\s*$/m);
    expect(body).toContain("Sitemap:");
  } else {
    // Local and preview deploys must not be indexed.
    expect(body).toMatch(/Disallow:\s*\/\s*$/m);
  }
});
```

- [ ] **Step 2: Run it**

Run: `npx playwright test tests/smoke.spec.ts -g "metrics|leave-behind|robots" --reporter=list`
Expected: 3 passed locally (dev is "not production", so `Disallow: /` is correct).

## Task 5: The command and the doc

**Files:**
- Modify: `package.json` (scripts)
- Modify: `docs/gtm/smoke-test.md` (after the intro paragraph)

- [ ] **Step 1: Add the script**

In `package.json`, after the `"test:e2e"` line add:

```json
    "smoke": "playwright test tests/smoke.spec.ts",
```

- [ ] **Step 2: Add the doc paragraph**

Insert after the "Run it:" list in `docs/gtm/smoke-test.md`:

```markdown
**Automated part (30 seconds, no account, writes nothing).** Before the click-through, run the public half against the deployed URL:

    PLAYWRIGHT_BASE_URL=https://your-url.example npm run smoke
    SMOKE_EXPECT_INDEXABLE=1 PLAYWRIGHT_BASE_URL=https://strikelab.dev npm run smoke   # production

It checks that the public pages load, the Python runtime is served from our own origin (the school-filter failure in step 4), the pilot entry points and invite-link errors behave, the founder metrics page is hidden, and robots.txt matches the environment. It does **not** cover anything below: sign-up, joining, completions, sync, the scorecard, capstones or deletion. Those need a real project and stay manual until staging exists.
```

- [ ] **Step 3: Run the whole smoke file**

Run: `npm run smoke -- --reporter=list`
Expected: 20 passed.

- [ ] **Step 4: Commit**

```bash
git add tests/smoke.spec.ts package.json docs/gtm/smoke-test.md docs/superpowers/plans/2026-10-08-post-deploy-smoke.md
git commit -m "test: npm run smoke checks the public half of the pilot journey on any URL"
```

## Task 6 (blocked on D4, not written): the signed-in half

Needs a staging Supabase project with email confirmation off, plus a service-role key in the shell for the SQL checks. When it exists: sign up a throwaway leader and student with plus-addressed emails, walk smoke-test steps 1–3 and 7, assert the SQL pass conditions through the admin client, and always delete both accounts in `afterAll`. Do not write it before staging exists: it could not be run, so it could not be trusted.

## Self-review

- **Coverage:** public pages (T1), Python runtime (T2), pilot entry and bad invite (T3), hidden admin, noindex, robots (T4), command and doc (T5). The manual steps 1–7 are covered by T6 or stay manual, and the doc says which.
- **Placeholders:** none; T6 is explicitly not written, with the reason.
- **Names:** `PYODIDE_FILES`, `PAGES` and `SMOKE_EXPECT_INDEXABLE` are used consistently.
