"use client";

import Link from "next/link";
import { useState } from "react";
import { ActionLink } from "@/components/ui/Action";
import { useProgress } from "@/lib/useProgress";
import { useSessionResults } from "@/lib/sessions/useSessionResults";
import { filterHubTracks, hubLessonState, nextHubLesson, type HubTrack, type LessonFilter } from "@/lib/learningHub";
import styles from "./hub.module.css";

const TRACK_OUTCOMES: Record<string, string> = {
  investing: "Understand the market before you model it.",
  options: "Build a working options-pricing engine.",
  quant: "Test a strategy without fooling yourself.",
};

/** "Investing Fundamentals" -> "Investing", for the phone-width track switcher. */
const shortTrackName = (title: string) => title.split(" ")[0];

function Chevron() {
  return (
    <svg className={styles.chevron} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path d="m4.5 2.5 3.5 3.5-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LessonsClient({ tracks }: { tracks: HubTrack[] }) {
  const { completed, hydrated, xp, streak } = useProgress();
  const results = useSessionResults();
  const [trackId, setTrackId] = useState("all");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<LessonFilter>("all");
  const knownCompleted = hydrated ? completed : new Set<string>();
  const allLessons = tracks.flatMap((track) => track.lessons);
  const doneCount = allLessons.filter((lesson) => knownCompleted.has(lesson.id)).length;
  const next = nextHubLesson(tracks, knownCompleted, results);
  const visible = filterHubTracks(tracks, query, trackId, filter, knownCompleted, results);
  const visibleCount = visible.reduce((count, track) => count + track.lessons.length, 0);
  // A newcomer sees no zero stats and no progress filters, just where to
  // start. Anything saved on this device (a finished lesson or a short
  // session) switches the page to "continue" mode. The server render and the
  // first paint are always the newcomer view.
  const hasProgress = hydrated && (doneCount > 0 || xp > 0 || Object.keys(results).length > 0);
  const filtering = query.trim() !== "" || trackId !== "all" || filter !== "all";

  function clearFilters() { setTrackId("all"); setQuery(""); setFilter("all"); }

  const nextState = next ? hubLessonState(next, knownCompleted, results) : null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.intro}>
          <h1>From curious to capable.</h1>
          <p>
            <span className="sl-num">{allLessons.length}</span> free lessons in three tracks. Learn the idea, run the experiment, write the model.
          </p>
        </div>
        {hasProgress && (
          <dl className={styles.stats} aria-label="Your course progress">
            <div><dt>Lessons done</dt><dd className="sl-num">{doneCount}<small>/{allLessons.length}</small></dd></div>
            <div><dt>XP earned</dt><dd className="sl-num">{xp}</dd></div>
            <div><dt>Day streak</dt><dd className="sl-num">{streak}</dd></div>
          </dl>
        )}
      </header>

      <section className={styles.startCard} aria-labelledby="start-title">
        <div className={styles.startText}>
          <p className={styles.startLabel}>{!next ? "Curriculum completed" : hasProgress ? "Your next lesson" : "Start here"}</p>
          <h2 id="start-title">{next?.title ?? "Put your models to the test."}</h2>
          <p>
            {next
              ? <>{next.subtitle}{!hasProgress && next.sessionIds.length > 0 ? <>. Starts with <span className="sl-num">{next.sessionIds.length}</span> short sessions.</> : null}</>
              : "Explore a new scenario in the Market Lab and explain the result."}
          </p>
        </div>
        <div className={styles.startActions}>
          {next && nextState ? (
            <ActionLink
              href={nextState.href}
              aria-label={hasProgress ? `Continue. Recommended next: ${next.title}` : `Start the first lesson: ${next.title}`}
            >
              {hasProgress ? "Continue" : "Start the first lesson"}
            </ActionLink>
          ) : (
            <ActionLink href="/lab?mission=free">Open Market Lab</ActionLink>
          )}
          {!hasProgress && (
            <Link href="/start" className={styles.textLink}>Not sure? Find your starting point</Link>
          )}
        </div>
      </section>

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Learning tracks">
          <div className={styles.trackSwitch} role="group" aria-label="Show track">
            <button type="button" className={styles.trackButton} aria-pressed={trackId === "all"} onClick={() => setTrackId("all")}>
              <strong><span className={styles.long}>All tracks</span><span className={styles.short}>All</span></strong>
              <small className={styles.long}><span className="sl-num">{allLessons.length}</span> lessons</small>
            </button>
            {tracks.map((track) => {
              const count = track.lessons.filter((lesson) => knownCompleted.has(lesson.id)).length;
              return (
                <button key={track.id} type="button" className={styles.trackButton} aria-pressed={trackId === track.id} onClick={() => setTrackId(track.id)}>
                  <strong><span className={styles.long}>{track.title}</span><span className={styles.short}>{shortTrackName(track.title)}</span></strong>
                  <small className={styles.long}>
                    {track.level} · <span className="sl-num">{count > 0 ? `${count} of ${track.lessons.length} done` : `${track.lessons.length} lessons`}</span>
                  </small>
                  {count > 0 && <span className={`${styles.miniProgress} ${styles.long}`} aria-hidden="true"><i style={{ width: `${count / track.lessons.length * 100}%` }} /></span>}
                </button>
              );
            })}
          </div>
        </aside>

        <div className={styles.main}>
          <div className={styles.toolbar}>
            <label className={styles.search}>
              <span className="sl-visually-hidden">Search lessons</span>
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
                <circle cx="6" cy="6" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="m9.25 9.25 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search lessons, models, concepts…" />
            </label>
            {hasProgress && (
              <div className={styles.filters} role="group" aria-label="Lesson status">
                {([["all", "All"], ["in-progress", "In progress"], ["completed", "Completed"]] as const).map(([value, label]) => (
                  <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>
                ))}
              </div>
            )}
          </div>
          <p className={styles.resultCount} role="status">
            {filtering ? `${visibleCount} ${visibleCount === 1 ? "lesson" : "lessons"}${query.trim() ? ` matching “${query.trim()}”` : ""}` : ""}
          </p>

          {visible.length === 0 ? (
            <div className={styles.empty}>
              <h2>No matching lessons.</h2>
              <p>Try another concept or explore a different track.</p>
              <button type="button" className={styles.textButton} onClick={clearFilters}>Show all lessons</button>
            </div>
          ) : visible.map((track) => (
            <section className={styles.track} id={track.id} key={track.id} aria-labelledby={`track-title-${track.id}`}>
              <div className={styles.trackHead}>
                <h2 id={`track-title-${track.id}`}>{track.title}</h2>
                <p>{track.level} · <span className="sl-num">{track.lessons.length}</span> lessons. {TRACK_OUTCOMES[track.id] ?? track.subtitle}</p>
              </div>
              <ol className={styles.lessonList}>{track.lessons.map((lesson) => {
                const state = hubLessonState(lesson, knownCompleted, results);
                const ordinal = tracks.find((item) => item.id === track.id)!.lessons.findIndex((item) => item.id === lesson.id) + 1;
                const label = `${lesson.title}, ${state.done ? "completed" : state.started ? "in progress" : "available"}${!state.done && lesson.sessionIds.length ? `, ${state.sessionsDone} of ${lesson.sessionIds.length} sessions done` : ""}`;
                return (
                  <li key={lesson.id}>
                    <Link href={state.href} prefetch={false} className={styles.lesson} data-complete={state.done || undefined} aria-label={label}>
                      <span className={`${styles.lessonNumber} sl-num`} aria-hidden="true">
                        {state.done ? (
                          <svg width="12" height="12" viewBox="0 0 12 12" focusable="false"><path d="m2.5 6.2 2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        ) : String(ordinal).padStart(2, "0")}
                      </span>
                      <span className={styles.lessonBody}>
                        <strong>{lesson.title}</strong>
                        <span>{lesson.subtitle}</span>
                        <small className="sl-num">
                          {lesson.duration}
                          {lesson.sessionIds.length
                            ? state.sessionsDone > 0 ? ` · ${state.sessionsDone} of ${lesson.sessionIds.length} sessions done` : ` · ${lesson.sessionIds.length} short sessions`
                            : track.id === "investing" ? " · Knowledge check" : " · Python exercise"}
                        </small>
                      </span>
                      <span className={styles.lessonState}>
                        <span className={styles.lessonStateText}>{state.done ? "Review" : state.started ? "Continue" : "Start"}</span>
                        <Chevron />
                      </span>
                    </Link>
                  </li>
                );
              })}</ol>
            </section>
          ))}

          <section className={styles.tools} aria-labelledby="tools-title">
            <h2 id="tools-title" className={styles.toolsTitle}>Also in the workspace</h2>
            <div className={styles.toolGrid}>
              <Link href="/lab" className={styles.toolCard}>
                <span className={styles.toolBody}>
                  <strong>Market Lab</strong>
                  <span>Three guided experiments with live model curves and your own lab notebook.</span>
                </span>
                <Chevron />
              </Link>
              <Link href="/playground" className={styles.toolCard}>
                <span className={styles.toolBody}>
                  <strong>Python playground</strong>
                  <span>Write real Python and watch it turn into pricing and risk curves.</span>
                </span>
                <Chevron />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
