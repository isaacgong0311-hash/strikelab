import { expect, test } from "@playwright/test";

// School web filters sometimes block third-party CDNs. The Python runtime is
// served from our own origin (scripts/copy-pyodide.mjs), so exercises must
// work with cdn.jsdelivr.net unreachable (mega plan Q1).

test.setTimeout(90_000);

test("a lesson exercise runs Python with the CDN blocked", async ({ page }) => {
  await page.route(/cdn\.jsdelivr\.net/, (route) => route.abort());
  const pyodideRequests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/pyodide/")) pyodideRequests.push(new URL(r.url()).pathname);
  });

  await page.goto("/lesson/3", { waitUntil: "domcontentloaded" });
  // The runtime loads in the background as soon as the exercise is on screen.
  await page.waitForFunction(() => "__pyodideReady" in window && (window as { __pyodideReady?: unknown }).__pyodideReady, null, { timeout: 30_000 });
  const two = await page.evaluate(async () => {
    const ready = (window as unknown as { __pyodideReady?: Promise<{ runPython(code: string): unknown }> }).__pyodideReady;
    if (!ready) throw new Error("the lesson didn't start loading Python");
    return (await ready).runPython("1 + 1");
  });
  expect(two).toBe(2);
  expect(pyodideRequests.some((p) => p.endsWith("pyodide.asm.wasm"))).toBe(true);

  // Run reports a real result (the starter code fails its tests), not a hang.
  await page.getByRole("button", { name: /run/i }).first().click();
  await expect(page.getByText("Running tests…")).toBeHidden({ timeout: 30_000 });
  await expect(page.getByText(/Python couldn't load/)).toHaveCount(0);
});

test("with every Python source blocked, Run says so instead of hanging", async ({ page }) => {
  await page.route(/cdn\.jsdelivr\.net|\/pyodide\//, (route) => route.abort());
  await page.goto("/lesson/3", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => "__pyodideReady" in window, null, { timeout: 30_000 });
  await page.getByRole("button", { name: /run/i }).first().click();
  await expect(page.getByText(/Python couldn't load/)).toBeVisible({ timeout: 30_000 });
});
