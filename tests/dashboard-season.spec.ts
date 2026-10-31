import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

const fixture = Boolean(process.env.SEASON_DASHBOARD_E2E);
const studentId = "11111111-1111-4111-8111-111111111111";

async function signIn(page: Page) {
  const session = {
    access_token: "student-token",
    refresh_token: "student-token-refresh",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { id: studentId, aud: "authenticated", role: "authenticated", email: "student@example.test", app_metadata: {}, user_metadata: {} },
  };
  await page.context().addCookies([{
    name: "sb-127-auth-token",
    value: `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`,
    url: "http://localhost:3113",
  }]);
}

test.describe("signed-in dashboard with seeded season data", () => {
  test.skip(!fixture, "Run with SEASON_BOARD_E2E=1 SEASON_STATUS_E2E=1 SEASON_DASHBOARD_E2E=1");

  test("puts the season action on the first mobile screen before training and record", async ({ page }) => {
    await signIn(page);
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto("/dashboard");
    const season = page.getByRole("region", { name: "Price a put from a call" });
    await expect(season).toContainText("Time left:");
    await expect(season.getByRole("link", { name: "Resume challenge" })).toHaveAttribute("href", "/seasons/s1-w3");
    const bounds = await season.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(900);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const headings = await page.locator("main h2").allTextContents();
    expect(headings.slice(0, 3)).toEqual(["Price a put from a call", "Your next lesson", "Build a record worth sharing."]);
    await expect(page.getByRole("link", { name: "See your record" })).toHaveAttribute("href", "/record");
    const accessibility = await new AxeBuilder({ page }).analyze();
    expect(accessibility.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious")).toEqual([]);
    if (process.env.SEASON_DASHBOARD_SCREENSHOTS) {
      await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
      mkdirSync("docs/pr-screenshots/T1.5", { recursive: true });
      await page.screenshot({ path: "docs/pr-screenshots/T1.5/dashboard-example-375.png", fullPage: true });
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.screenshot({ path: "docs/pr-screenshots/T1.5/dashboard-example-1280.png", fullPage: true });
    }
    await page.getByRole("link", { name: "See your record" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Your record" })).toBeVisible();
  });

  test("the season action is present without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await signIn(page);
    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: "Resume challenge" })).toBeVisible();
    await expect(page.getByText("Time left:")).toBeVisible();
    await context.close();
  });
});
