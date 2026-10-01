import { expect, test } from "@playwright/test";

// School Chromebooks are usually 1366x768 (frontend plan FW-7). The first
// screens leaders and students see must not clip, overlap the edge or scroll
// sideways at that size. Screenshots land in test-results/ for a quick look.
test.use({ viewport: { width: 1366, height: 768 } });

const ROUTES = [
  { path: "/", name: "home" },
  { path: "/demo", name: "demo-teacher" },
  { path: "/demo?view=student", name: "demo-student" },
  { path: "/learn/inv-1.1", name: "player" },
  { path: "/lesson/3", name: "lesson" },
  { path: "/sign-up", name: "sign-up" },
  { path: "/pilot", name: "pilot" },
];

for (const { path, name } of ROUTES) {
  test(`${path} fits a 1366x768 Chromebook`, async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path, { waitUntil: "networkidle" });
    await expect(page.locator("h1").first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, "page scrolls sideways").toBeLessThanOrEqual(0);
    await page.screenshot({ path: info.outputPath(`${name}-1366.png`) });
  });
}
