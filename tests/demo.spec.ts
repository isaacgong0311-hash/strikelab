import { expect, test } from "@playwright/test";

test("the demo's kickoff panel plays sample data and is labelled as such", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/demo", { waitUntil: "networkidle" });
  const panel = page.getByRole("region", { name: "Kickoff day" });
  await expect(panel).toBeVisible();
  await expect(panel.getByText("Sample data:")).toBeVisible();

  const slider = panel.getByRole("slider");
  await slider.fill("0");
  await expect(panel.getByText("No one has joined yet")).toBeVisible();
  await slider.fill("10");
  await expect(panel.getByText("Maya R.")).toBeVisible();
  await expect(panel.getByText("Zoe P.")).toBeVisible();
});

test("the lesson player is a focused task: no site header or footer, and an exit", async ({ page }) => {
  await page.goto("/learn/inv-1.1", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: /Exit session/ })).toBeVisible();
  await expect(page.getByRole("banner").filter({ hasText: "StrikeLab" })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: /main|primary/i })).toHaveCount(0);
  await expect(page.getByRole("contentinfo")).toHaveCount(0);
  // Content starts near the top of a phone screen.
  await page.setViewportSize({ width: 375, height: 700 });
  const top = await page.getByRole("link", { name: /Exit session/ }).boundingBox();
  expect(top!.y).toBeLessThan(64);
});

test("the dashboard does not say 'Welcome back' to a first-time visitor", async ({ page }) => {
  await page.goto("/dashboard", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Start here");
});

test("a broken page shows a friendly error, not a blank screen", async ({ page }) => {
  const res = await page.goto("/this-page-does-not-exist-123");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("doesn");
});
