"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatClock, secondsLeft } from "@/lib/seasons/window";
import { remainingLabel, type WeekView } from "@/lib/seasons/status";
import styles from "./status.module.css";

function LiveCountdown({
  target,
  serverNow,
  initialText,
  mode,
  challengeId,
}: {
  target: string;
  serverNow: string;
  initialText: string;
  mode: "upcoming" | "started";
  challengeId: string;
}) {
  const [text, setText] = useState(initialText);
  const [ended, setEnded] = useState(secondsLeft(new Date(serverNow), target) === 0);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const left = secondsLeft(now, target);
      setEnded(left === 0);
      setText(mode === "started" ? formatClock(left) : remainingLabel(now, target));
    };
    tick();
    const timer = window.setInterval(tick, mode === "started" ? 1_000 : 30_000);
    return () => window.clearInterval(timer);
  }, [target, mode]);

  if (ended) {
    return mode === "started"
      ? <p className={styles.state}>Time ended</p>
      : <p className={styles.state}>Open now. <Link href={`/seasons/${challengeId}`}>Start</Link></p>;
  }
  return mode === "started" ? (
    <p className={styles.state}>
      Time left: <span role="timer" aria-live="off">{text}</span>. <Link href={`/seasons/${challengeId}`}>Resume</Link>
    </p>
  ) : (
    <p className={styles.state}>Not open yet · Opens in <span role="timer" aria-live="off">{text}</span></p>
  );
}

export default function WeekStatus({
  view,
  challengeId,
  initialText,
  serverNow,
}: {
  view: WeekView;
  challengeId: string;
  initialText: string;
  serverNow: string;
}) {
  switch (view.kind) {
    case "upcoming": return <LiveCountdown target={view.opensAt} serverNow={serverNow} initialText={initialText} mode="upcoming" challengeId={challengeId} />;
    case "open": return <p className={styles.state}>Open now · <Link href={`/seasons/${challengeId}`}>Start</Link></p>;
    case "started": return <LiveCountdown target={view.deadline} serverNow={serverNow} initialText={formatClock(secondsLeft(new Date(serverNow), view.deadline))} mode="started" challengeId={challengeId} />;
    case "submitted": return <p className={styles.state}>Submitted · Scoring</p>;
    case "scored": return <p className={styles.state}>Scored · {view.score === null ? "Score unavailable" : `Score ${view.score.toFixed(0)}`}{view.seasonRank === null ? " · Season rank unavailable" : ` · Season rank #${view.seasonRank}`}</p>;
    case "pending_review": return <p className={styles.state}>Pending review · We&apos;ll check your submission.</p>;
    case "expired": return <p className={styles.state}>Time ended</p>;
    case "closed": return <p className={styles.state}>Closed</p>;
  }
}
