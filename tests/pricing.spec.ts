import { expect, test } from "@playwright/test";

test("pricing presents free students and clubs with the optional Intensive waitlist", async ({ page }) => {
  await page.goto("/pricing");

  const plans = page.getByRole("region", { name: "Plans" });
  await expect(plans.getByRole("heading", { name: "Students" })).toBeVisible();
  await expect(plans.getByRole("heading", { name: "Clubs" })).toBeVisible();
  await expect(plans.getByRole("heading", { name: "Intensive" })).toBeVisible();
  await expect(plans.getByText("Free", { exact: true })).toHaveCount(2);
  await expect(plans.getByText("$349", { exact: true })).toHaveCount(1);
  await expect(plans.getByRole("link", { name: "Set up your club" })).toHaveAttribute("href", "/pilot?src=pricing");
  await expect(plans.getByRole("link", { name: "Join the waitlist" })).toHaveAttribute("href", "/intensive");
  await expect(plans.getByRole("link", { name: "hello@strikelab.app" })).toHaveAttribute("href", "mailto:hello@strikelab.app");
  await expect(page.getByText(/\$199|\$499/)).toHaveCount(0);
  await expect(page.locator('a[href*="/api/stripe/checkout"]')).toHaveCount(0);
});
