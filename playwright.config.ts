import { defineConfig, devices } from "@playwright/test";

// PLAYWRIGHT_BASE_URL points the suite at an already-running server (e.g. a
// second dev server on another port while a parallel worktree holds 3000).
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const chapterBoardFixture = Boolean(process.env.SEASON_BOARD_E2E);
const fixtureBaseURL = "http://localhost:3113";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: externalBaseURL ?? (chapterBoardFixture ? fixtureBaseURL : "http://localhost:3000"),
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: externalBaseURL
    ? undefined
    : chapterBoardFixture
      ? {
          command: "node tests/fixtures/start-season-board.mjs",
          url: `${fixtureBaseURL}/seasons`,
          reuseExistingServer: false,
          timeout: 120_000,
        }
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
