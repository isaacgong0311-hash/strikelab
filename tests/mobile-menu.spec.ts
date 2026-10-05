import { expect, test } from "@playwright/test";

// At the top of the home page the nav bar sits under a 32px announcement bar, so
// its bottom edge is at 92px, not 60. The menu panel used to hang from a fixed
// 60px: the header covered the first link, and on a short phone the last link
// sat below the screen.
for (const size of [{ width: 375, height: 812 }, { width: 360, height: 560 }]) {
  test(`the mobile menu clears the header and reaches its last link at ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-client-ready", "true");
    await page.getByRole("button", { name: "Open menu" }).click();

    const panel = page.locator("#mobile-navigation");
    await expect(panel).toBeVisible();
    const navBottom = await page.locator("nav.nav-bar").evaluate((el) => el.getBoundingClientRect().bottom);
    const first = await panel.getByRole("link", { name: "Lessons" }).first().boundingBox();
    expect(first!.y, "first link is under the header").toBeGreaterThanOrEqual(navBottom - 1);

    // The panel scrolls inside itself, and its bottom edge is on screen.
    const box = await panel.boundingBox();
    expect(box!.y + box!.height, "panel runs off the screen").toBeLessThanOrEqual(size.height + 1);
    const last = panel.getByRole("link").last();
    await last.scrollIntoViewIfNeeded();
    const lastBox = await last.boundingBox();
    expect(lastBox!.y + lastBox!.height, "last link is below the screen").toBeLessThanOrEqual(size.height + 1);
  });
}
