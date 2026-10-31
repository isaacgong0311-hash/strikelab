import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";

test("old achievements links permanently redirect to the dashboard", async ({ request, page }) => {
  const response = await request.get("/achievements", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/dashboard");
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Achievements" })).toBeVisible();
  await expect(page.locator('a[href="/achievements"]')).toHaveCount(0);
  if (process.env.FOLD_SCREENSHOTS) {
    mkdirSync("docs/pr-screenshots/T2.5", { recursive: true });
    await page.addStyleTag({ content: "nextjs-portal, .sl-skip-link { display: none !important; }" });
    for (const width of [1280, 375]) {
      await page.setViewportSize({ width, height: 900 });
      await page.screenshot({ path: `docs/pr-screenshots/T2.5/dashboard-achievements-${width}.png`, fullPage: true });
    }
  }
});

test("the sitemap omits the retired route", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  expect(await response.text()).not.toContain("/achievements");
});
