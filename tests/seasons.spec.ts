import { expect, test } from "@playwright/test";

// Without a database (CI and local runs), /seasons shows the planned season
// and how it works; /intensive takes a waitlist entry only with consent.
test("the seasons page explains the season without a database", async ({ page }) => {
  await page.goto("/seasons");
  await expect(page.getByRole("heading", { level: 1, name: /Prove you can do quant work/ })).toBeVisible();
  await expect(page.getByText(/Season 1: November 30 to December 20/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "How a season works" })).toBeVisible();
  await expect(page.getByText(/AI tutor switches off/)).toBeVisible();
});

test("the intensive page shows the price and asks a parent to confirm before joining", async ({ page }) => {
  await page.goto("/intensive");
  await expect(page.getByText(/\$349/).first()).toBeVisible();
  await expect(page.getByText(/Nothing is charged now/)).toBeVisible();
  await page.getByLabel("Parent or guardian email").fill("parent@example.com");
  // The browser blocks submission until the guardian box is ticked.
  await page.getByRole("button", { name: "Join the waitlist" }).click();
  await expect(page.getByText(/You're on the list/)).toHaveCount(0);
});
