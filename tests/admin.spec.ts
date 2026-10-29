import { expect, test } from "@playwright/test";

test("the founder metrics page is a plain 404 for anyone who isn't a listed founder", async ({ page }) => {
  const res = await page.goto("/admin/metrics");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("doesn");
  await expect(page.getByText("Founder metrics")).toHaveCount(0);
});

test("season operations and submission review are 404s for non-founders", async ({ page }) => {
  for (const path of [
    "/admin/seasons",
    "/admin/seasons/review/s1-w1/11111111-1111-4111-8111-111111111111",
  ]) {
    const res = await page.goto(path);
    expect(res?.status()).toBe(404);
    await expect(page.getByText("Founder only")).toHaveCount(0);
  }
});
