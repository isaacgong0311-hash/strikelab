"use client";

import { useState } from "react";
import { foldBoard } from "@/lib/seasons/board";
import { useHydrated } from "@/lib/useHydrated";
import styles from "./leaderboard.module.css";

export interface LeaderboardRow {
  rank: number;
  handle: string;
  total_score: number;
  solved: number;
  is_you: boolean;
}

const PLACES: Record<number, string> = { 1: "First place", 2: "Second place", 3: "Third place" };

/**
 * The board as a league: medals for the top three, your row stands out, and a
 * long board folds to the top ten plus the rows around you. The server (and a
 * browser without JavaScript) renders every row; folding starts once hydrated.
 */
export default function LeaderboardTable({
  rows,
  caption,
}: {
  rows: LeaderboardRow[];
  caption: string;
}) {
  const hydrated = useHydrated();
  const [expanded, setExpanded] = useState(false);

  if (rows.length === 0) {
    return (
      <p className={styles.empty}>
        No scores yet. Each week is scored after you submit, usually within a day, and handles show up here as scores post.
      </p>
    );
  }

  const items = hydrated && !expanded
    ? foldBoard(rows)
    : rows.map((row) => ({ kind: "row" as const, row }));

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <caption className="sl-visually-hidden">{caption}</caption>
        <thead>
          <tr><th scope="col">Rank</th><th scope="col">Handle</th><th scope="col" className={styles.num}>Score</th><th scope="col" className={styles.num}>Weeks scored</th></tr>
        </thead>
        <tbody>
          {items.map((item, i) => item.kind === "gap" ? (
            <tr key={`gap-${i}`} className={styles.gap}>
              <td colSpan={4}>
                <button type="button" className={styles.more} onClick={() => setExpanded(true)}>
                  Show {item.hidden} more {item.hidden === 1 ? "player" : "players"}
                </button>
              </td>
            </tr>
          ) : (
            <tr key={`${item.row.rank}-${item.row.handle}`} className={item.row.is_you ? styles.you : undefined}>
              <td className={styles.figure}>
                {PLACES[item.row.rank] ? (
                  <span className={styles.medal} data-place={item.row.rank}>
                    <span aria-hidden="true">{item.row.rank}</span>
                    <span className="sl-visually-hidden">{item.row.rank} ({PLACES[item.row.rank]})</span>
                  </span>
                ) : item.row.rank}
              </td>
              <td className={styles.handle}>{item.row.handle}{item.row.is_you ? <span className={styles.youTag}> (you)</span> : ""}</td>
              {/* One decimal, like the stored scores, so totals that differ never look equal. */}
              <td className={`${styles.figure} ${styles.num}`}>{Number(item.row.total_score).toFixed(1)}</td>
              <td className={`${styles.figure} ${styles.num}`}>{item.row.solved}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
