import { TRACKS } from "@/lib/tracks";
import { resumeSession, type SessionResults } from "@/lib/sessions";

/**
 * Where a student goes next, computed one way everywhere: the path map, the
 * dashboard and the nav's "Continue" button all use it (frontend master plan
 * FW-25). Unfinished lessons with bite-sized sessions open the next session;
 * everything else opens the long-form page.
 */
export function lessonHref(lessonId: string, done: boolean, results: SessionResults): string {
  const next = done ? undefined : resumeSession(lessonId, results);
  return next ? `/learn/${next.id}` : `/lesson/${lessonId}`;
}

/** The first lesson, in path order, the student hasn't finished. */
export function nextLesson(completed: ReadonlySet<string>) {
  return TRACKS.flatMap((track) => track.lessons).find((lesson) => !completed.has(lesson.id));
}

/** The student's next step; the path map once every lesson is done. */
export function continueHref(completed: ReadonlySet<string>, results: SessionResults): string {
  const lesson = nextLesson(completed);
  return lesson ? lessonHref(lesson.id, false, results) : "/lessons";
}

/** True once the student has done anything: a finished session or lesson. */
export function hasStarted(completed: ReadonlySet<string>, results: SessionResults): boolean {
  return completed.size > 0 || Object.keys(results).length > 0;
}
