"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useProgress } from "@/lib/useProgress";
import {
  advance,
  firstTryAccuracy,
  gradeMcq,
  gradeNumeric,
  isFinished,
  progressFraction,
  startRun,
} from "@/lib/sessions/engine";
import {
  isLessonFinished,
  readSessionResults,
  saveSessionResult,
  type SessionResults,
} from "@/lib/sessions";
import type { Session, Step } from "@/lib/sessions/types";
import { trackSessionComplete, trackSessionStart, trackStepAnswered } from "@/lib/analytics";
import styles from "./session.module.css";

/** Renders **bold** spans; session copy is plain data, never HTML. */
function RichText({ text }: { text: string }): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>
  );
}

function formatDuration(ms: number): string {
  const total = Math.max(1, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes > 0 ? `${minutes}m ${String(seconds).padStart(2, "0")}s` : `${seconds}s`;
}

type Phase = "answer" | "feedback";

interface Props {
  session: Session;
  lessonTitle: string;
  sessionIds: string[];
  nextSessionId: string | null;
}

export default function SessionPlayer({ session, lessonTitle, sessionIds, nextSessionId }: Props) {
  const { steps } = session;
  const lessonHref = `/lesson/${session.lessonId}`;
  const sessionNumber = sessionIds.indexOf(session.id) + 1;

  const [run, setRun] = useState(() => startRun(steps));
  const [phase, setPhase] = useState<Phase>("answer");
  const [choice, setChoice] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [lastCorrect, setLastCorrect] = useState(false);
  const [summary, setSummary] = useState<{ accuracy: number; durationMs: number; lessonJustFinished: boolean; results: SessionResults } | null>(null);

  const { completed, markComplete } = useProgress();
  const startedAt = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const firstRender = useRef(true);
  const formRef = useRef<HTMLFormElement>(null);

  const finished = isFinished(run);
  const step: Step | undefined = steps[run.queue[run.position]];
  const isRetry = run.queue.slice(0, run.position).includes(run.queue[run.position]);
  const progress = progressFraction(run, steps);

  useEffect(() => {
    startedAt.current = Date.now();
    trackSessionStart(session.id);
  }, [session.id]);

  // Move focus to the new step's heading (not on first paint, which would
  // yank focus from the skip link / page top).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [run.position]);

  useEffect(() => {
    if (phase === "feedback") continueRef.current?.focus();
  }, [phase]);

  // Record the result once, when the run ends.
  useEffect(() => {
    if (!finished || summary) return;
    const durationMs = Date.now() - (startedAt.current ?? Date.now());
    const accuracy = firstTryAccuracy(run, steps);
    const before = readSessionResults();
    const wasFinished = isLessonFinished(session.lessonId, before);
    const results = saveSessionResult(session.id, { completedAt: new Date().toISOString(), accuracy, durationMs });
    // XP is awarded once per lesson, through the same path as the long-form
    // lesson, so finishing sessions after reading the lesson can't double it.
    const earnedXp = !wasFinished && isLessonFinished(session.lessonId, results) && !completed.has(session.lessonId);
    if (earnedXp) markComplete(session.lessonId);
    trackSessionComplete(session.id, accuracy, durationMs);
    setSummary({ accuracy, durationMs, lessonJustFinished: earnedXp, results });
  }, [finished, summary, run, steps, session.id, session.lessonId, completed, markComplete]);

  // Number keys pick a multiple-choice option, like Duolingo.
  useEffect(() => {
    if (phase !== "answer" || step?.kind !== "mcq") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof HTMLInputElement && e.target.type === "text") return;
      const n = Number.parseInt(e.key, 10);
      if (n >= 1 && n <= step.options.length) setChoice(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, step]);

  // Enter checks/continues from anywhere on the page, not only when a form
  // control has focus. Buttons, links, and text inputs keep their native
  // Enter behaviour (text inputs already submit implicitly).
  useEffect(() => {
    if (finished) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.repeat || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("a, button, textarea, select, [contenteditable='true']")) return;
      if (target instanceof HTMLInputElement && target.type !== "radio") return;
      e.preventDefault();
      formRef.current?.requestSubmit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished]);

  function goNext(correct: boolean) {
    setRun((r) => advance(r, steps, correct));
    setPhase("answer");
    setChoice(null);
    setTyped("");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!step) return;
    if (step.kind === "explain") return goNext(true);
    if (phase === "feedback") return goNext(lastCorrect);

    let correct: boolean;
    if (step.kind === "mcq") {
      if (choice === null) return;
      correct = gradeMcq(step, choice);
    } else {
      if (typed.trim() === "") return;
      correct = gradeNumeric(step, typed);
    }
    trackStepAnswered(session.id, step.id, step.kind, correct);
    setLastCorrect(correct);
    setPhase("feedback");
  }

  if (finished) {
    const lessonDone = summary ? isLessonFinished(session.lessonId, summary.results) : false;
    return (
      <div className={styles.shell}>
        <section className={styles.done} aria-labelledby="session-done-title">
          <div className={styles.doneBadge} aria-hidden="true">✓</div>
          <p className={styles.eyebrow}>
            {lessonTitle} · Session {sessionNumber} of {sessionIds.length}
          </p>
          <h1 id="session-done-title" className={styles.doneTitle} tabIndex={-1}>
            {lessonDone ? "Lesson complete!" : "Session complete!"}
          </h1>
          {summary ? (
            <dl className={styles.stats}>
              <div className={styles.stat}>
                <dt>First-try accuracy</dt>
                <dd>{Math.round(summary.accuracy * 100)}%</dd>
              </div>
              <div className={styles.stat}>
                <dt>Time</dt>
                <dd>{formatDuration(summary.durationMs)}</dd>
              </div>
              {summary.lessonJustFinished ? (
                <div className={`${styles.stat} ${styles.statXp}`}>
                  <dt>Earned</dt>
                  <dd>+100 XP</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          <ol className={styles.dots} aria-label="Sessions in this lesson">
            {sessionIds.map((id, i) => {
              const done = Boolean(summary?.results[id]);
              return (
                <li key={id} className={done ? styles.dotDone : styles.dot}>
                  <span className="sl-visually-hidden">
                    Session {i + 1}: {done ? "complete" : "not started"}
                  </span>
                </li>
              );
            })}
          </ol>
          <div className={styles.doneActions}>
            {nextSessionId ? (
              <Link href={`/learn/${nextSessionId}`} className={styles.primary}>
                Next session
              </Link>
            ) : (
              <Link href="/lessons" className={styles.primary}>
                Back to your path
              </Link>
            )}
            <Link href={lessonHref} className={styles.secondary}>
              Read the full lesson
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (!step) return null;

  const answered = phase === "feedback";
  const canCheck = step.kind === "mcq" ? choice !== null : step.kind === "numeric" ? typed.trim() !== "" : true;
  const headingId = `step-${run.position}`;

  return (
    <div className={styles.shell}>
      <header className={styles.top}>
        <Link href={lessonHref} className={styles.close} aria-label={`Exit session and return to ${lessonTitle}`}>
          <span aria-hidden="true">×</span>
        </Link>
        <div
          className={styles.track}
          role="progressbar"
          aria-label="Session progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div className={styles.fill} style={{ transform: `scaleX(${progress})` }} />
        </div>
        <span className={styles.count}>
          {sessionNumber}/{sessionIds.length}
        </span>
      </header>

      <form ref={formRef} className={styles.stage} onSubmit={onSubmit} noValidate>
        <div className={styles.body} key={run.position}>
          <p className={styles.eyebrow}>
            {isRetry ? "Let's try that again" : step.kind === "explain" ? session.title : "Your turn"}
          </p>

          {step.kind === "explain" ? (
            <>
              <h1 id={headingId} ref={headingRef} tabIndex={-1} className={styles.title}>
                {step.title}
              </h1>
              {step.body.map((p, i) => (
                <p key={i} className={styles.paragraph}>
                  <RichText text={p} />
                </p>
              ))}
              {step.formula ? <p className={styles.formula}>{step.formula}</p> : null}
              {step.compare ? (
                <div className={styles.compare}>
                  {step.compare.map((col) => (
                    <div key={col.label} className={styles.compareCol}>
                      <h2 className={styles.compareLabel}>{col.label}</h2>
                      <ul>
                        {col.points.map((pt) => (
                          <li key={pt}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : step.kind === "mcq" ? (
            <fieldset className={styles.fieldset} disabled={answered}>
              <legend>
                <h1 id={headingId} ref={headingRef} tabIndex={-1} className={styles.question}>
                  {step.question}
                </h1>
              </legend>
              <div className={styles.options}>
                {step.options.map((option, i) => {
                  const state = answered ? (i === step.correct ? styles.optionRight : i === choice ? styles.optionWrong : "") : "";
                  return (
                    <label key={i} className={`${styles.option} ${choice === i ? styles.optionSelected : ""} ${state}`}>
                      <input
                        type="radio"
                        name={`step-${step.id}`}
                        value={i}
                        checked={choice === i}
                        onChange={() => setChoice(i)}
                        className={styles.radio}
                      />
                      <span className={styles.key} aria-hidden="true">
                        {i + 1}
                      </span>
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : (
            <div className={styles.numeric}>
              <h1 id={headingId} ref={headingRef} tabIndex={-1} className={styles.question}>
                {step.question}
              </h1>
              <label className={styles.numericField}>
                <span className="sl-visually-hidden">Your answer{step.unit ? ` in ${step.unit}` : ""}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  readOnly={answered}
                  className={`${styles.numericInput} ${answered ? (lastCorrect ? styles.inputRight : styles.inputWrong) : ""}`}
                  placeholder="Type a number"
                />
                {step.unit ? (
                  <span className={styles.unit} aria-hidden="true">
                    {step.unit}
                  </span>
                ) : null}
              </label>
            </div>
          )}
        </div>

        <div
          className={`${styles.footer} ${answered ? (lastCorrect ? styles.footerRight : styles.footerWrong) : ""}`}
        >
          <div className={styles.feedback} role="status" aria-live="polite">
            {answered && step.kind !== "explain" ? (
              <>
                <p className={styles.feedbackTitle}>
                  {lastCorrect
                    ? "Nice!"
                    : step.kind === "mcq"
                      ? `Correct answer: ${step.options[step.correct]}`
                      : `Correct answer: ${step.answer}${step.unit ? ` ${step.unit}` : ""}`}
                </p>
                <p className={styles.feedbackBody}>
                  {step.explanation}
                  {lastCorrect ? "" : " You'll see this one again before the session ends."}
                </p>
              </>
            ) : null}
          </div>
          <button
            ref={continueRef}
            type="submit"
            className={answered && !lastCorrect ? styles.danger : styles.primary}
            disabled={!canCheck}
          >
            {step.kind === "explain" || answered ? "Continue" : "Check"}
          </button>
        </div>
      </form>
      <noscript>
        <p className={styles.noscript}>
          Sessions need JavaScript. <a href={lessonHref}>Read the full lesson instead.</a>
        </p>
      </noscript>
    </div>
  );
}
