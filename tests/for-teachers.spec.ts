import { expect, test } from "@playwright/test";

test("the teachers page offers the pilot above the fold", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/for-teachers");
  const pilot = page.getByRole("link", { name: "Start a free pilot →" });
  await expect(pilot).toHaveAttribute("href", "/pilot?src=for-teachers");
  const box = (await pilot.boundingBox())!;
  expect(box.y + box.height, "the pilot action is below the first screen").toBeLessThanOrEqual(812);
});
