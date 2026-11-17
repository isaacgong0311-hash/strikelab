import { expect, test, type Page } from "@playwright/test";

// The link row used to appear only at 1360px, so a 1280px laptop or a 1366px
// Chromebook got a hamburger and no links. These widths are where laptops and
// school Chromebooks actually sit.
const WIDTHS = [1024, 1100, 1280, 1366, 1440];
const VISITOR_LINKS = ["Seasons", "Lessons", "Market Lab", "For clubs", "For parents"];

/** A student with some progress sees the widest bar: streak and XP pills as well. */
async function withProgress(page: Page) {
  await page.addInitScript(() => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("strikelab_progress_v2", JSON.stringify({
      completed: ["1", "2"], xp: 230, streak: 4, lastActivityDate: today, activityByDate: { [today]: 1 },
    }));
  });
}

async function expectBarFits(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, "page scrolls sideways").toBeLessThanOrEqual(0);
  // One row: a wrapped bar would be well over twice this tall.
  const bar = await page.locator("nav.nav-bar").evaluate((el) => el.getBoundingClientRect().height);
  expect(bar, "the nav bar wrapped onto a second line").toBeLessThanOrEqual(64);
}

for (const width of WIDTHS) {
  test(`the nav shows its links and fits at ${width}px, with and without progress pills`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary navigation" });
    for (const name of VISITOR_LINKS) await expect(nav.getByRole("link", { name })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
    await expectBarFits(page);

    await withProgress(page);
    await page.goto("/lessons");
    for (const name of VISITOR_LINKS) await expect(nav.getByRole("link", { name })).toBeVisible();
    await expectBarFits(page);
  });
}

for (const width of [768, 1000]) {
  test(`below 1024px (${width}px) the links move into the menu`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Lessons" })).toBeHidden();
    await expectBarFits(page);
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("dialog", { name: "Mobile navigation" });
    for (const name of VISITOR_LINKS) await expect(menu.getByRole("link", { name })).toBeVisible();
  });
}

test("the header button opens the practice round, which needs no account", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const cta = page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: /Try a practice round/ });
  await expect(cta).toHaveAttribute("href", /\/seasons\/practice\?src=nav/);
  await cta.click();
  await expect(page).toHaveURL(/\/seasons\/practice/);
  await expect(page.getByRole("heading", { level: 1, name: /Try a season challenge/ })).toBeVisible();
});
