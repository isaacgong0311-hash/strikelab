import { expect, test } from "@playwright/test";

test("teacher links permanently redirect to the clubs page with AP connections", async ({ request, page }) => {
  const response = await request.get("/for-teachers", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/clubs");

  await page.goto("/clubs#clubs-ap");
  await expect(page.getByRole("heading", { name: "AP Statistics connections" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AP Calculus connections" })).toBeVisible();
  await expect(page.locator('a[href="/for-teachers"]')).toHaveCount(0);
});

test("the sitemap omits the retired teacher page", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  expect(await response.text()).not.toContain("/for-teachers");
});
