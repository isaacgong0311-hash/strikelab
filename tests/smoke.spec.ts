import { expect, test } from "@playwright/test";

// Post-deploy smoke check: read-only, no account, any URL.
//
//   PLAYWRIGHT_BASE_URL=https://<deployment> npm run smoke
//   SMOKE_EXPECT_INDEXABLE=1 PLAYWRIGHT_BASE_URL=https://strikelab.dev npm run smoke
//
// The public half of docs/gtm/smoke-test.md. Sign-up, joining, completions and
// capstones need a real Supabase project and stay manual.

const PAGES = ["/", "/pilot", "/clubs", "/demo", "/trust", "/pricing", "/lessons", "/faq", "/sign-in", "/sign-up"];

for (const path of PAGES) {
  test(`${path} loads with a heading and no script errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}

// School filters block third-party CDNs, so the Python runtime must come from
// our own origin. A missing or truncated file breaks every exercise silently.
const PYODIDE_FILES: Array<[string, number]> = [
  ["pyodide.js", 10_000],
  ["pyodide.asm.js", 1_000_000],
  ["pyodide.asm.wasm", 5_000_000],
  ["python_stdlib.zip", 1_000_000],
  ["pyodide-lock.json", 50_000],
];

for (const [file, minBytes] of PYODIDE_FILES) {
  test(`the Python runtime file ${file} is served from our own origin`, async ({ request }) => {
    const response = await request.fetch(`/pyodide/v0.26.4/${file}`, { method: "HEAD" });
    expect(response.status()).toBe(200);
    expect(Number(response.headers()["content-length"] ?? 0)).toBeGreaterThan(minBytes);
  });
}

test("the pilot page leads to class setup, and signed out that explains itself", async ({ page }) => {
  await page.goto("/pilot?src=smoke");
  await expect(page.getByRole("link", { name: "Set it up now" }).first()).toHaveAttribute("href", /\/teach\/new/);
  // With Supabase this redirects to sign-in; without it, it says setup isn't
  // available. Either is fine: it must not error.
  const response = await page.goto("/teach/new");
  expect(response?.status()).toBeLessThan(500);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("an invite link that matches no class says so instead of erroring", async ({ page }) => {
  const response = await page.goto("/join/ZZZZZZ");
  expect(response?.status()).toBeLessThan(500);
  await expect(page.getByRole("heading", { level: 1, name: /doesn.t match a class/i })).toBeVisible();
});

test("the founder metrics page is hidden from signed-out visitors", async ({ request }) => {
  const response = await request.get("/admin/metrics", { maxRedirects: 0 });
  expect(response.status()).toBe(404);
});

test("the printable leave-behind is not offered to search engines", async ({ page }) => {
  await page.goto("/pilot/leave-behind");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const sitemap = await page.request.get("/sitemap.xml");
  expect(await sitemap.text()).not.toContain("leave-behind");
});

test("robots.txt matches the environment", async ({ request }) => {
  const body = await (await request.get("/robots.txt")).text();
  if (process.env.SMOKE_EXPECT_INDEXABLE === "1") {
    // Production: crawlable, with a sitemap.
    expect(body).not.toMatch(/Disallow:\s*\/\s*$/m);
    expect(body).toContain("Sitemap:");
  } else {
    // Local and preview deployments must not be indexed.
    expect(body).toMatch(/Disallow:\s*\/\s*$/m);
  }
});
