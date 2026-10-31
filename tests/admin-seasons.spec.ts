import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

const fixture = Boolean(process.env.SEASON_ADMIN_E2E);
const studentId = "11111111-1111-4111-8111-111111111111";
const founderId = "22222222-2222-4222-8222-222222222222";

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

async function capture(page: Page, name: string) {
  if (!process.env.SEASON_ADMIN_SCREENSHOTS) return;
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  mkdirSync("docs/pr-screenshots/T1.4", { recursive: true });
  for (const width of [1280, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.screenshot({ path: `docs/pr-screenshots/T1.4/${name}-${width}.png`, fullPage: true });
  }
}

test.describe("founder season operations with seeded HTTP data", () => {
  test.skip(!fixture, "Run with SEASON_BOARD_E2E=1 SEASON_ADMIN_E2E=1");

  test("founder sees counts and can inspect a pending submission", async ({ page }) => {
    await signIn(page, "teacher-token", founderId);
    const response = await page.goto("/admin/seasons");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("table", { name: "Attempts by status per challenge" })).toContainText("Pending review");
    await expect(page.getByRole("row", { name: /Week 6:/ }).getByRole("cell")).toHaveText(["0", "0", "0", "1"]);
    await expect(page.getByRole("heading", { name: "Pending reviews" })).toBeVisible();
    await expect(page.getByText("student_one")).toBeVisible();
    await expect(page.getByText("Last scoring run:")).toContainText("Not recorded");
    await capture(page, "operations-example");

    await page.getByRole("link", { name: "View code and explanation" }).click();
    await expect(page.getByRole("heading", { name: "Review season attempt" })).toBeVisible();
    await expect(page.getByText("print('Example review')")).toBeVisible();
    await expect(page.getByText("Example reasoning for this submission.")).toBeVisible();
    await capture(page, "review-example");
  });

  test("a signed-in non-founder gets a 404 for both founder routes", async ({ page }) => {
    await signIn(page, "student-token", studentId);
    for (const route of [
      "/admin/seasons",
      `/admin/seasons/review/s1-w6/${studentId}`,
    ]) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(404);
      await expect(page.getByText("Example reasoning for this submission.")).toHaveCount(0);
    }
  });
});
