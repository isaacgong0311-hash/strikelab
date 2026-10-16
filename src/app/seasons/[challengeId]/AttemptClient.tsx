"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MiniEditor from "@/components/MiniEditor";
import styles from "@/components/marketing/marketing.module.css";
import { loadPythonRuntime } from "@/lib/pythonRuntime";
import { formatClock, secondsLeft } from "@/lib/seasons/window";

interface Started {
  startedAt: string;
  deadline: string;
  status: string;
  title: string;
  concept: string;
  prompt: string;
  starterCode: string;
  previewTest: string;
}

type Phase = "ready" | "working" | "submitted";

export default function AttemptClient({ challengeId }: { challengeId: string }) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [attempt, setAttempt] = useState<Started | null>(null);
  const [code, setCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [output, setOutput] = useState("");
  const [previewPassed, setPreviewPassed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!attempt || phase !== "working") return;
    const tick = () => setLeft(secondsLeft(new Date(), attempt.deadline));
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [attempt, phase]);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/seasons/challenges/${encodeURIComponent(challengeId)}/start`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as Started & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Couldn't start the challenge");
      setAttempt(data);
      setCode(data.starterCode);
      setLeft(secondsLeft(new Date(), data.deadline));
      setPhase(data.status === "started" ? "working" : "submitted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start the challenge");
    } finally {
      setBusy(false);
    }
  }

  async function preview() {
    if (!attempt) return;
    setOutput("Running the preview checks…");
    try {
      const runtime = await loadPythonRuntime();
      await runtime.runPython(code);
      await runtime.runPython(attempt.previewTest);
      setPreviewPassed(true);
      setOutput("Preview checks passed. Your official score is computed with your own numbers after you submit.");
    } catch (e) {
      setPreviewPassed(false);
      setOutput(e instanceof Error ? e.message : String(e));
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/seasons/challenges/${encodeURIComponent(challengeId)}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, explanation, previewPassed }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Couldn't submit");
      setPhase("submitted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't submit");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.narrow}>
          <p className={styles.kicker}>Season challenge</p>
          <h1 className={styles.h1}>{attempt?.title ?? "Ready when you are"}</h1>

          {phase === "ready" && (
            <>
              <ul className={styles.checks}>
                <li>The timer starts when you press Start, and it doesn&apos;t pause.</li>
                <li>The AI tutor is off until you submit. Your notes and the lessons are fine.</li>
                <li>You get your own numbers, so your answer is yours alone.</li>
                <li>You&apos;ll submit your code and a short explanation of why it works.</li>
              </ul>
              <div className={styles.ctaRow}>
                <button type="button" className={styles.primary} onClick={start} disabled={busy}>
                  {busy ? "Starting…" : "Start the challenge"}
                </button>
                <Link href="/seasons" className={styles.secondary}>Back to the season</Link>
              </div>
            </>
          )}

          {phase === "working" && attempt && (
            <>
              <p className={styles.body} role="timer" aria-live="off">
                <strong>Time left: {left === null ? "…" : formatClock(left)}</strong> ({attempt.concept})
              </p>
              <p className={styles.body}>{attempt.prompt}</p>
              <MiniEditor value={code} onChange={setCode} ariaLabel="Your solution" />
              <div className={styles.ctaRow}>
                <button type="button" className={styles.secondary} onClick={preview}>Run the preview checks</button>
              </div>
              {output && <pre role="status" style={{ whiteSpace: "pre-wrap" }}>{output}</pre>}
              <label htmlFor="explanation" style={{ display: "block", fontWeight: 700, marginTop: "1rem" }}>
                Explain why your answer is right (2 or 3 sentences)
              </label>
              <textarea
                id="explanation"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={4}
                maxLength={2000}
                style={{ width: "100%", padding: "0.75rem", borderRadius: 10, border: "1px solid var(--sl-border-strong)" }}
              />
              <div className={styles.ctaRow}>
                <button type="button" className={styles.primary} onClick={submit} disabled={busy}>
                  {busy ? "Submitting…" : "Submit"}
                </button>
              </div>
            </>
          )}

          {phase === "submitted" && (
            <>
              <p className={styles.lede} role="status">Submitted. Your official score appears on the leaderboard once it&apos;s graded.</p>
              <Link href="/seasons" className={styles.primary}>Back to the season</Link>
            </>
          )}

          {error && <p role="alert" style={{ color: "var(--sl-danger)" }}>{error}</p>}
        </div>
      </section>
    </div>
  );
}
