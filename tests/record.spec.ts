import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

const fixture = Boolean(process.env.RECORD_E2E);
const studentId = "11111111-1111-4111-8111-111111111111";
const emptyId = "22222222-2222-4222-8222-222222222222";

async function signIn(page: Page, token: string, userId: string) {
  const session = {
    access_token: token, refresh_token: `${token}-refresh`, token_type: "bearer",
    expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { id: userId, aud: "authenticated", role: "authenticated", email: `${token}@example.test`, app_metadata: {}, user_metadata: {} },
  };
  await page.context().addCookies([{
    name: "sb-127-auth-token", value: `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`,
    url: "http://localhost:3113",
  }]);
}

async function capture(page: Page, name: string) {
  if (!process.env.RECORD_SCREENSHOTS) return;
  await page.addStyleTag({ content: "nextjs-portal, .sl-skip-link { display: none !important; }" });
  mkdirSync("docs/pr-screenshots/T2.2", { recursive: true });
  for (const width of [1280, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.screenshot({ path: `docs/pr-screenshots/T2.2/${name}-${width}.png`, fullPage: true });
  }
}

test.describe("private record with seeded HTTP data", () => {
  test.skip(!fixture, "Run with SEASON_BOARD_E2E=1 RECORD_E2E=1");

  test("shows verified work and lets the student create, copy, and revoke a link", async ({ page }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await signIn(page, "student-token", studentId);
    await page.goto("/record");
    await expect(page.getByRole("heading", { level: 1, name: "Your record" })).toBeVisible();
    await expect(page.getByText("Verified placing")).toBeVisible();
    await expect(page.getByText("88/100")).toBeVisible();
    await expect(page.getByText("Verified in a live conversation on", { exact: false })).toBeVisible();
    await expect(page.getByRole("link", { name: "Investing Fundamentals certificate" })).toHaveAttribute("href", "/certificate/66666666-6666-4666-8666-666666666666");
    await page.setViewportSize({ width: 375, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious")).toEqual([]);
    await page.getByRole("button", { name: "Create share link" }).click();
    await expect(page.getByLabel("Your share link")).toHaveValue("/r/77777777-7777-4777-8777-777777777777");
    await capture(page, "populated-example");
    await page.getByRole("button", { name: "Copy link" }).click();
    await expect(page.getByRole("status")).toContainText("Link copied");
    await page.getByRole("button", { name: "Revoke link" }).click();
    await expect(page.getByRole("button", { name: "Create share link" })).toBeVisible();
    await expect(page.getByRole("status")).toContainText("old link no longer works");
  });

  test("an account without work sees next actions and no other student's records", async ({ page }) => {
    await signIn(page, "teacher-token", emptyId);
    await page.goto("/record");
    await expect(page.getByText("Your season scores will appear here after you compete.")).toBeVisible();
    await expect(page.getByText("A capstone is the project you build and explain after training.")).toBeVisible();
    await expect(page.getByText("Finish every lesson in a track to earn a certificate.")).toBeVisible();
    await expect(page.getByText("Example capstone")).toHaveCount(0);
    await capture(page, "empty-example");
  });

  test("signed-out visitors are sent to sign in", async ({ page }) => {
    await page.goto("/record");
    await expect(page).toHaveURL(/\/sign-in\?next=%2Frecord/);
    const response = await page.request.post("/api/record/share", { data: { enabled: true } });
    expect(response.status()).toBe(401);
  });

  test("the record details remain visible without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await signIn(page, "student-token", studentId);
    await page.goto("/record");
    await expect(page.getByText("Verified placing")).toBeVisible();
    await expect(page.getByText("Example capstone")).toBeVisible();
    await context.close();
  });
});
