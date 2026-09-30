"use client";
import { useEffect, useState } from "react";
import { KickoffLiveView } from "@/app/teach/[id]/invite/KickoffLive";
import { KICKOFF_DEMO_MINUTES, kickoffDemoFrame } from "@/lib/demo/kickoffDemo";
import styles from "./demo.module.css";

/**
 * The kickoff live view on /demo (frontend master plan FW-6): the same panel
 * a leader keeps open during the first meeting, replaying a made-up one.
 * Nothing moves until the visitor presses Play; no network calls.
 */
export default function KickoffDemo() {
  const [minute, setMinute] = useState(KICKOFF_DEMO_MINUTES);
  const [playing, setPlaying] = useState(false);

  // Running until the meeting reaches its last minute.
  const running = playing && minute < KICKOFF_DEMO_MINUTES;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setMinute((m) => Math.min(m + 1, KICKOFF_DEMO_MINUTES)), 900);
    return () => window.clearInterval(id);
  }, [running]);

  function play() {
    setMinute(0);
    setPlaying(true);
  }

  const controls = (
    <div className={styles.kickoffControls}>
      <button type="button" className={styles.secondary} onClick={play} disabled={running}>
        {running ? "Playing…" : "Replay the meeting"}
      </button>
      <label className={styles.kickoffSlider}>
        <span>Minutes into the meeting: {minute}</span>
        <input
          type="range"
          min={0}
          max={KICKOFF_DEMO_MINUTES}
          value={minute}
          onChange={(e) => {
            setPlaying(false);
            setMinute(Number(e.target.value));
          }}
        />
      </label>
    </div>
  );

  return (
    <KickoffLiveView
      live={kickoffDemoFrame(minute)}
      status={`Sample meeting, ${minute} minute${minute === 1 ? "" : "s"} in. On your invite page this updates every 10 seconds.`}
      controls={controls}
    />
  );
}
