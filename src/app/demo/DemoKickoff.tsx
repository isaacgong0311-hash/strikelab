"use client";
import { useState } from "react";
import KickoffLiveView from "@/app/teach/[id]/invite/KickoffLiveView";
import { DEMO_KICKOFF_MINUTES, demoKickoffAt } from "@/lib/demo/kickoff";
import styles from "./demo.module.css";

/**
 * The kickoff live view on sample data: drag the slider to move through the
 * first meeting and watch students join and finish. Same markup the leader
 * sees on the real invite page; no network calls.
 */
export default function DemoKickoff() {
  const [minute, setMinute] = useState(6);
  return (
    <section className={styles.kickoff} aria-labelledby="demo-kickoff-title">
      <h2 id="demo-kickoff-title" className={styles.kickoffTitle}>Kickoff day</h2>
      <p className={styles.kickoffLede}>
        On the first meeting you keep this open and watch students join. <strong>Sample data:</strong> drag the slider to move through
        the first {DEMO_KICKOFF_MINUTES} minutes.
      </p>
      <label className={styles.kickoffSlider}>
        <span>
          Minutes into the meeting: <strong>{minute}</strong>
        </span>
        <input
          type="range"
          min={0}
          max={DEMO_KICKOFF_MINUTES}
          step={1}
          value={minute}
          onChange={(e) => setMinute(Number(e.target.value))}
        />
      </label>
      <KickoffLiveView live={demoKickoffAt(minute)} />
    </section>
  );
}
