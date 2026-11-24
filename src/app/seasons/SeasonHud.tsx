"use client";

import { useProgress } from "@/lib/useProgress";
import styles from "./hud.module.css";

/**
 * The signed-in student's numbers at a glance: the learning streak and XP the
 * lessons already keep (useProgress), plus this season's points and rank from
 * the server. Streak and XP show "0" until the browser has read them.
 */
export default function SeasonHud({ handle, points, max, rank }: { handle: string | null; points: number; max: number; rank: number | null }) {
  const { streak, xp, hydrated } = useProgress();
  return (
    <dl className={styles.hud} aria-label="Your season so far">
      <div className={styles.stat} data-tone="streak">
        <dt>Day streak</dt>
        <dd><Flame />{hydrated ? streak : 0}</dd>
      </div>
      <div className={styles.stat} data-tone="xp">
        <dt>Lesson XP</dt>
        <dd><Bolt />{hydrated ? xp : 0}</dd>
      </div>
      <div className={styles.stat} data-tone="points">
        <dt>Season points</dt>
        <dd>{Number.isInteger(points) ? points : points.toFixed(1)}<span className={styles.of}> / {max}</span></dd>
      </div>
      <div className={styles.stat} data-tone="rank">
        <dt>{handle ? `@${handle}` : "Rank"}</dt>
        <dd>{rank === null ? <span className={styles.none}>Unranked</span> : `#${rank}`}</dd>
      </div>
    </dl>
  );
}

function Flame() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M10 1.5c.6 3-1.8 4.4-1.8 6.6 0 1 .6 1.7 1.3 1.9-.2-1.6.9-2.8 2.1-3.6.2 2.4 3.4 3.4 3.4 7a5 5 0 0 1-10 0c0-4.6 4.2-6.2 5-11.9Z" fill="currentColor" />
    </svg>
  );
}

function Bolt() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M11.5 1.5 4 11h5l-1 7.5L15.5 9h-5l1-7.5Z" fill="currentColor" />
    </svg>
  );
}
