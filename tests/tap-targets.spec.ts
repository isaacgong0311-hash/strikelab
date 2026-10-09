import { expect, test } from "@playwright/test";

// Footer links are 16px tall, and the announcement bar's link is 11px text in a
// 32px bar. Both were nearly unhittable with a thumb. The touch area now fills a
// 44px row on touch screens without moving the text or its underline, so this
// asks the browser what a tap at the edge of the row would hit.
test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });

async function hitsLinkAt(page: import("@playwright/test").Page, linkText: string, dy: number) {
  const link = page.getByRole("link", { name: linkText, exact: true }).first();
  await link.scrollIntoViewIfNeeded();
  const box = (await link.boundingBox())!;
  return page.evaluate(
    ({ x, y, text }) => document.elementFromPoint(x, y)?.closest("a")?.textContent?.trim() === text,
    { x: box.x + Math.min(box.width / 2, 12), y: box.y + box.height / 2 + dy, text: linkText },
  );
}

test("footer links can be tapped from 20px above or below their text", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-client-ready", "true");
  expect(await hitsLinkAt(page, "Free pilot", -20)).toBe(true);
  expect(await hitsLinkAt(page, "Free pilot", 20)).toBe(true);
});

test("footer rows are 44px apart on a phone, so touch areas don't overlap", async ({ page }) => {
  await page.goto("/");
  const tops = await page.locator("footer a.v2-foot-link").evaluateAll((links) =>
    links.slice(0, 4).map((a) => a.getBoundingClientRect().top),
  );
  for (let i = 1; i < tops.length; i++) expect(tops[i] - tops[i - 1]).toBeGreaterThanOrEqual(43);
});

test("the announcement bar link can be tapped from just outside its text", async ({ page }) => {
  await page.goto("/");
  expect(await hitsLinkAt(page, "Clubs & teachers: free pilots this fall →", -12)).toBe(true);
});
