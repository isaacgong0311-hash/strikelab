"use client";

import Link from "next/link";
import { useState } from "react";
import { useProgress } from "@/lib/useProgress";
import { useSessionResults } from "@/lib/sessions/useSessionResults";
import { filterHubTracks, hubLessonState, nextHubLesson, type HubTrack, type LessonFilter } from "@/lib/learningHub";
import styles from "./hub.module.css";

const TRACK_OUTCOMES: Record<string, string> = {
  investing: "Understand the market before you model it.",
  options: "Build a working options-pricing engine.",
  quant: "Test a strategy without fooling yourself.",
};

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

  function clearFilters() { setTrackId("all"); setQuery(""); setFilter("all"); }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>The learning workspace</p><h1>From curious to capable.</h1><p>Learn the idea. Run the experiment. Write the model.</p></div>
        <div className={styles.stats} aria-label="Your course progress"><span><b>{doneCount}<small>/{allLessons.length}</small></b>lessons done</span><span><b>{hydrated ? xp : 0}</b>XP earned</span><span><b>{hydrated ? streak : 0}</b>day streak</span></div>
      </header>
      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Learning tracks">
          <p className={styles.eyebrow}>Your curriculum</p>
          <button type="button" className={styles.trackButton} aria-pressed={trackId === "all"} onClick={() => setTrackId("all")}><strong>All tracks</strong><small>{allLessons.length} lessons · one connected path</small></button>
          {tracks.map((track, i) => {
            const count = track.lessons.filter((lesson) => knownCompleted.has(lesson.id)).length;
            return <button key={track.id} type="button" className={styles.trackButton} aria-pressed={trackId === track.id} onClick={() => setTrackId(track.id)}><span className={styles.trackIndex}>0{i + 1} / {track.level}</span><strong>{track.title}</strong><small>{count} of {track.lessons.length} complete</small><span className={styles.miniProgress} aria-hidden="true"><i style={{ width: `${count / track.lessons.length * 100}%` }} /></span></button>;
          })}
          <div className={styles.sidebarNote}><strong>All paths are open.</strong><p>Start where you are. Lessons, experiments and browser coding are free for students.</p><Link href="/start">Find your starting point ↗</Link></div>
        </aside>
        <div className={styles.main}>
          <section className={styles.continueCard} aria-label="Continue your learning">
            <div><p className={styles.eyebrow}>{next ? "Your next move" : "Curriculum completed"}</p><h2>{next?.title ?? "Put your models to the test."}</h2><p>{next?.subtitle ?? "Explore a new scenario in the Market Lab and explain the result."}</p></div>
            <Link href={next ? hubLessonState(next, knownCompleted, results).href : "/lab?mission=free"} className={styles.primary} aria-label={next ? `Recommended next: ${next.title}` : "Open Market Lab"}>Continue learning <span aria-hidden="true">↗</span></Link>
          </section>
          <section className={styles.tools} aria-label="Hands-on learning tools">
            <Link href="/lab" className={styles.toolCard}><span className={styles.toolIcon} aria-hidden="true">↗</span><div><p className={styles.eyebrow}>New / Market Lab</p><h2>What if you changed one thing?</h2><p>Three guided experiments. Live model curves. Your own lab notebook.</p></div><span aria-hidden="true">→</span></Link>
            <Link href="/playground" className={styles.toolCard}><span className={styles.toolIcon} aria-hidden="true">ƒ</span><div><p className={styles.eyebrow}>Python playground</p><h2>Build the engine yourself.</h2><p>Write real Python and watch your code turn into pricing and risk curves.</p></div><span aria-hidden="true">→</span></Link>
          </section>
          <div className={styles.toolbar}>
            <label className={styles.search}><span className="sl-visually-hidden">Search lessons</span><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search lessons, models, concepts…" /></label>
            <div className={styles.filters} role="group" aria-label="Lesson status">{([ ["all", "All lessons"], ["in-progress", "In progress"], ["completed", "Completed"] ] as const).map(([value, label]) => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div>
          </div>
          <p className={styles.resultCount} role="status">{visibleCount} {visibleCount === 1 ? "lesson" : "lessons"}{query.trim() ? ` matching “${query.trim()}”` : " available"}</p>
          {visible.length === 0 ? <div className={styles.empty}><h2>No matching lessons.</h2><p>Try another concept or explore a different track.</p><button type="button" className={styles.primary} onClick={clearFilters}>Show all lessons</button></div> : visible.map((track) => (
            <section className={styles.track} id={track.id} key={track.id} aria-labelledby={`track-title-${track.id}`}>
              <div className={styles.trackHead}><div><p className={styles.eyebrow}>{track.level} / {track.lessons.length} lessons</p><h2 id={`track-title-${track.id}`}>{track.title}</h2><p>{TRACK_OUTCOMES[track.id] ?? track.subtitle}</p></div><span className={styles.trackSymbol} aria-hidden="true">{track.id === "investing" ? "∑" : track.id === "options" ? "∂" : "β"}</span></div>
              <ol className={styles.lessonList}>{track.lessons.map((lesson) => {
                const state = hubLessonState(lesson, knownCompleted, results);
                const ordinal = tracks.find((item) => item.id === track.id)!.lessons.findIndex((item) => item.id === lesson.id) + 1;
                const label = `${lesson.title}, ${state.done ? "completed" : state.started ? "in progress" : "available"}${!state.done && lesson.sessionIds.length ? `, ${state.sessionsDone} of ${lesson.sessionIds.length} sessions done` : ""}`;
                return <li key={lesson.id}><Link href={state.href} prefetch={false} className={styles.lesson} data-complete={state.done || undefined} aria-label={label}><span className={styles.lessonNumber} aria-hidden="true">{state.done ? "✓" : String(ordinal).padStart(2, "0")}</span><span className={styles.lessonBody}><strong>{lesson.title}</strong><span>{lesson.subtitle}</span><small>{lesson.duration}{lesson.sessionIds.length ? ` · ${state.sessionsDone} of ${lesson.sessionIds.length} sessions done` : track.id === "investing" ? " · Knowledge check" : " · Python exercise"}</small></span><span className={styles.lessonState}>{state.done ? "Completed" : state.started ? "Continue" : "Start"}<span aria-hidden="true"> ↗</span></span></Link></li>;
              })}</ol>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
