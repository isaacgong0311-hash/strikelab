import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Lesson 3 is where the pilot meets Black-Scholes. Its formulas must be real
// typeset maths (a fraction for d1, not a slash on one line) with a MathML
// twin for screen readers, and the lesson must stay axe-clean.

test("lesson 3 typesets Black-Scholes", async ({ page }) => {
  await page.goto("/lesson/3", { waitUntil: "networkidle" });
  const blocks = page.locator(".lesson-content .katex-display");
  await expect(blocks.first()).toBeVisible();
  expect(await blocks.count()).toBeGreaterThanOrEqual(4);
  await expect(page.locator(".lesson-content .katex-display .mfrac").first()).toBeVisible();
  await expect(page.locator(".lesson-content .katex-mathml math").first()).toBeAttached();

  const results = await new AxeBuilder({ page }).include(".lesson-content").analyze();
  const blocking = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
  expect(blocking, blocking.map((v) => `${v.id}: ${v.help}`).join("\n")).toEqual([]);
});

// 320px is the WCAG reflow width the accessibility suite already uses. Before
// the fix, d2's display formula (345px) pushed the page 49px sideways there.
test("long formulas scroll inside their block on a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/lesson/3", { waitUntil: "networkidle" });
  await expect(page.locator(".lesson-content .katex-display").first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "page scrolls sideways").toBeLessThanOrEqual(0);

  // A formula that scrolls has to be reachable by keyboard, or axe flags it
  // (scrollable-region-focusable). The desktop test above never scrolls one.
  const results = await new AxeBuilder({ page }).include(".lesson-content").analyze();
  const blocking = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
  expect(blocking, blocking.map((v) => `${v.id}: ${v.help}`).join("\n")).toEqual([]);
  const scrolling = page.locator(".lesson-content .katex-display", { has: page.locator(".mfrac") }).first();
  await scrolling.focus();
  await expect(scrolling).toBeFocused();
});

test("a session step shows its formula typeset", async ({ page }) => {
  await page.goto("/learn/inv-5.3", { waitUntil: "networkidle" });
  await expect(page.locator(".katex-display")).toBeVisible();
  await expect(page.locator(".katex-display .mfrac")).toBeVisible();
});

test("a session formula stays axe-clean on a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/learn/inv-5.3", { waitUntil: "networkidle" });
  await expect(page.locator(".katex-display")).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
  expect(blocking, blocking.map((v) => `${v.id}: ${v.help}`).join("\n")).toEqual([]);
});

// React 19 compares dangerouslySetInnerHTML by object identity, so a fresh
// { __html } on every render rewrote each section's innerHTML whenever the
// lesson re-rendered: the typeset formulas were torn down and rebuilt, any
// text selection was lost, and the rebuilt first paragraph counted as a new,
// later LCP. Answering a checkpoint re-renders the lesson.
test("re-rendering the lesson keeps its typeset body in place", async ({ page }) => {
  await page.goto("/lesson/3", { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-client-ready", "true");
  await page.evaluate(() => {
    const w = window as unknown as { __probe: Element[] };
    w.__probe = [
      document.querySelector(".lesson-content p")!,
      document.querySelector(".lesson-content .katex-display")!,
    ];
  });

  await page.getByRole("complementary", { name: "Checkpoint 1" }).getByRole("button").first().click();
  await expect(page.getByRole("complementary", { name: "Checkpoint 1" }).locator(".cp-explain")).toBeVisible();

  const connected = await page.evaluate(() =>
    (window as unknown as { __probe: Element[] }).__probe.map((el) => el.isConnected),
  );
  expect(connected, "[first paragraph, first formula] still in the document").toEqual([true, true]);
});
