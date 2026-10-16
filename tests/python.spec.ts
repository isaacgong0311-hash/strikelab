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

// A student typing `while True:` used to freeze their whole tab. Python now
// runs in a worker with a time limit (build plan T3.3).
test("an infinite loop is stopped, explained, and the page stays usable", async ({ page }) => {
  await page.goto("/lesson/3", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => "__pyodideReady" in window && (window as { __pyodideReady?: unknown }).__pyodideReady, null, { timeout: 30_000 });

  const result = await page.evaluate(async () => {
    type Runtime = { runPython(code: string, o?: { timeoutMs?: number }): Promise<unknown> };
    const ready = (window as unknown as { __pyodideReady?: Promise<Runtime> }).__pyodideReady;
    if (!ready) throw new Error("no runtime");
    const runtime = await ready;
    const started = performance.now();
    try {
      await runtime.runPython("while True: pass", { timeoutMs: 1500 });
      return { stopped: false, ms: 0, name: "", message: "" };
    } catch (e) {
      const err = e as Error;
      return { stopped: true, ms: performance.now() - started, name: err.name, message: err.message };
    }
  });
  expect(result.stopped).toBe(true);
  expect(result.name).toBe("PythonTimeoutError");
  expect(result.message).toMatch(/loop that never ends/);
  expect(result.ms).toBeLessThan(8_000);
  // The page's main thread was never blocked: this round trip would hang otherwise.
  expect(await page.evaluate(() => 1 + 1)).toBe(2);
});

test("pressing Run on `while True:` shows the explanation and the next Run works", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/lesson/3", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => "__pyodideReady" in window, null, { timeout: 30_000 });

  const editor = page.locator(".cm-content").first();
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("while True:\n    pass\n");
  await page.getByRole("button", { name: /run/i }).first().click();
  await expect(page.getByText(/ran for more than 10 seconds/)).toBeVisible({ timeout: 40_000 });

  // A fresh Python starts on the next Run; the starter code fails its tests, which is a real result.
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("x = 1\n");
  await page.getByRole("button", { name: /run/i }).first().click();
  await expect(page.getByText(/ran for more than 10 seconds/)).toBeHidden({ timeout: 60_000 });
  await expect(page.getByText(/Python couldn't load/)).toHaveCount(0);
});

// Kickoff helper: students open /warmup so Python is downloaded before the
// first exercise, not during it (build plan T3.4).
test("the warm-up page loads Python and says the lab is ready", async ({ page }) => {
  await page.goto("/warmup", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Your lab is ready/ })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole("link", { name: "Continue" })).toBeVisible();
});

test("the warm-up page says so, and offers Try again, when Python can't load", async ({ page }) => {
  await page.route(/cdn\.jsdelivr\.net|\/pyodide\//, (route) => route.abort());
  await page.goto("/warmup", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Python didn't load/ })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText(/ask IT to allow strikelab\.dev/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});
