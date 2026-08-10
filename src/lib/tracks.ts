import type { Lesson } from "./lessons";
import { LESSONS as OPTIONS_LESSONS } from "./lessons";
import { INVESTING_LESSONS } from "./investingLessons";
import { QUANT_LESSONS } from "./quantLessons";

export interface Track {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  color: string;       // CSS var token
  icon: string;        // math glyph
  lessons: Lesson[];
  /**
   * Date this track's lesson content last actually changed (YYYY-MM-DD).
   * Feeds `<lastmod>` in the sitemap and `dateModified` in lesson JSON-LD.
   * Bump it when you edit the lessons — a lastmod that moves on every crawl
   * (what `new Date()` produced here before) is one Google learns to ignore.
   */
  contentUpdated: string;
}

export const TRACKS: Track[] = [
  {
    id: "investing",
    title: "Investing Fundamentals",
    subtitle: "Stocks, markets, and building wealth",
    description: "Start here. Learn how stocks work, how to read financial statements, how to value companies, and how to build a portfolio that survives long-term. No finance background required — just curiosity and pre-algebra.",
    level: "Beginner",
    color: "var(--sky)",
    icon: "∑",
    lessons: INVESTING_LESSONS,
    contentUpdated: "2026-06-04",
  },
  {
    id: "options",
    title: "Options Pricing",
    subtitle: "Black-Scholes, the Greeks, and derivatives",
    description: "Derive and implement the Black-Scholes model from scratch. Compute all five Greeks, solve for implied volatility using Newton-Raphson, and price option strategies in a real Python notebook running in your browser.",
    level: "Intermediate",
    color: "var(--grass)",
    icon: "∂",
    lessons: OPTIONS_LESSONS,
    contentUpdated: "2026-06-08",
  },
  {
    id: "quant",
    title: "Quant Investing",
    subtitle: "CAPM, backtesting, and portfolio optimization",
    description: "An optional deep end for once the fundamentals feel easy. Learn CAPM and beta, how to backtest strategies without fooling yourself, and how to optimize a portfolio on the efficient frontier — three lessons, not a whole second major.",
    level: "Advanced",
    color: "var(--coral)",
    icon: "β",
    lessons: QUANT_LESSONS,
    contentUpdated: "2026-08-10",
  },
];

export type { Lesson };

/** All lessons across all tracks, with track metadata injected */
export function getAllLessons(): (Lesson & {
  trackId: string;
  trackTitle: string;
  contentUpdated: string;
})[] {
  return TRACKS.flatMap((t) =>
    t.lessons.map((l) => ({
      ...l,
      trackId: t.id,
      trackTitle: t.title,
      contentUpdated: t.contentUpdated,
    }))
  );
}

/** Look up a lesson by id across all tracks */
export function getLessonById(id: string): (Lesson & { trackId: string }) | null {
  for (const track of TRACKS) {
    const lesson = track.lessons.find((l) => l.id === id);
    if (lesson) return { ...lesson, trackId: track.id };
  }
  return null;
}

/** Full context for a lesson page: lesson, its track, position, and prev/next within the same track */
export function getLessonContext(id: string): {
  lesson: Lesson;
  track: Track;
  positionInTrack: number; // 1-indexed
  trackLength: number;
  prev: Lesson | null;
  next: Lesson | null;
} | null {
  for (const track of TRACKS) {
    const idx = track.lessons.findIndex((l) => l.id === id);
    if (idx !== -1) {
      return {
        lesson: track.lessons[idx],
        track,
        positionInTrack: idx + 1,
        trackLength: track.lessons.length,
        prev: track.lessons[idx - 1] ?? null,
        next: track.lessons[idx + 1] ?? null,
      };
    }
  }
  return null;
}
