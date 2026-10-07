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

test.describe("guided demo", () => {
  test("plays on its own, and the controls step through the scenes", async ({ page }) => {
    await page.goto("/demo?view=tour", { waitUntil: "networkidle" });
    const tour = page.getByRole("region", { name: "Watch a club's six weeks" });
    await expect(tour.getByRole("button", { name: "Pause" })).toBeVisible();
    await tour.getByRole("button", { name: "Pause" }).click();
    await expect(tour.getByRole("button", { name: "Play" })).toBeVisible();

    await tour.getByRole("button", { name: "Next →" }).click();
    await expect(tour.getByText("Step 2 of 8")).toBeVisible();
    // Stepped to by hand, the kickoff shows the end of the meeting, not an empty room.
    await expect(tour.getByText("Zoe P.")).toBeVisible();

    await tour.getByRole("button", { name: /Write the code/ }).click();
    await expect(tour.getByText("def black_scholes_call")).toBeVisible();
    await expect(tour.getByRole("button", { name: /Write the code/ })).toHaveAttribute("aria-current", "step");

    await tour.getByRole("button", { name: "← Back" }).click();
    await expect(tour.getByText("Step 3 of 8")).toBeVisible();
  });

  test("does not autoplay for visitors who prefer reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/demo?view=tour", { waitUntil: "networkidle" });
    const tour = page.getByRole("region", { name: "Watch a club's six weeks" });
    await expect(tour.getByRole("button", { name: "Play" })).toBeVisible();
    await page.waitForTimeout(1500);
    await expect(tour.getByText("Step 1 of 8")).toBeVisible();
  });
});
