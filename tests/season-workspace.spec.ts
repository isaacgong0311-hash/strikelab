import { expect, test, type Page } from "@playwright/test";

// The practice round runs real Python in the browser. The timed workspace is
// tested with its two API calls stubbed (a real attempt needs a database), so
// these run without Supabase.

test.setTimeout(120_000);

const SOLUTION = "from math import exp\ndef forward_price(S, r, T):\n    return S * exp(r * T)\n";
const EXPLANATION = "If the forward were cheaper or dearer than the cost of carrying the stock, you could lock in a risk-free profit.";

async function replaceCode(page: Page, code: string) {
  await page.locator(".cm-content").first().click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.insertText(code);
}

/** The checks panel (not the editor, which can contain the same words). */
const checksPanel = (page: Page) => page.locator("pre[role='status']");

async function startPractice(page: Page) {
  await page.goto("/seasons/practice");
  await expect(page.getByRole("heading", { level: 1, name: /Try a season challenge/ })).toBeVisible();
  await page.getByRole("button", { name: "Start the practice round" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Price a forward" })).toBeVisible();
}

test.describe("practice round", () => {
  test("passes with the right code, then summarises without saving anything", async ({ page }) => {
    await startPractice(page);
    await expect(page.getByRole("timer", { name: "Time left" })).toHaveText(/^1[45]:\d\d$/);
    await expect(page.getByRole("heading", { name: "Your numbers" })).toBeVisible();

    await replaceCode(page, SOLUTION);
    await page.getByRole("button", { name: "Run checks" }).click();
    await expect(checksPanel(page)).toContainText("All 4 checks passed.", { timeout: 60_000 });

    await page.getByLabel(/Explain why your answer is right/).fill(EXPLANATION);
    await page.getByRole("button", { name: "Finish practice" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Every check passed." })).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText(/Nothing from this round was saved or ranked/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Create a free account to play Season 1/ })).toBeVisible();
  });

  test("the starter code fails with a plain note, and finishing needs an explanation", async ({ page }) => {
    await startPractice(page);
    await page.getByRole("button", { name: "Run checks" }).click();
    await expect(checksPanel(page)).toContainText("0 of 4 checks passed", { timeout: 60_000 });
    await expect(checksPanel(page)).toContainText("NotImplementedError");
    await expect(page.getByRole("button", { name: "Finish practice" })).toBeDisabled();
    await expect(page.getByText(/of at least 20 characters/)).toBeVisible();
  });

  test("a deleted function can't pass from an earlier run", async ({ page }) => {
    await startPractice(page);
    await replaceCode(page, SOLUTION);
    await page.getByRole("button", { name: "Run checks" }).click();
    await expect(checksPanel(page)).toContainText("All 4 checks passed.", { timeout: 60_000 });
    await replaceCode(page, "x = 1\n");
    await page.getByRole("button", { name: "Run checks" }).click();
    await expect(checksPanel(page)).toContainText("0 of 4 checks passed", { timeout: 60_000 });
    await expect(checksPanel(page)).toContainText("NameError");
  });

  test("a reload keeps the draft and the same numbers", async ({ page }) => {
    await startPractice(page);
    const numbers = await page.locator("dl dd").allTextContents();
    await replaceCode(page, "# my work in progress\n" + SOLUTION);
    await page.getByLabel(/Explain why your answer is right/).fill("Half-written thought");
    await expect(page.getByText(/Draft saved on this device/)).toBeVisible();

    await page.reload();
    await expect(page.getByText(/Restored the draft you saved on this device/)).toBeVisible();
    await expect(page.locator(".cm-content").first()).toContainText("my work in progress");
    await expect(page.getByLabel(/Explain why your answer is right/)).toHaveValue("Half-written thought");
    expect(await page.locator("dl dd").allTextContents()).toEqual(numbers);
  });
});

// ── The timed workspace, with the API stubbed ────────────────────────────────

const started = (overrides: Record<string, unknown> = {}) => ({
  startedAt: new Date(Date.now() - 50 * 60_000).toISOString(),
  deadline: new Date(Date.now() + 10 * 60_000 + 2_000).toISOString(),
  status: "started",
  title: "Price a put from a call",
  entry: "put_from_parity",
  concept: "Put-call parity",
  prompt: "A European call costs 10. Write put_from_parity.",
  params: { C: 10, S: 100, K: 100, T: 1, r: 0.05 },
  starterCode: "def put_from_parity(call, S, K, T, r):\n    raise NotImplementedError\n",
  previewTest: "pass",
  ...overrides,
});

async function stubStart(page: Page, body: unknown, serverAheadMs = 0) {
  await page.route("**/api/seasons/challenges/*/start", (route) =>
    route.fulfill({ json: body, headers: { date: new Date(Date.now() + serverAheadMs).toUTCString() } }),
  );
}

test.describe("timed challenge workspace", () => {
  test("shows the student's numbers and warns at ten minutes", async ({ page }) => {
    await stubStart(page, started());
    await page.goto("/seasons/s1-w1");
    await page.getByRole("button", { name: "Start the challenge" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Price a put from a call" })).toBeVisible();
    await expect(page.locator("dl dt", { hasText: "K" })).toBeVisible();
    await expect(page.getByText("The AI tutor is off until you submit.", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("10 minutes left").first()).toBeVisible({ timeout: 10_000 });
    // The site header is replaced by the workspace's own bar.
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toHaveCount(0);
  });

  test("follows the server's clock, not a device clock that is wrong", async ({ page }) => {
    // The server is 10 minutes ahead of this device, and the deadline is 60 minutes of device time away:
    // the student really has about 50 minutes.
    await stubStart(page, started({
      startedAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 60 * 60_000).toISOString(),
    }), 10 * 60_000);
    await page.goto("/seasons/s1-w1");
    await page.getByRole("button", { name: "Start the challenge" }).click();
    await expect(page.getByRole("timer", { name: "Time left" })).toHaveText(/^(49|50):\d\d$/);
  });

  test("asks before the one submission, then confirms", async ({ page }) => {
    await stubStart(page, started({ deadline: new Date(Date.now() + 40 * 60_000).toISOString() }));
    let body: { code?: string; explanation?: string; previewPassed?: boolean } = {};
    await page.route("**/api/seasons/challenges/*/submit", async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ json: { submittedAt: new Date().toISOString() } });
    });
    await page.goto("/seasons/s1-w1");
    await page.getByRole("button", { name: "Start the challenge" }).click();
    await page.getByLabel(/Explain why your answer is right/).fill(EXPLANATION);
    await page.getByRole("button", { name: "Submit", exact: true }).click();
    await expect(page.getByText(/You can.t change your answer after this/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Yes, submit" })).toBeFocused();
    await page.getByRole("button", { name: "Keep working" }).click();
    await expect(page.getByRole("button", { name: "Submit", exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Submit", exact: true }).click();
    await page.getByRole("button", { name: "Yes, submit" }).click();
    await expect(page.getByText(/Submitted\. Your official score appears/)).toBeVisible();
    expect(body.explanation).toBe(EXPLANATION);
    expect(body.previewPassed).toBe(false);
    expect(body.code).toContain("put_from_parity");
  });

  test("closes submissions when time is up", async ({ page }) => {
    await stubStart(page, started({ deadline: new Date(Date.now() - 5_000).toISOString() }));
    await page.goto("/seasons/s1-w1");
    await page.getByRole("button", { name: "Start the challenge" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Time is up. Submissions are closed." })).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit", exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Back to the season" }).last()).toBeVisible();
  });

  test("tells a signed-out visitor to sign in", async ({ page }) => {
    await page.route("**/api/seasons/challenges/*/start", (route) => route.fulfill({ status: 401, json: { error: "Not authenticated" } }));
    await page.goto("/seasons/s1-w1");
    await page.getByRole("button", { name: "Start the challenge" }).click();
    await expect(page.locator("p[role='alert']")).toContainText("Sign in to start the challenge.");
    await expect(page.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", /\/sign-in\?next=/);
  });
});

test("the seasons page leads with the practice round and the opening", async ({ page }) => {
  await page.goto("/seasons");
  await expect(page.getByRole("link", { name: "Try a practice round" })).toHaveAttribute("href", "/seasons/practice");
  await expect(page.getByText(/Opens in \d+ days? ·|Live now|Season ended/)).toBeVisible();
});
