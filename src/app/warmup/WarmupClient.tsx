"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PYTHON_UNAVAILABLE_MESSAGE, loadPythonRuntime } from "@/lib/pythonRuntime";
import styles from "../join/[code]/join.module.css";

type State = "loading" | "ready" | "failed";

/**
 * Kickoff helper. The in-browser Python is about 13 MB the first time; 25
 * students downloading it in the middle of a meeting is slow on school Wi-Fi.
 * The leader asks everyone to open this page at the start. Once a browser has
 * it, exercises start instantly.
 */
export default function WarmupClient() {
  const [state, setState] = useState<State>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    loadPythonRuntime()
      .then((runtime) => runtime.runPython("1 + 1"))
      .then(() => active && setState("ready"))
      .catch(() => active && setState("failed"));
    return () => {
      active = false;
    };
  }, [attempt]);

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <p className={styles.kicker}>Before we start</p>
        <h1 className={styles.title}>
          {state === "ready" ? "Your lab is ready" : state === "failed" ? "Python didn't load" : "Getting your lab ready…"}
        </h1>
        <p className={styles.muted} role="status" aria-live="polite">
          {state === "loading" && "Downloading Python. This takes a few seconds to a minute on school Wi-Fi. Keep this page open."}
          {state === "ready" && "Python is loaded on this computer. Your first exercise will start right away."}
          {state === "failed" && PYTHON_UNAVAILABLE_MESSAGE}
        </p>
        <div className={styles.actions}>
          {state === "ready" && (
            <Link href="/" className={styles.primary}>
              Continue
            </Link>
          )}
          {state === "failed" && (
            <button
              type="button"
              className={styles.primary}
              onClick={() => {
                setState("loading");
                setAttempt((n) => n + 1);
              }}
            >
              Try again
            </button>
          )}
        </div>
        <p className={styles.fine}>Nothing is saved about you on this page.</p>
      </div>
    </div>
  );
}
