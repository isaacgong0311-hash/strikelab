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

// Records and defenses (0025). Without a database the private record explains
// itself, shared links 404, and the founder page never reveals it exists.
test("the record page explains itself without a database, and unknown or bad links 404", async ({ page }) => {
  await page.goto("/record");
  await expect(page.getByText(/Records need the database/)).toBeVisible();
  const shared = await page.goto("/record/11111111-1111-4111-8111-111111111111");
  expect(shared?.status()).toBe(404);
  const bad = await page.goto("/record/not-a-token");
  expect(bad?.status()).toBe(404);
});

test("the defense sign-off page is a 404 for visitors", async ({ page }) => {
  const res = await page.goto("/admin/defenses");
  expect(res?.status()).toBe(404);
});
