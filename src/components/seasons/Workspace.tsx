"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import MiniEditor from "@/components/MiniEditor";
import { plainParseError } from "@/lib/pythonErrors";
import { warningFor, WARNING_TEXT } from "@/lib/seasons/clock";
import { browserStorage, clearDraft, loadDraft, saveDraft } from "@/lib/seasons/draft";
import { MAX_EXPLANATION, MIN_EXPLANATION } from "@/lib/seasons/limits";
import { formatClock } from "@/lib/seasons/window";
import FocusBar from "./FocusBar";
import styles from "./workspace.module.css";

export interface ChecksOutcome {
  ok: boolean;
  text: string;
}

export interface SubmitInput {
  code: string;
  explanation: string;
  /** True only if the checks passed on exactly this code. */
  checksPassed: boolean;
}

interface Props {
  mode: "official" | "practice";
  title: string;
  concept: string;
  prompt: string;
  numbers: { label: string; value: string }[];
  rules: string[];
  starterCode: string;
  draftKey: string;
  limitSeconds: number;
  /** Seconds left on the right clock (the server's for a real attempt). */
  getSecondsLeft: () => number;
  runChecks: (code: string) => Promise<ChecksOutcome>;
  /** Throw an Error with a message the student can act on if the submission fails. */
  onSubmit: (input: SubmitInput) => Promise<void>;
  leaveHref: string;
  leaveLabel: string;
  leaveHint?: string;
  /** Shown in the alert when time runs out. */
  timeUp: ReactNode;
}

const clockTime = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function Workspace({
  mode, title, concept, prompt, numbers, rules, starterCode, draftKey, limitSeconds, getSecondsLeft,
  runChecks, onSubmit, leaveHref, leaveLabel, leaveHint, timeUp,
}: Props) {
  // Mounted only in the browser, after the attempt has started, so reading this device's storage here is safe.
  const [restored] = useState(() => loadDraft(browserStorage(), draftKey));
  const [code, setCode] = useState(() => restored?.code ?? starterCode);
  const [explanation, setExplanation] = useState(() => restored?.explanation ?? "");
  const [left, setLeft] = useState(() => getSecondsLeft());
  const [checks, setChecks] = useState<(ChecksOutcome & { code: string }) | null>(null);
  const [running, setRunning] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ ok: boolean; at: number } | null>(restored ? { ok: true, at: restored.savedAt } : null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const clock = useRef(getSecondsLeft);
  useEffect(() => {
    clock.current = getSecondsLeft;
  });

  useEffect(() => {
    const timer = window.setInterval(() => setLeft(clock.current()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Save the draft shortly after the student stops typing.
  useEffect(() => {
    if (code === starterCode && explanation === "") return;
    const timer = window.setTimeout(() => {
      const at = Date.now();
      setSaved({ ok: saveDraft(browserStorage(), draftKey, { code, explanation, savedAt: at }), at });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [code, explanation, draftKey, starterCode]);

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  const over = left <= 0;
  const level = over ? "over" : warningFor(left, limitSeconds);
  const announcement = over ? "Time is up." : level && level !== "over" ? WARNING_TEXT[level] : "";
  const explainLength = explanation.trim().length;
  const longEnough = explainLength >= MIN_EXPLANATION;
  const checksPassed = checks?.ok === true && checks.code === code;

  /** fromBar: run from the phone action bar, so bring the result into view afterwards. */
  async function check(fromBar = false) {
    setRunning(true);
    setError(null);
    const ran = code;
    try {
      setChecks({ ...(await runChecks(ran)), code: ran });
    } catch (e) {
      setChecks({ ok: false, text: e instanceof Error ? e.message : String(e), code: ran });
    } finally {
      setRunning(false);
    }
    if (fromBar) requestAnimationFrame(() => resultRef.current?.scrollIntoView({ block: "nearest" }));
  }

  const runLabel = running ? "Running the checks…" : "Run checks";
  const submitLabel = busy ? "Submitting…" : mode === "official" ? "Submit" : "Finish practice";
  const startSubmit = () => (mode === "official" ? setConfirming(true) : void submit());
  const plain = checks && !checks.ok ? plainParseError(checks.text) : null;

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await onSubmit({ code, explanation: explanation.trim(), checksPassed });
      clearDraft(browserStorage(), draftKey);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't submit. Try again in a moment.");
      setConfirming(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <FocusBar label={mode === "official" ? "Season challenge" : "Practice round"} backHref={leaveHref} backLabel={leaveLabel} backHint={leaveHint}>
        <div className={styles.timer} data-level={level ?? undefined}>
          <span className={styles.timerValue} role="timer" aria-live="off" aria-label="Time left">{formatClock(left)}</span>
          {announcement && <span className={styles.timerNote}>{announcement}</span>}
        </div>
      </FocusBar>
      <p className="sl-visually-hidden" role="status">{announcement}</p>

      <div className={styles.panes}>
        <section className={styles.brief} aria-labelledby="work-title">
          <p className={styles.kicker}>{concept}</p>
          <h1 id="work-title" className={styles.title}>{title}</h1>
          <p className={styles.prompt}>{prompt}</p>
          {numbers.length > 0 && (
            <>
              <h2 className={styles.numbersTitle}>Your numbers</h2>
              <dl className={styles.numbers}>
                {numbers.map((n) => (
                  <div key={n.label} className={styles.number}>
                    <dt>{n.label}</dt>
                    <dd>{n.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
          <h2 className={styles.rulesTitle}>Rules</h2>
          <ul className={styles.rules}>
            {rules.map((rule) => <li key={rule}>{rule}</li>)}
          </ul>
        </section>

        <section className={styles.work} aria-label="Your work">
          {restored && (
            <p className={styles.notice}>Restored the draft you saved on this device at {clockTime(restored.savedAt)}.</p>
          )}
          <div className={styles.editorWrap}>
            <MiniEditor value={code} onChange={setCode} ariaLabel="Your solution" readOnly={over} />
          </div>
          <div className={styles.toolbar}>
            <button type="button" className={`${styles.btn} ${styles.inlineAction}`} onClick={() => check()} disabled={running || over}>
              {runLabel}
            </button>
            {saved && (
              <span className={styles.saved}>
                {saved.ok ? `Draft saved on this device at ${clockTime(saved.at)}` : "Couldn't save a draft in this browser. Keep this tab open."}
              </span>
            )}
          </div>
          <div ref={resultRef} className={styles.result} role="status" data-checks="">
            {checks && plain && <p className={styles.plain}>{plain}</p>}
            {checks && plain && (
              <details className={styles.trace}>
                <summary>Show Python&apos;s full error</summary>
                <pre className={styles.output} data-ok={checks.ok}>{checks.text}</pre>
              </details>
            )}
            {checks && !plain && (
              <pre className={styles.output} data-ok={checks.ok}>{checks.text}</pre>
            )}
            {checks && checks.code !== code && (
              <p className={styles.stale}>These results are for an earlier version of your code.</p>
            )}
          </div>

          <label htmlFor="explanation" className={styles.label}>
            Explain why your answer is right (2 or 3 sentences)
          </label>
          <textarea
            id="explanation"
            className={styles.textarea}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            maxLength={MAX_EXPLANATION}
            aria-describedby="explain-count"
            readOnly={over}
          />
          <p id="explain-count" className={styles.count}>
            {longEnough ? `${explainLength} characters` : `${explainLength} of at least ${MIN_EXPLANATION} characters`}
          </p>

          {over ? (
            <div className={styles.timeUp} role="alert">
              <p>Time is up. Submissions are closed.</p>
              {timeUp}
            </div>
          ) : confirming ? (
            <div className={styles.confirm} role="group" aria-labelledby="confirm-text">
              <p id="confirm-text">
                Submit now? You can&apos;t change your answer after this.
                {checksPassed ? "" : " The checks haven't passed on this version of your code."}
              </p>
              <div className={styles.actions}>
                <button ref={confirmRef} type="button" className={styles.btn} data-primary="true" onClick={submit} disabled={busy}>
                  {busy ? "Submitting…" : "Yes, submit"}
                </button>
                <button type="button" className={styles.btn} onClick={() => setConfirming(false)} disabled={busy}>Keep working</button>
              </div>
            </div>
          ) : (
            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.inlineAction}`}
                data-primary="true"
                disabled={busy || !longEnough}
                onClick={startSubmit}
              >
                {submitLabel}
              </button>
              {!longEnough && <span className={styles.saved}>Write your explanation to submit.</span>}
            </div>
          )}
          {error && <p className={styles.error} role="alert">{error}</p>}
        </section>
      </div>

      {/* Phones: the brief comes first, so Run and Submit ride along at the
          bottom of the screen. Above 62rem this bar is display:none and the
          in-place buttons show instead, so only one of each is ever exposed. */}
      {!over && (
        <div className={styles.actionBar} role="group" aria-label="Run and submit">
          <button type="button" className={styles.btn} onClick={() => check(true)} disabled={running}>
            {runLabel}
          </button>
          {!confirming && (
            <button type="button" className={styles.btn} data-primary="true" disabled={busy || !longEnough} onClick={startSubmit} aria-describedby="explain-count">
              {submitLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
