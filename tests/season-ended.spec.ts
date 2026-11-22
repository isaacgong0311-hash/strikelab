import { expect, test } from "@playwright/test";

// The seeded fixture with all three weeks closed (SEASON_ENDED_E2E): /seasons
// keeps the final board up between seasons and stops counting down.
const fixture = Boolean(process.env.SEASON_ENDED_E2E);

test.describe("an ended season", () => {
  test.skip(!fixture, "Run with SEASON_BOARD_E2E=1 SEASON_ENDED_E2E=1");

  test("shows the final leaderboard and no countdown or calendar", async ({ page }) => {
    await page.goto("/seasons");
    await expect(page.getByText("Season ended", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Season 1 final leaderboard" })).toBeVisible();
    await expect(page.getByRole("table", { name: "Season leaderboard by handle" })).toContainText("student_one");
    await expect(page.getByText("Next challenge opens in")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /to your calendar/ })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Create a free account", exact: true })).toBeVisible();
  });
});
