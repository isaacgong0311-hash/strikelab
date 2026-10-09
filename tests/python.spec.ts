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
  // The runtime loads in the background once the exercise is about a screen away.
  await page.getByRole("button", { name: /run/i }).first().scrollIntoViewIfNeeded();
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
  await expect(page.locator("html")).toHaveAttribute("data-client-ready", "true");
  await page.getByRole("button", { name: /run/i }).first().click();
  await expect(page.getByText(/Python couldn't load/)).toBeVisible({ timeout: 30_000 });
});

// Python is about 5.8 MB the first time. Opening a lesson must not fetch it:
// a class opening lesson 3 together would pull it all at once through the
// school network (roadmap BV-X6). It starts once the exercise is near.
test("a lesson fetches Python only when its exercise is near", async ({ page }) => {
  const pyodideRequests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/pyodide/")) pyodideRequests.push(new URL(r.url()).pathname);
  });

  await page.goto("/lesson/3", { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-client-ready", "true");
  expect(pyodideRequests, "Python was fetched before the exercise was near").toEqual([]);

  await page.getByRole("button", { name: /run/i }).first().scrollIntoViewIfNeeded();
  await expect.poll(() => pyodideRequests.some((p) => p.endsWith("pyodide.asm.wasm")), { timeout: 30_000 }).toBe(true);
});

// Pyodide throws the whole traceback, Pyodide's own frames included. A student
// who presses Run on the untouched starter code should read one sentence, not
// `/lib/python312.zip/_pyodide/_base.py` and a row of carets.
test("a failed first run reads as a sentence, not a Python traceback", async ({ page }) => {
  await page.goto("/lesson/1", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-client-ready", "true");
  const exercise = page.locator("section[aria-labelledby=coding-exercise-title]");
  await exercise.getByRole("button", { name: /run/i }).first().click();

  const output = exercise.getByRole("alert");
  await expect(output).toContainText("A test didn't pass", { timeout: 60_000 });
  await expect(output).not.toContainText(/Traceback|_pyodide|\.py"|\^\^/);
});
