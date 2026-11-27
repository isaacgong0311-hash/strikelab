"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { OFFICIAL_SCORE_MAX } from "@/lib/seasons/limits";
import { browserStorage } from "@/lib/seasons/draft";
import { markSeen, parseSeen, pickReveal, revealLine, scoredWeeks, SEEN_KEY } from "@/lib/seasons/reveal";
import type { WeekView } from "@/lib/seasons/status";
import styles from "./reveal.module.css";

const UNKNOWN = "\u0000server";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function read(): string {
  try {
    return window.localStorage.getItem(SEEN_KEY) ?? "";
  } catch {
    return "";
  }
}

/**
 * A newly posted score, celebrated once on this device. It renders nothing on
 * the server or until the browser has checked what it has already shown, and
 * the path below shows the same score either way, so nothing depends on it.
 */
export default function ScoreReveal({ challenges, handle }: {
  challenges: { id: string; week: number; title: string; view: WeekView }[];
  handle: string | null;
}) {
  const raw = useSyncExternalStore(subscribe, read, () => UNKNOWN);
  const [dismissed, setDismissed] = useState(false);
  const scored = scoredWeeks(challenges, OFFICIAL_SCORE_MAX);
  const pick = raw === UNKNOWN || dismissed ? null : pickReveal(scored, parseSeen(raw), handle);
  if (!pick) return null;
  const { week, unseen } = pick;
  const done = () => {
    markSeen(browserStorage(), handle, scored);
    setDismissed(true);
  };

  return (
    <section className={styles.reveal} aria-labelledby="score-reveal-title">
      <span className={styles.medal} aria-hidden="true">
        <svg viewBox="0 0 32 32" width="40" height="40" focusable="false"><path d="M16 3.5l3.6 7.6 8.2 1.1-6 5.7 1.5 8.2L16 22.2l-7.3 3.9 1.5-8.2-6-5.7 8.2-1.1z" fill="currentColor" /></svg>
      </span>
      <div className={styles.text}>
        <p className={styles.label}>Week {week.week} scored{unseen > 1 ? ` · ${unseen - 1} more new` : ""}</p>
        <h3 id="score-reveal-title" className={styles.title}>{week.title}</h3>
        <p className={styles.score}>
          <CountUp to={week.score} />
          <span className={styles.max}> / {week.max}</span>
          {week.rank !== null && <span className={styles.rank}>#{week.rank} on the board</span>}
        </p>
        <p className={styles.line}>{revealLine(week.score, week.max)}</p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.ok} onClick={done}>Nice, keep going</button>
        <a href="#season-board" className={styles.board} onClick={done}>See the leaderboard</a>
      </div>
    </section>
  );
}

function CountUp({ to }: { to: number }) {
  const [value, setValue] = useState(to);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      setValue(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to]);
  const shown = Number.isInteger(to) ? Math.round(value) : value.toFixed(1);
  return (
    <>
      <span aria-hidden="true" className={styles.number}>{shown}</span>
      <span className="sl-visually-hidden">{to}</span>
    </>
  );
}
