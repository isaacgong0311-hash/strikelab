import { expect, test } from "@playwright/test";

// The product had two generations of page titles: home, pricing, clubs, pilot,
// demo, the dashboard and the player at weight 800 with tight leading, and every
// other page at weight 600 with looser leading, in eight different sizes
// (26 to 64px). A student moving from the path to a lesson to the playground saw
// the title change character each time. Every page title now shares one style;
// only a marketing hero is larger.
const ROUTES = [
  "/", "/lessons", "/lesson/1", "/playground", "/sandbox", "/challenges", "/pricing", "/clubs", "/pilot",
  "/demo", "/about", "/faq", "/for-teachers", "/blog", "/roadmap", "/privacy", "/terms", "/sign-in",
  "/sign-up", "/dashboard", "/achievements", "/settings",
];

test("every page title shares one weight, tight leading, and one of a few sizes", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  const sizes = new Set<number>();
  const problems: string[] = [];
  for (const route of ROUTES) {
    await page.goto(route);
    const title = await page.locator("h1").first().evaluate((el) => {
      const cs = getComputedStyle(el);
      const size = parseFloat(cs.fontSize);
      return { size, weight: cs.fontWeight, leading: parseFloat(cs.lineHeight) / size };
    });
    sizes.add(Math.round(title.size));
    if (title.weight !== "800") problems.push(`${route}: weight ${title.weight}`);
    if (title.leading > 1.2) problems.push(`${route}: line-height ${title.leading.toFixed(2)}`);
  }
  expect(problems, problems.join("\n")).toEqual([]);
  expect([...sizes].sort((a, b) => a - b), "distinct H1 sizes at 1366px").toHaveLength(sizes.size);
  // Marketing hero (64), page title (40), tool-page compact title (26, kept
  // deliberately small so the tool is on the first screen), and card titles (28).
  expect(sizes.size, `H1 sizes: ${[...sizes].sort((a, b) => a - b).join(", ")}`).toBeLessThanOrEqual(4);
});
