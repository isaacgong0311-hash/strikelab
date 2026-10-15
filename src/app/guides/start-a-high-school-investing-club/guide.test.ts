import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { QUANT_FOUNDATIONS_TEMPLATE } from "@/lib/cohorts/template";
import { getAllLessons } from "@/lib/tracks";

describe("start-a-high-school-investing-club guide", () => {
  it("is in the sitemap", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain("https://strikelab.dev/guides/start-a-high-school-investing-club");
  });

  it("names every lesson in the six-week plan by title, never by raw id", () => {
    const titles = new Map(getAllLessons().map((l) => [l.id, l.title]));
    for (const week of QUANT_FOUNDATIONS_TEMPLATE.weeks) {
      for (const id of week.lessonIds) expect(titles.has(id), `lesson ${id}`).toBe(true);
    }
  });
});
