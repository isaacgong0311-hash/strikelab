import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllLessons } from "@/lib/tracks";

/**
 * `lastModified` must reflect when the page's content actually changed.
 *
 * This used to be `new Date()`, which stamped every URL with the moment of the
 * crawl — so the sitemap claimed all 29 pages had just changed, on every single
 * fetch. Google detects lastmod that can't be true and stops trusting the field
 * (it then falls back to its own crawl scheduling and ignores the signal).
 *
 * These are real dates. Bump the one you touched when you edit a page; lesson
 * dates live on the track in @/lib/tracks so they sit next to the content.
 */
const STATIC_PAGES: {
  path: string;
  updated: string;
  priority: number;
  freq: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "/", updated: "2026-07-27", priority: 1.0, freq: "weekly" },
  { path: "/lessons", updated: "2026-06-08", priority: 0.9, freq: "weekly" },
  { path: "/playground", updated: "2026-07-14", priority: 0.8, freq: "monthly" },
  { path: "/challenges", updated: "2026-07-27", priority: 0.7, freq: "weekly" },
  { path: "/pricing", updated: "2026-07-24", priority: 0.7, freq: "monthly" },
  { path: "/about", updated: "2026-07-27", priority: 0.6, freq: "monthly" },
  { path: "/faq", updated: "2026-07-24", priority: 0.6, freq: "monthly" },
  { path: "/roadmap", updated: "2026-07-27", priority: 0.5, freq: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: p.updated,
    changeFrequency: p.freq,
    priority: p.priority,
  }));

  // One entry per lesson across all three tracks.
  const lessonEntries: MetadataRoute.Sitemap = getAllLessons().map((l) => ({
    url: `${SITE_URL}/lesson/${l.id}`,
    lastModified: l.contentUpdated,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticEntries, ...lessonEntries];
}
