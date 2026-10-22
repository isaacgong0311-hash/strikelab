"use client";
import Link from "next/link";
import { PLANNED_SEASON } from "@/lib/seasons/planned";
import { TRACKS } from "@/lib/tracks";
import { useProgress } from "@/lib/useProgress";
import FlameIcon from "@/components/FlameIcon";
import { getLessonSessions, resumeSession, type SessionResults } from "@/lib/sessions";
import { useSessionResults } from "@/lib/sessions/useSessionResults";

/**
 * Where a lesson row points. Unfinished lessons that have bite-sized
 * sessions open the next session; everything else opens the long-form page.
 */
function lessonHref(lessonId: string, done: boolean, results: SessionResults): string {
  const next = done ? undefined : resumeSession(lessonId, results);
  return next ? `/learn/${next.id}` : `/lesson/${lessonId}`;
}

const LEVEL_COLORS: Record<string, string> = {
  Beginner:     "var(--sky)",
  Intermediate: "var(--grass)",
  Advanced:     "var(--coral)",
};

export default function LessonsClient() {
  const { completed, hydrated, xp, streak } = useProgress();
  const sessionResults = useSessionResults();

  const totalLessons = TRACKS.reduce((s, t) => s + t.lessons.length, 0);
  const doneCount = hydrated
    ? TRACKS.flatMap((t) => t.lessons).filter((l) => completed.has(l.id)).length
    : 0;

  const pct = totalLessons ? (doneCount / totalLessons) * 100 : 0;
  const nextLesson = hydrated
    ? TRACKS.flatMap((track) => track.lessons).find((lesson) => !completed.has(lesson.id))
    : TRACKS[0]?.lessons[0];

  return (
    <div className="dpath">
      {/* Header */}
      <div className="dpath-head">
        <div className="dpath-head-row">
          <div>
            <div className="v2-sec-label">Curriculum</div>
            <h1 className="dpath-title">Your learning path</h1>
          </div>
          <div className="dpath-stats">
            <div className="dstat">
              <FlameIcon className="i" size={12} />
              <b>{hydrated ? streak : 0}</b>
              <span className="l">streak</span>
            </div>
            <div className="dstat">
              <b>{hydrated ? xp : 0}</b>
              <span className="l">XP</span>
            </div>
            <div className="dstat">
              <b>{doneCount}/{totalLessons}</b>
              <span className="l">done</span>
            </div>
          </div>
        </div>
        <div className="dpath-progress">
          <div
            className="dpath-progress-fill"
            role="progressbar"
            aria-label="Overall curriculum progress"
            aria-valuemin={0}
            aria-valuemax={totalLessons}
            aria-valuenow={doneCount}
            aria-valuetext={`${doneCount} of ${totalLessons} lessons complete`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {nextLesson && (
          <Link href={lessonHref(nextLesson.id, false, sessionResults)} className="dpath-next">
            <span><small>Recommended next</small><strong>{nextLesson.title}</strong></span>
            <span aria-hidden="true">Continue →</span>
          </Link>
        )}
      </div>

      {/* Tracks */}
      {TRACKS.map((track) => {
        const trackDone = hydrated
          ? track.lessons.filter((l) => completed.has(l.id)).length
          : 0;
        const activeId = hydrated
          ? track.lessons.find((l) => !completed.has(l.id))?.id ?? null
          : track.lessons[0]?.id ?? null;
        const levelColor = LEVEL_COLORS[track.level] ?? "var(--grass)";
        const trackComplete = trackDone === track.lessons.length;

        return (
          <section key={track.id} aria-labelledby={`track-title-${track.id}`} className="dunit">
            <div className="dunit-head" style={{ ["--unit-color" as string]: levelColor }}>
              <span className="dunit-icon" aria-hidden="true">{track.icon}</span>
              <div>
                <h2 id={`track-title-${track.id}`} className="dunit-t">{track.title}</h2>
                <div className="dunit-s">
                  {track.subtitle} · {track.level} · {trackDone}/{track.lessons.length} complete
                </div>
              </div>
            </div>

            <ol className="drows" aria-label={`${track.title} lessons`}>
              {track.lessons.map((lesson, i) => {
                const done = hydrated && completed.has(lesson.id);
                const isActive = !done && lesson.id === activeId;
                const sessions = getLessonSessions(lesson.id);
                const sessionsDone = sessions.filter((s) => sessionResults[s.id]).length;
                const showSessionProgress = !done && sessions.length > 0;

                return (
                  <li key={lesson.id} className={`drow ${done ? "done" : ""} ${isActive ? "active" : ""}`}>
                    <Link
                      href={lessonHref(lesson.id, done, sessionResults)}
                      className="drow-link"
                      style={{ ["--unit-color" as string]: levelColor }}
                      aria-label={`${lesson.title}, ${done ? "completed" : isActive ? "recommended next lesson" : "available"}${showSessionProgress ? `, ${sessionsDone} of ${sessions.length} sessions done` : ""}`}
                    >
                      <span className="drow-n">{done ? "✓" : i + 1}</span>
                      <span className="drow-body">
                        <span className="drow-title">{lesson.title}</span>
                        <span className="drow-meta">
                          {lesson.duration}
                          {showSessionProgress && ` · ${sessionsDone}/${sessions.length} sessions`}
                        </span>
                      </span>
                      {isActive && <span className="drow-tag">Next</span>}
                    </Link>
                  </li>
                );
              })}
            </ol>

            {trackComplete && <div className="dunit-done">{track.title} complete</div>}
          </section>
        );
      })}

      {/* Past the last track: the path leads into a season, not more lessons */}
      <Link href="/seasons?src=lessons" className="dpath-next" style={{ marginTop: "2rem" }}>
        <span><small>Then prove it</small><strong>{PLANNED_SEASON.title}: timed challenges, ranked under a handle</strong></span>
        <span aria-hidden="true">See seasons →</span>
      </Link>
    </div>
  );
}
