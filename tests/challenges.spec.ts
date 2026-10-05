import { expect, test } from "@playwright/test";

// Pro (weekly challenges) is paused for new sign-ups, and /pricing says so.
// The challenges page used to replace its Run button with "Unlock with Pro →
// Start free trial", which starts a real checkout for a product that isn't on
// sale. A visitor should be told why they can't run it, and offered somewhere
// to go, not sold something.
test("the challenges page does not sell a paused product", async ({ page }) => {
  await page.goto("/challenges");
  await expect(page.locator("html")).toHaveAttribute("data-client-ready", "true");
  await expect(page.getByText(/Weekly challenges are paused for new members/)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("link", { name: "Try the playground" })).toHaveAttribute("href", "/playground");

  for (const text of [/Unlock with Pro/, /Start free trial/, /Upgrade to compete/, /Pro members access/]) {
    await expect(page.getByText(text)).toHaveCount(0);
  }
  await expect(page.locator(".ch-pro-badge, .ch-pro-tag")).toHaveCount(0);
});
