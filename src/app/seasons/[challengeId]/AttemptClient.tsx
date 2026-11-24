"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import FocusBar from "@/components/seasons/FocusBar";
import Workspace, { type ChecksOutcome, type SubmitInput } from "@/components/seasons/Workspace";
import workspace from "@/components/seasons/workspace.module.css";
import done from "./submitted.module.css";
import styles from "@/components/marketing/marketing.module.css";
import { useAuth } from "@/lib/auth/AuthProvider";
import { friendlyPythonError } from "@/lib/pythonErrors";
import { loadPythonRuntime } from "@/lib/pythonRuntime";
import { secondsLeftAt, serverOffsetMs } from "@/lib/seasons/clock";
import { draftKey } from "@/lib/seasons/draft";
import { forgetFunctionProgram } from "@/lib/seasons/practice";

interface Started {
  startedAt: string;
  deadline: string;
  status: string;
  title: string;
  entry: string;
  concept: string;
  prompt: string;
  params: Record<string, number>;
  starterCode: string;
  previewTest: string;
}

type Phase = "ready" | "working" | "submitted";

const RULES = [
  "The clock doesn't pause, even if you leave this page.",
  "The AI tutor is off until you submit. Your notes and the lessons are fine.",
  "Your numbers are different from everyone else's, so a copied answer won't match. Sharing code breaks the rules.",
  "Your code saves on this device as you type, so a reload won't lose it.",
  "You can submit once.",
];

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

export default function AttemptClient({ challengeId }: { challengeId: string }) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("ready");
  const [attempt, setAttempt] = useState<Started | null>(null);
  // How far the server's clock is ahead of this device's. The deadline is the server's.
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [needsHandle, setNeedsHandle] = useState(false);

  async function start() {
    setBusy(true);
    setError(null);
    setNeedsSignIn(false);
    setNeedsHandle(false);
    try {
      const res = await fetch(`/api/seasons/challenges/${encodeURIComponent(challengeId)}/start`, { method: "POST" });
      const received = Date.now();
      const data = (await res.json().catch(() => ({}))) as Started & { error?: string; code?: string };
      if (res.status === 401) {
        setNeedsSignIn(true);
        throw new Error("Sign in to start the challenge.");
      }
      if (data.code === "needs_handle") {
        setNeedsHandle(true);
        throw new Error(data.error ?? "Choose your leaderboard handle before you start. The clock hasn't started.");
      }
      if (!res.ok) throw new Error(data.error ?? "Couldn't start the challenge");
      setOffset(serverOffsetMs(res.headers.get("date"), received));
      setAttempt(data);
      setPhase(data.status === "started" ? "working" : "submitted");
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }

  const getSecondsLeft = useCallback(
    () => (attempt ? secondsLeftAt(attempt.deadline, Date.now(), offset) : 0),
    [attempt, offset],
  );

  const runChecks = useCallback(
    async (code: string): Promise<ChecksOutcome> => {
      if (!attempt) return { ok: false, text: "" };
      try {
        const runtime = await loadPythonRuntime();
        // A function the student has since deleted or renamed must not keep passing from an earlier run.
        const forget = forgetFunctionProgram(attempt.entry);
        if (forget) await runtime.runPython(forget);
        try {
          await runtime.runPython(code);
        } catch (e) {
          return { ok: false, text: friendlyPythonError(message(e), "code") };
        }
        try {
          await runtime.runPython(attempt.previewTest);
        } catch (e) {
          return { ok: false, text: friendlyPythonError(message(e), "tests") };
        }
        return { ok: true, text: "Preview checks passed. Your official score is computed with your own numbers after you submit." };
      } catch (e) {
        return { ok: false, text: message(e) };
      }
    },
    [attempt],
  );

  const onSubmit = useCallback(
    async ({ code, explanation, checksPassed }: SubmitInput) => {
      const res = await fetch(`/api/seasons/challenges/${encodeURIComponent(challengeId)}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, explanation, previewPassed: checksPassed }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Couldn't submit");
      setPhase("submitted");
    },
    [challengeId],
  );

  if (phase === "working" && attempt) {
    return (
      <Workspace
        mode="official"
        title={attempt.title}
        concept={attempt.concept}
        prompt={attempt.prompt}
        numbers={Object.entries(attempt.params).map(([label, value]) => ({ label, value: String(value) }))}
        rules={RULES}
        starterCode={attempt.starterCode}
        draftKey={draftKey(user?.id ?? "anon", challengeId)}
        limitSeconds={Math.max(1, Math.round((Date.parse(attempt.deadline) - Date.parse(attempt.startedAt)) / 1000))}
        getSecondsLeft={getSecondsLeft}
        runChecks={runChecks}
        onSubmit={onSubmit}
        leaveHref="/seasons"
        leaveLabel="Leave"
        leaveHint="the clock keeps running"
        timeUp={<Link href="/seasons" className={workspace.btn} data-primary="true">Back to the season</Link>}
      />
    );
  }

  return (
    <div className={workspace.page}>
      <FocusBar label="Season challenge" backHref="/seasons" backLabel="Back to the season" />
      <section className={styles.section}>
        <div className={styles.narrow}>
          {phase === "submitted" ? (
            <>
              <span className={done.medal} aria-hidden="true">
                <svg viewBox="0 0 32 32" width="44" height="44" focusable="false"><path d="M8 16.5 L13.5 22 L24 10" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <p className={styles.kicker}>Challenge submitted</p>
              <h1 className={styles.h1}>{attempt?.title ?? "Challenge"}</h1>
              <p className={styles.lede} role="status">Submitted. Your official score appears on the leaderboard once it&apos;s graded.</p>
              <p className={styles.body}>That step on your season path is done. The rest of the path is waiting for you.</p>
              <div className={styles.ctaRow}>
                <Link href="/seasons" className={styles.primary}>Back to your season path</Link>
                <Link href="/record" className={styles.secondary}>See your record</Link>
              </div>
            </>
          ) : (
            <>
              <p className={styles.kicker}>Season challenge</p>
              <h1 className={styles.h1}>Ready when you are</h1>
              <ul className={styles.checks}>
                {RULES.map((rule) => <li key={rule}>{rule}</li>)}
              </ul>
              <div className={styles.ctaRow}>
                <button type="button" className={styles.primary} onClick={start} disabled={busy}>
                  {busy ? "Starting…" : "Start the challenge"}
                </button>
                <Link href="/seasons" className={styles.secondary}>Back to the season</Link>
              </div>
              <p className={styles.fine}>
                New to this? <Link href="/seasons/practice" className={styles.textLink}>Try the 15-minute practice round first.</Link>
              </p>
            </>
          )}
          {error && (
            <p role="alert" style={{ color: "var(--sl-danger)", fontWeight: 700 }}>
              {error}{" "}
              {needsSignIn && (
                <Link href={`/sign-in?next=${encodeURIComponent(`/seasons/${challengeId}`)}`} className={styles.textLink}>Sign in</Link>
              )}
              {needsHandle && (
                <Link href="/seasons#handle" className={styles.textLink}>Choose your handle</Link>
              )}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
