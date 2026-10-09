import { expect, test } from "@playwright/test";

// A first visit used to open on zeros: "0 streak, 0 XP" on the path, and ten
// zero-value widgets on the dashboard. Stats appear once there is something to
// count; a returning student still sees them.

const RETURNING = { completed: ["1"], xp: 100, streak: 1, lastActivityDate: new Date().toISOString().slice(0, 10), activityByDate: {} };

async function ready(page: import("@playwright/test").Page, path: string) {
  await page.goto(path);
  await expect(page.locator("html")).toHaveAttribute("data-client-ready", "true");
}

test("a first-time visitor's path has no zero stats and says Start here", async ({ page }) => {
  await ready(page, "/lessons");
  await expect(page.getByRole("link", { name: /Start here/ })).toBeVisible();
  await expect(page.locator(".dstat", { hasText: /streak|XP/ })).toHaveCount(0);
  await expect(page.locator(".dstat", { hasText: "done" })).toContainText("0/23");
});

test("a first-time visitor's dashboard leads with one action, not ten zeros", async ({ page }) => {
  await ready(page, "/dashboard");
  await expect(page.getByRole("link", { name: /Start learning/ })).toBeVisible();
  for (const heading of ["Level & XP", "Solved by difficulty", "Activity"]) {
    await expect(page.getByRole("heading", { name: heading })).toHaveCount(0);
  }
  await expect(page.locator(".db-metric-l", { hasText: "Day streak" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Curriculum" })).toBeVisible();
});

test("a returning student still sees their stats", async ({ page }) => {
  await page.addInitScript((progress) => localStorage.setItem("strikelab_progress_v2", JSON.stringify(progress)), RETURNING);
  await ready(page, "/dashboard");
  await expect(page.locator(".db-metric-l", { hasText: "Day streak" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Level & XP" })).toBeVisible();
  await ready(page, "/lessons");
  await expect(page.locator(".dstat", { hasText: "XP" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Recommended next/ })).toBeVisible();
});
