import { TRACKS } from "@/lib/tracks";
import { getLessonSessions } from "@/lib/sessions";

/**
 * The one lesson we tell a newcomer to start with: the first lesson of the
 * first track ("What Is a Stock?"), opened at its first short session when it
 * has them. /lessons gets the same answer from `nextHubLesson` for a visitor
 * with no progress, and the homepage, /start and /pricing all link to
 * /learn/inv-1.1. Note that /lesson/1 is NOT this lesson: it is the first
 * Options Pricing lesson, so pages say "the first lesson" rather than
 * "lesson 1". Server-only (TRACKS carries every lesson's HTML).
 */
export function recommendedStart(): { id: string; title: string; href: string } {
  const lesson = TRACKS[0].lessons[0];
  const firstSession = getLessonSessions(lesson.id)[0];
  return {
    id: lesson.id,
    title: lesson.title,
    href: firstSession ? `/learn/${firstSession.id}` : `/lesson/${lesson.id}`,
  };
}
