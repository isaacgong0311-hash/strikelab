export interface HubLesson { id: string; title: string; subtitle: string; duration: string; sessionIds: string[] }
export interface HubTrack { id: string; title: string; subtitle: string; level: string; lessons: HubLesson[] }
export type LessonFilter = "all" | "in-progress" | "completed";
export type HubSessionResults = Record<string, unknown>;

export function hubLessonState(lesson: HubLesson, completed: ReadonlySet<string>, results: HubSessionResults) {
  const done = completed.has(lesson.id);
  const sessionsDone = lesson.sessionIds.filter((id) => Boolean(results[id])).length;
  const nextSession = done ? undefined : lesson.sessionIds.find((id) => !results[id]);
  return { done, sessionsDone, started: !done && sessionsDone > 0, href: nextSession ? `/learn/${nextSession}` : `/lesson/${lesson.id}` };
}

export function nextHubLesson(tracks: readonly HubTrack[], completed: ReadonlySet<string>, results: HubSessionResults): HubLesson | undefined {
  const lessons = tracks.flatMap((track) => track.lessons);
  return lessons.find((lesson) => hubLessonState(lesson, completed, results).started) ?? lessons.find((lesson) => !completed.has(lesson.id));
}

export function filterHubTracks(tracks: readonly HubTrack[], query: string, trackId: string, filter: LessonFilter, completed: ReadonlySet<string>, results: HubSessionResults): HubTrack[] {
  const search = query.trim().toLocaleLowerCase();
  return tracks.filter((track) => trackId === "all" || track.id === trackId).map((track) => ({
    ...track,
    lessons: track.lessons.filter((lesson) => {
      const state = hubLessonState(lesson, completed, results);
      const matchesText = !search || `${lesson.title} ${lesson.subtitle} ${track.title}`.toLocaleLowerCase().includes(search);
      return matchesText && (filter === "all" || (filter === "completed" ? state.done : state.started));
    }),
  })).filter((track) => track.lessons.length > 0);
}
