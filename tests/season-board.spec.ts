import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

const fixture = Boolean(process.env.SEASON_BOARD_E2E);
const firstClub = "33333333-3333-4333-8333-333333333333";
const studentId = "11111111-1111-4111-8111-111111111111";
const teacherId = "22222222-2222-4222-8222-222222222222";
const screenshots = Boolean(process.env.SEASON_BOARD_SCREENSHOTS);

async function capture(page: Page, name: string) {
  if (!screenshots) return;
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  mkdirSync("docs/pr-screenshots/T1.2", { recursive: true });
  for (const width of [1280, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.screenshot({ path: `docs/pr-screenshots/T1.2/${name}-${width}.png`, fullPage: true });
  }
}

async function signIn(page: Page, token: string, userId: string) {
  const session = {
    access_token: token,
    refresh_token: `${token}-refresh`,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { id: userId, aud: "authenticated", role: "authenticated", email: `${token}@example.test`, app_metadata: {}, user_metadata: {} },
  };
  await page.context().addCookies([{
    name: "sb-127-auth-token",
    value: `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`,
    url: "http://localhost:3113",
  }]);
}

test.describe("chapter boards with seeded HTTP data", () => {
  test.skip(!fixture, "Run with SEASON_BOARD_E2E=1 to start the local seeded service");

  test("signed-out visitors see the season board only", async ({ page }) => {
    await page.goto("/seasons");
    await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();
    await expect(page.getByRole("table", { name: "Season leaderboard by handle" })).toContainText("student_one");
    await expect(page.getByRole("heading", { name: "Your club" })).toHaveCount(0);
  });

  test("a student sees both boards and can switch clubs", async ({ page }) => {
    await signIn(page, "student-token", studentId);
    await page.goto("/seasons");
    await expect(page.getByRole("table", { name: "Season leaderboard by handle" })).toContainText("student_one");
    await expect(page.getByRole("heading", { name: "Your club" })).toBeVisible();
    await expect(page.getByRole("table", { name: "Options Club leaderboard by handle" })).toContainText("student_one");
    await page.getByLabel("Club", { exact: true }).selectOption({ label: "Quant Club" });
    await page.getByRole("button", { name: "Show club" }).click();
    await expect(page.getByRole("table", { name: "Quant Club leaderboard by handle" })).toContainText("quant_friend");
    await capture(page, "student-seasons");
  });

  test("a club leader sees the class board by handle", async ({ page }) => {
    await signIn(page, "teacher-token", teacherId);
    await page.goto(`/dashboard/class/${firstClub}`);
    await expect(page.getByRole("heading", { name: "Your club in Season 1" })).toBeVisible();
    await expect(page.getByRole("table", { name: "Season 1 club leaderboard by handle" })).toContainText("student_one");
    await capture(page, "leader-class");
  });
});
