import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

const fixture = Boolean(process.env.SEASON_STATUS_E2E);
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

test.describe("student season status with seeded attempts", () => {
  test.skip(!fixture, "Run with SEASON_BOARD_E2E=1 SEASON_STATUS_E2E=1");

  test("shows each weekly state above the boards", async ({ page }) => {
    await signIn(page);
    await page.clock.install({ time: new Date() });
    await page.goto("/seasons");
    const panel = page.locator('section[aria-labelledby="your-status"]');
    await expect(panel).toBeVisible();
    await expect(panel.getByText("Not open yet", { exact: false })).toBeVisible();
    await expect(panel.getByRole("link", { name: "Start", exact: true })).toBeVisible();
    await expect(panel.getByText("Time left:", { exact: false })).toBeVisible();
    await expect(panel.getByRole("link", { name: "Resume" })).toBeVisible();
    await expect(panel.getByText("Submitted · Scoring")).toBeVisible();
    await expect(panel.getByText("Scored · Score 88 · Season rank #1")).toBeVisible();
    await expect(panel.getByText("Pending review", { exact: false })).toBeVisible();
    await expect(panel.getByText("Closed", { exact: true })).toBeVisible();
    await expect(panel.getByText("Time ended", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();

    if (process.env.SEASON_STATUS_SCREENSHOTS) {
      mkdirSync("docs/pr-screenshots/T1.3", { recursive: true });
      await page.addStyleTag({ content: "nextjs-portal, .sl-skip-link { display: none !important; }" });
      for (const width of [1280, 375]) {
        await page.setViewportSize({ width, height: 900 });
        await panel.screenshot({ path: `docs/pr-screenshots/T1.3/status-${width}.png` });
      }
    }
    const startedTimer = panel.getByRole("timer").nth(1);
    const before = await startedTimer.textContent();
    await page.clock.fastForward(60_000);
    await expect(startedTimer).not.toHaveText(before ?? "");
  });

  test("countdown text is present without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await signIn(page);
    await page.goto("/seasons");
    const panel = page.locator('section[aria-labelledby="your-status"]');
    await expect(panel.getByText(/Not open yet · Opens in/)).toBeVisible();
    await expect(panel.getByText(/Time left:/)).toBeVisible();
    await context.close();
  });
});
