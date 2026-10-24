"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { loadPythonRuntime } from "@/lib/pythonRuntime";
import styles from "@/components/marketing/marketing.module.css";
import practice from "./practice.module.css";

const MiniEditor = dynamic(() => import("@/components/MiniEditor"), { ssr: false });

interface Props {
  title: string;
  prompt: string;
  starterCode: string;
  previewTest: string;
}

type Result = { kind: "passed" | "failed"; message: string } | null;

export default function PracticeChallenge({ title, prompt, starterCode, previewTest }: Props) {
  const [code, setCode] = useState(starterCode);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [explanation, setExplanation] = useState("");
  const revision = useRef(0);

  async function run() {
    if (busy) return;
    const currentRevision = revision.current;
    setBusy(true);
    setResult(null);
    try {
      const runtime = await loadPythonRuntime();
      await runtime.runPython(code);
      await runtime.runPython(previewTest);
      if (revision.current === currentRevision) {
        setResult({ kind: "passed", message: "Local checks passed. Now explain why the formula has to hold." });
      }
    } catch (error) {
      if (revision.current === currentRevision) {
        setResult({ kind: "failed", message: error instanceof Error ? error.message : String(error) });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={practice.challenge}>
      <div className={practice.heading}>
        <span>01 / Model</span>
        <h2>{title}</h2>
      </div>
      <p>{prompt}</p>
      <p className={practice.hint}>Hint: a call and put with the same strike and expiry must satisfy C − P = S − K·e<sup>−rT</sup>.</p>
      <div className={practice.editor}>
        <MiniEditor value={code} onChange={(next) => {
          revision.current += 1;
          setCode(next);
          setResult(null);
        }} ariaLabel="Python solution for put-call parity" />
      </div>
      <div className={practice.actions}>
        <button type="button" className={styles.primary} onClick={run} disabled={busy}>
          {busy ? "Running Python…" : "Run local checks"}
        </button>
        <span>First run downloads Python; it can take a minute on school Wi-Fi.</span>
      </div>
      {result && (
        <div className={`${practice.result} ${result.kind === "passed" ? practice.passed : practice.failed}`} role="status" aria-live="polite">
          <strong>{result.kind === "passed" ? "Your code ran" : "Not yet"}</strong>
          <pre>{result.message}</pre>
        </div>
      )}
      <label className={practice.explanation} htmlFor="practice-explanation">
        <strong>Explain your reasoning</strong>
        <span>If parity failed, what trade could make money without risk? Your explanation stays on this page.</span>
      </label>
      <textarea
        id="practice-explanation"
        value={explanation}
        onChange={(event) => setExplanation(event.target.value)}
        rows={4}
        maxLength={2000}
        placeholder="If the put were too expensive relative to the call…"
        className={practice.textarea}
      />
    </div>
  );
}
