import { expect, test, type Page } from "@playwright/test";

// Scroll-reveal animation must never leave content invisible. Lesson bodies
// are many viewports tall, so a fractional IntersectionObserver threshold
// could never fire and lessons rendered blank in production.

// Phone-sized: 15% of a lesson body is taller than this viewport, which is
// exactly the case the old threshold could never satisfy.
test.use({ viewport: { width: 375, height: 667 } });

async function opacityOf(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((el) => Number(getComputedStyle(el).opacity));
}

test("lesson body becomes visible after scrolling into it", async ({ page }) => {
  await page.goto("/lesson/1");
  const body = page.locator(".lesson-content").first();
  await body.scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 1500);
  await expect.poll(() => opacityOf(page, ".lesson-content"), { timeout: 3000 }).toBe(1);
  await expect(page.getByRole("heading", { name: "A 2,600-Year-Old Idea" })).toBeVisible();
});

test("lesson content deep-linked below the fold is visible", async ({ page }) => {
  await page.goto("/lesson/1");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await expect.poll(() => opacityOf(page, ".lesson-content"), { timeout: 3000 }).toBe(1);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("lesson body renders visibly", async ({ page }) => {
    await page.goto("/lesson/1");
    expect(await opacityOf(page, ".lesson-content")).toBe(1);
    await expect(page.getByRole("heading", { name: "A 2,600-Year-Old Idea" })).toBeVisible();
  });
});

test.describe("reduced motion", () => {
  test.use({ colorScheme: "light", reducedMotion: "reduce" });

  test("nothing waits on an observer", async ({ page }) => {
    await page.goto("/");
    const pending = await page.locator("[data-sl-reveal]").count();
    expect(pending).toBe(0);
  });
});
