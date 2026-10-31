"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LeaderboardTable, { type LeaderboardRow } from "@/components/seasons/LeaderboardTable";
import styles from "./chapterSeasonBoard.module.css";

type BoardState =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "ready"; rows: LeaderboardRow[] };

export default function ChapterSeasonBoard({
  classId,
  season,
}: {
  classId: string;
  season: { id: string; title: string };
}) {
  const [board, setBoard] = useState<BoardState>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const url = `/api/seasons/${encodeURIComponent(season.id)}/leaderboard?classId=${encodeURIComponent(classId)}`;
    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load chapter board");
        return response.json() as Promise<{ rows: LeaderboardRow[] }>;
      })
      .then((result) => setBoard({ kind: "ready", rows: result.rows }))
      .catch(() => {
        if (!controller.signal.aborted) setBoard({ kind: "error" });
      });
    return () => controller.abort();
  }, [classId, season.id]);

  return (
    <section className={styles.card} aria-labelledby="class-season-board">
      <div className={styles.heading}>
        <div>
          <h2 id="class-season-board">Your club in {season.title}</h2>
          <p>Official scores from your students, ranked by handle.</p>
        </div>
        <Link href="/seasons">Season hub</Link>
      </div>
      {board.kind === "loading" && <p role="status">Loading club board…</p>}
      {board.kind === "error" && <p role="alert">The club board is unavailable right now.</p>}
      {board.kind === "ready" && <LeaderboardTable rows={board.rows} caption={`${season.title} club leaderboard by handle`} />}
    </section>
  );
}
