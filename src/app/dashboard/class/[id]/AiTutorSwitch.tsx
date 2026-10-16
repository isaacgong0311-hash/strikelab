"use client";

import { useState } from "react";
import styles from "./scorecard.module.css";

/**
 * The leader decides whether students in this class may use the AI tutor.
 * It sends a student's question and code to an outside model, so it starts
 * off. Saved immediately; the switch reflects what the server confirmed.
 */
export default function AiTutorSwitch({ classId, initial }: { classId: string; initial: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function change(next: boolean) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/classes/${classId}/ai-tutor`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      const data = (await res.json().catch(() => ({}))) as { aiTutorEnabled?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Couldn't change the setting");
      setEnabled(data.aiTutorEnabled === true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't change the setting");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.card} aria-labelledby="ai-tutor-title">
      <div>
        <h2 id="ai-tutor-title" className={styles.title}>AI tutor for this class</h2>
        <p className={styles.note}>
          {enabled
            ? "On. When a student asks the tutor for help, their question and their code are sent to an outside AI provider (Groq), without their name or email."
            : "Off. Students in this class can't use the AI tutor or AI hints. Lessons, exercises and solutions all still work."}
        </p>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.75rem" }}>
        <input
          type="checkbox"
          checked={enabled}
          disabled={busy}
          onChange={(e) => change(e.target.checked)}
        />
        <span>Let students in this class use the AI tutor</span>
      </label>
      {error && <p role="alert" className={styles.note}>{error}</p>}
      <span className="sl-visually-hidden" role="status">{enabled ? "AI tutor is on" : "AI tutor is off"}</span>
    </section>
  );
}
