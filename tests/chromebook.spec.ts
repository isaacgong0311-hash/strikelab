import { expect, test } from "@playwright/test";

// School Chromebooks: usually 1366×768 and slow (frontend master plan FW-7,
// FW-34). Nothing may scroll sideways or clip at that size, and Python must
// still start on a throttled CPU.

const ROUTES = ["/", "/lessons", "/learn/inv-1.1", "/lesson/3", "/demo", "/demo?view=student", "/sign-up", "/dashboard", "/challenges", "/clubs"];

test.describe("1366×768", () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  for (const route of ROUTES) {
    test(`${route} fits without sideways scrolling`, async ({ page }, testInfo) => {
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("data-client-ready", "true");
      await expect(page.locator("h1").first()).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      await testInfo.attach(`${route} at 1366x768`, { body: await page.screenshot(), contentType: "image/png" });
    });
  }
});

test("Python starts on a 4× throttled CPU", async ({ page }) => {
  test.setTimeout(120_000);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  const started = Date.now();
  await page.goto("/lesson/3", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => "__pyodideReady" in window, null, { timeout: 60_000 });
  const two = await page.evaluate(async () => {
    const ready = (window as unknown as { __pyodideReady?: Promise<{ runPython(code: string): unknown }> }).__pyodideReady;
    return (await ready!).runPython("1 + 1");
  });
  const seconds = (Date.now() - started) / 1000;
  expect(two).toBe(2);
  test.info().annotations.push({ type: "python-ready-seconds", description: seconds.toFixed(1) });
  console.log(`Python ready on a 4x throttled CPU in ${seconds.toFixed(1)}s`);
  // A regression guard, generous for shared CI runners; the target is 15s
  // (tracked in the frontend master plan, FW-34).
  expect(seconds).toBeLessThan(60);
});
