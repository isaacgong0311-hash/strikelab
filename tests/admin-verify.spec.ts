import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

const fixture = Boolean(process.env.VERIFY_E2E);
const studentId = "11111111-1111-4111-8111-111111111111";
const founderId = "22222222-2222-4222-8222-222222222222";
const capstoneId = "55555555-5555-4555-8555-555555555555";

async function signIn(page: Page, token: string, userId: string) {
  const session = {
    access_token: token, refresh_token: `${token}-refresh`, token_type: "bearer",
    expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { id: userId, aud: "authenticated", role: "authenticated", email: `${token}@example.test`, app_metadata: {}, user_metadata: {} },
  };
  await page.context().addCookies([{ name: "sb-127-auth-token", value: `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`, url: "http://localhost:3113" }]);
}

test.describe("founder verification queue with seeded HTTP data", () => {
  test.skip(!fixture, "Run with SEASON_BOARD_E2E=1 VERIFY_E2E=1");

  test("founder reviews work, records consent, and signs off", async ({ page }) => {
    await signIn(page, "teacher-token", founderId);
    const response = await page.goto("/admin/verify");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Submitted capstones" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Top-10 placings" })).toBeVisible();
    await expect(page.getByText("Example capstone", { exact: true })).toBeVisible();
    await expect(page.getByText("Final rank #1.", { exact: false })).toBeVisible();
    await page.getByText("Review submitted work").click();
    await expect(page.getByText("print('Example capstone')")).toBeVisible();
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious")).toEqual([]);
    if (process.env.VERIFY_SCREENSHOTS) {
      mkdirSync("docs/pr-screenshots/T2.4", { recursive: true });
      await page.addStyleTag({ content: "nextjs-portal, .sl-skip-link { display: none !important; }" });
      for (const width of [1280, 375]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        await page.screenshot({ path: `docs/pr-screenshots/T2.4/queue-example-${width}.png`, fullPage: true });
      }
    }
    const missingConsent = await page.request.post("/api/admin/verify", { data: {
      kind: "capstone", userId: studentId, subjectId: capstoneId, parentConsentRecorded: false,
    } });
    expect(missingConsent.status()).toBe(400);
    await page.getByRole("checkbox", { name: "Parent consent for this call is recorded" }).first().check();
    await page.getByRole("button", { name: "Mark verified" }).first().click();
    await expect(page.getByText("Example capstone", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Final rank #1.", { exact: false })).toBeVisible();
  });

  test("non-founder page and write route return 404", async ({ page }) => {
    await signIn(page, "student-token", studentId);
    const response = await page.goto("/admin/verify");
    expect(response?.status()).toBe(404);
    const write = await page.request.post("/api/admin/verify", { data: {
      kind: "capstone", userId: studentId, subjectId: capstoneId, parentConsentRecorded: true,
    } });
    expect(write.status()).toBe(404);
  });
});
