import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getAllBlogPosts } from "./blog";
import { getAllLessons } from "./tracks";

/** Internal links in blog posts must point at a page that exists. */
const APP_DIR = path.join(process.cwd(), "src", "app");

function staticRouteExists(route: string): boolean {
  // "/sandbox" -> src/app/sandbox/page.tsx
  const dir = path.join(APP_DIR, ...route.split("/").filter(Boolean));
  return fs.existsSync(path.join(dir, "page.tsx"));
}

describe("blog internal links", () => {
  const lessonIds = new Set(getAllLessons().map((l) => l.id));
  const slugs = new Set(getAllBlogPosts().map((p) => p.slug));

  for (const post of getAllBlogPosts()) {
    it(`${post.slug}: every internal link resolves, and relatedLesson exists`, () => {
      expect(lessonIds.has(post.frontmatter.relatedLesson), "relatedLesson").toBe(true);
      const links = [...post.content.matchAll(/\]\((\/[^)\s#?]*)/g)].map((m) => m[1]);
      for (const href of links) {
        if (href.startsWith("/lesson/")) {
          expect(lessonIds.has(href.slice("/lesson/".length)), href).toBe(true);
        } else if (href.startsWith("/blog/")) {
          expect(slugs.has(href.slice("/blog/".length)), href).toBe(true);
        } else {
          expect(staticRouteExists(href), href).toBe(true);
        }
      }
    });
  }
});
