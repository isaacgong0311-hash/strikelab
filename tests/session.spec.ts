import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Bite-sized session player: a full keyboard-only run of inv-1.1, including
// a wrong answer that must come back before the session can finish.

const shots = process.env.SESSION_SHOTS_DIR;

async function shot(page: Page, name: string) {
  if (shots) await page.screenshot({ path: `${shots}/${name}.png` });
}

/** Navigate and wait for hydration: keyboard shortcuts attach on the client. */
async function open(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("html")).toHaveAttribute("data-client-ready", "true");
}

async function continueButton(page: Page) {
  return page.getByRole("button", { name: /^(Continue|Check)$/ });
}

test.use({ viewport: { width: 390, height: 844 } });

test("a learner can finish a session with the keyboard, retrying a missed question", async ({ page }) => {
  await open(page, "/learn/inv-1.1");
  await expect(page.getByRole("heading", { level: 1, name: "Companies need money" })).toBeVisible();
  await shot(page, "1-explain");

  // Explain → Continue
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1, name: /What does owning stock/ })).toBeFocused();

  // Wrong answer with a number key, then check with Enter
  await page.keyboard.press("2");
  await expect(page.getByRole("radio", { name: /A loan to the company/ })).toBeChecked();
  await shot(page, "2-selected");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Correct answer: A proportional claim");
  await expect(page.getByRole("status")).toContainText("see this one again");
  await expect(await continueButton(page)).toBeFocused();
  await shot(page, "3-wrong");
  await page.keyboard.press("Enter");

  // Explain
  await expect(page.getByRole("heading", { level: 1, name: "Ownership is proportional" })).toBeVisible();
  await page.keyboard.press("Enter");

  // Numeric: typo-tolerant input
  await expect(page.getByRole("heading", { level: 1, name: /What percent of the company/ })).toBeVisible();
  await page.getByRole("textbox", { name: /Your answer in %/ }).fill("0.5%");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Nice!");
  await shot(page, "4-right");
  await page.keyboard.press("Enter");

  // Explain, then the profit question
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1, name: /hugely profitable year/ })).toBeVisible();
  await page.keyboard.press("2");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Nice!");
  await page.keyboard.press("Enter");

  // The missed question returns
  await expect(page.getByText("Let's try that again")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: /What does owning stock/ })).toBeVisible();
  await page.keyboard.press("1");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Nice!");
  await page.keyboard.press("Enter");

  // Complete screen
  await expect(page.getByRole("heading", { level: 1, name: "Session complete!" })).toBeVisible();
  await expect(page.getByText("67%")).toBeVisible(); // 2 of 3 questions right first time
  await expect(page.getByRole("link", { name: "Next session" })).toHaveAttribute("href", "/learn/inv-1.2");
  await shot(page, "5-complete");

  // The lesson page now offers to continue where the learner left off.
  await page.goto("/lesson/inv-1");
  const callout = page.getByRole("complementary", { name: /3 short sessions/ });
  await expect(callout).toContainText("1 of 3 done");
  await expect(callout.getByRole("link", { name: "Continue" })).toHaveAttribute("href", "/learn/inv-1.2");
});

test("Check stays disabled until an answer is chosen", async ({ page }) => {
  await open(page, "/learn/inv-1.1");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Check" })).toBeDisabled();
  // The transparent native radio covers the whole card, so clicking the card hits it.
  await page.getByRole("radio", { name: /A proportional claim/ }).click();
  await expect(page.getByRole("button", { name: "Check" })).toBeEnabled();
});

test("session player has no serious automated accessibility violations", async ({ page }) => {
  await open(page, "/learn/inv-1.1");
  await page.keyboard.press("Enter");
  await page.keyboard.press("2");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Correct answer");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});

test("unknown sessions 404", async ({ page }) => {
  const response = await page.goto("/learn/nope.1");
  expect(response?.status()).toBe(404);
});

test("finishing the last session completes the lesson and awards XP once", async ({ page }) => {
  const done = { completedAt: "2026-09-16T12:00:00Z", accuracy: 1, durationMs: 60_000 };
  await page.addInitScript((results) => {
    if (!localStorage.getItem("strikelab_sessions_v1")) {
      localStorage.setItem("strikelab_sessions_v1", JSON.stringify(results));
    }
  }, { "inv-1.1": done, "inv-1.2": done });

  await open(page, "/learn/inv-1.3");
  const answer = async (key: string) => {
    await page.keyboard.press(key);
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status")).toContainText("Nice!");
    await page.keyboard.press("Enter");
  };
  const type = async (value: string) => {
    await page.getByRole("textbox").fill(value);
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status")).toContainText("Nice!");
    await page.keyboard.press("Enter");
  };

  await page.keyboard.press("Enter"); // who sets the price
  await page.keyboard.press("Enter"); // P/E
  await type("25");
  await answer("3"); // high P/E
  await page.keyboard.press("Enter"); // market cap
  await type("20");
  await answer("2"); // large-cap
  await answer("2"); // market cap formula
  await page.keyboard.press("Enter"); // why prices move
  await answer("2"); // surprise product

  await expect(page.getByRole("heading", { level: 1, name: "Lesson complete!" })).toBeVisible();
  await expect(page.getByText("+100 XP")).toBeVisible();
  await expect(page.getByText("100%")).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to your path" })).toBeVisible();

  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("strikelab_progress_v2") ?? "{}"));
  expect(progress.completed).toContain("inv-1");
  expect(progress.xp).toBe(100);

  // Replaying the final session doesn't award XP again.
  await open(page, "/learn/inv-1.3");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await type("25");
  await answer("3");
  await page.keyboard.press("Enter");
  await type("20");
  await answer("2");
  await answer("2");
  await page.keyboard.press("Enter");
  await answer("2");
  await expect(page.getByRole("heading", { level: 1, name: "Lesson complete!" })).toBeVisible();
  await expect(page.getByText("+100 XP")).toHaveCount(0);
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem("strikelab_progress_v2") ?? "{}"));
  expect(after.xp).toBe(100);
});

test("path nodes show session progress and open the next unfinished session", async ({ page }) => {
  const done = { completedAt: "2026-09-16T12:00:00Z", accuracy: 1, durationMs: 60_000 };
  await page.addInitScript((results) => {
    localStorage.setItem("strikelab_sessions_v1", JSON.stringify(results));
  }, { "inv-1.1": done });

  await open(page, "/lessons");
  await expect(page.getByRole("link", { name: /What Is a Stock\?.*1 of 3 sessions done/ })).toHaveAttribute("href", "/learn/inv-1.2");
  await expect(page.getByRole("link", { name: /How Markets Work.*0 of 3 sessions done/ })).toHaveAttribute("href", "/learn/inv-2.1");
  await expect(page.getByRole("link", { name: /Recommended next/ })).toHaveAttribute("href", "/learn/inv-1.2");
});

test("a session keeps its first result when replayed", async ({ page }) => {
  const first = { completedAt: "2026-09-16T12:00:00Z", accuracy: 0.5, durationMs: 60_000 };
  await page.addInitScript((results) => {
    if (!localStorage.getItem("strikelab_sessions_v1")) {
      localStorage.setItem("strikelab_sessions_v1", JSON.stringify(results));
    }
  }, { "inv-2.1": first });

  await open(page, "/learn/inv-2.1");
  await expect(page.getByRole("heading", { level: 1, name: "Where trades happen" })).toBeVisible();
  const answer = async (key: string) => {
    await page.keyboard.press(key);
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status")).toContainText("Nice!");
    await page.keyboard.press("Enter");
  };
  await page.keyboard.press("Enter"); // exchanges
  await answer("2"); // payment for order flow
  await page.keyboard.press("Enter"); // bid and ask
  await page.getByRole("textbox").fill("0.25");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Nice!");
  await page.keyboard.press("Enter");
  await answer("2"); // market buy pays the ask
  await answer("3"); // spread definition

  await expect(page.getByRole("heading", { level: 1, name: "Session complete!" })).toBeVisible();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("strikelab_sessions_v1") ?? "{}"));
  expect(stored["inv-2.1"]).toEqual(first);
});
