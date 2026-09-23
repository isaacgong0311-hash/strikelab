import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PUBLIC_ROUTES = [
  "/",
  "/lessons",
  "/lesson/inv-1",
  "/playground",
  "/sandbox",
  "/dashboard",
  "/sign-in",
  "/settings",
  "/pricing",
  "/clubs",
  "/pilot",
  "/demo",
  "/demo?view=student",
  "/challenges",
];

async function waitForClientShell(page: import("@playwright/test").Page) {
  await expect(page.locator("html")).toHaveAttribute("data-client-ready", "true");
}

for (const route of PUBLIC_ROUTES) {
  test(`${route} has no serious automated accessibility violations`, async ({ page }) => {
    // Scan the settled page: with motion on, axe can sample text mid fade-in
    // and report blended colours as contrast failures (flaky on slow CI).
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route, { waitUntil: "networkidle" });
    await waitForClientShell(page);
    await expect(page.locator("h1").first()).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter((violation) =>
      violation.impact === "critical" || violation.impact === "serious"
    );
    expect(blocking, blocking.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
  });
}

test("skip link reaches the main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("mobile navigation is a dismissible focus-contained dialog", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 760 });
  await page.goto("/");
  await waitForClientShell(page);
  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Mobile navigation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Mobile navigation" })).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("accessibility preferences persist and apply to the document", async ({ page }) => {
  await page.goto("/");
  await waitForClientShell(page);
  await page.getByRole("button", { name: "Accessibility display preferences" }).click();
  await page.getByRole("checkbox", { name: "Reduce motion" }).check();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
});

test("core public pages reflow without page-level horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  for (const route of ["/", "/lessons", "/lesson/inv-1", "/sign-in"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${route} overflows by ${overflow}px`).toBeLessThanOrEqual(1);
  }
});

test("essential public content remains visible without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const route of ["/", "/lessons", "/lesson/inv-1"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
    await expect(heading).not.toHaveCSS("opacity", "0");
  }
  await context.close();
});
