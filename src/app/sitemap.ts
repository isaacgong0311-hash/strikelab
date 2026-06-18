import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllLessons } from "@/lib/tracks";

export default function sitemap(): MetadataRoute.Sitemap {
  // Static, publicly indexable marketing/content pages.
  const staticPages: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, freq: "weekly" },
    { path: "/lessons", priority: 0.9, freq: "weekly" },
    { path: "/playground", priority: 0.8, freq: "monthly" },
    { path: "/challenges", priority: 0.7, freq: "weekly" },
    { path: "/pricing", priority: 0.7, freq: "monthly" },
    { path: "/about", priority: 0.6, freq: "monthly" },
    { path: "/faq", priority: 0.6, freq: "monthly" },
    { path: "/roadmap", priority: 0.5, freq: "monthly" },
  ];

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));

  // One entry per lesson across all three tracks.
  const lessonEntries: MetadataRoute.Sitemap = getAllLessons().map((l) => ({
    url: `${SITE_URL}/lesson/${l.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticEntries, ...lessonEntries];
}
