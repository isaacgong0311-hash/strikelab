import { expect, test } from "@playwright/test";

test("the founder metrics page is a plain 404 for anyone who isn't a listed founder", async ({ page }) => {
  const res = await page.goto("/admin/metrics");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("doesn");
  await expect(page.getByText("Founder metrics")).toHaveCount(0);
});
