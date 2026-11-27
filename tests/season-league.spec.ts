import { expect, test, type Page } from "@playwright/test";

// Run with SEASON_BOARD_E2E=1 LONG_BOARD_E2E=1: a 40-player board, the student at #24.
const fixture = Boolean(process.env.SEASON_BOARD_E2E && process.env.LONG_BOARD_E2E);
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
  await page.context().addCookies([{ name: "sb-127-auth-token", value: `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`, url: "http://localhost:3113" }]);
}

test.describe("a long season board reads like a league", () => {
  test.skip(!fixture, "Run with SEASON_BOARD_E2E=1 LONG_BOARD_E2E=1");

  test("folds to the top ten and the rows around you, then unfolds", async ({ page }) => {
    await signIn(page);
    await page.goto("/seasons");
    const board = page.getByRole("table", { name: "Season leaderboard by handle" });
    await expect(board.getByRole("button", { name: "Show 11 more players" })).toBeVisible();
    await expect(board.getByRole("button", { name: "Show 14 more players" })).toBeVisible();
    await expect(board).toContainText("player_10");
    await expect(board).not.toContainText("player_15");
    await expect(board.locator("tr", { hasText: "student_one" })).toContainText("(you)");
    await expect(board).toContainText("player_26");
    await expect(board).toContainText("1 (First place)");
    await board.getByRole("button", { name: "Show 11 more players" }).click();
    await expect(board).toContainText("player_15");
    await expect(board).toContainText("player_40");
    await expect(board.getByRole("button", { name: /more players/ })).toHaveCount(0);
  });

  test("shows every row without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await signIn(page);
    await page.goto("/seasons");
    const board = page.getByRole("table", { name: "Season leaderboard by handle" });
    await expect(board).toContainText("player_15");
    await expect(board).toContainText("player_40");
    await context.close();
  });
});
