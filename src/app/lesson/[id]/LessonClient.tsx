"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { Lesson, FormulaSandboxConfig, LessonVisual } from "@/lib/lessons";
import { QUIZZES, type QuizQuestion } from "@/lib/quizzes";
import dynamic from "next/dynamic";
import { useProgress } from "@/lib/useProgress";
import { trackLessonStart, trackTestsPassed, trackLessonComplete, trackQuizAnswer } from "@/lib/analytics";
import { completeSavedLesson } from "@/lib/learningNextStep";
import Breadcrumbs from "@/components/Breadcrumbs";
import AiTutor from "@/components/AiTutor";
import LessonToc from "@/components/LessonToc";
import AiReview from "@/components/AiReview";
import ExplainSelection from "@/components/ExplainSelection";
import Checkpoint from "@/components/Checkpoint";
import FormulaSandbox from "@/components/FormulaSandbox";
import PayoffDiagram from "@/components/PayoffDiagram";
import BinomialTree from "@/components/BinomialTree";
import PracticeProblem from "@/components/PracticeProblem";
import { checkpointPlacement, EXERCISE_ANCHOR, type TocSection } from "@/lib/lessonToc";
import FlameIcon from "@/components/FlameIcon";
import Dialog from "@/components/ui/Dialog";
import { ActionLink, Button, buttonClassName } from "@/components/ui/Action";
import LessonBrief, { type StartHere } from "./LessonBrief";
import styles from "./lesson.module.css";

import { CODE_SYNC_LABELS, useSyncedCode } from "@/lib/submissions/useSyncedCode";
import { loadPythonRuntime, type PythonRuntime } from "@/lib/pythonRuntime";
import { friendlyPythonError, type PythonPhase } from "@/lib/pythonErrors";

// The runtime is about 13 MB the first time. On school Wi-Fi that can take a
// minute, and "Running tests…" with no progress looks like a hang.
const PYTHON_LOADING_OUTPUT =
  "Loading Python first. The first time can take up to a minute on school Wi-Fi; your tests run as soon as it's ready.";

const MiniEditor = dynamic(() => import("@/components/MiniEditor"), { ssr: false });

// Exercise code persistence (localStorage first, synced to the account when
// signed in) lives in useSyncedCode.

interface Props {
  lesson: Lesson;
  sections: TocSection[];
  chunks: string[];
  prev: Lesson | null;
  next: Lesson | null;
  trackId: string;
  trackTitle: string;
  positionInTrack: number;
  trackLength: number;
  related: Pick<Lesson, "id" | "title" | "subtitle">[];
  /** Set on the first lesson of a later track: the site-wide first lesson. */
  startHere?: StartHere | null;
}

// ─── Tiny helpers ────────────────────────────────────────────────────────────

const LETTERS = ["A", "B", "C", "D"] as const;

interface QuizState {
  answered: (number | null)[]; // index of chosen option, or null
}

// ─── Quiz component ───────────────────────────────────────────────────────────

function QuizSection({
  questions, lessonId, onAnswered,
}: {
  questions: QuizQuestion[]; lessonId: string; onAnswered?: () => void;
}) {
  const [state, setState] = useState<QuizState>({
    answered: questions.map(() => null),
  });

  const answeredCount = state.answered.filter((a) => a !== null).length;
  const correctCount = state.answered.filter(
    (a, i) => a !== null && a === questions[i].correct
  ).length;

  function choose(qIdx: number, optIdx: number) {
    if (state.answered[qIdx] !== null) return; // already answered
    const correct = optIdx === questions[qIdx].correct;
    trackQuizAnswer(lessonId, correct);
    setState((prev) => {
      const next = [...prev.answered];
      next[qIdx] = optIdx;
      return { answered: next };
    });
    onAnswered?.();
  }

  return (
    <section className="sl-quiz" aria-labelledby="knowledge-check-title">
      {/* Header */}
      <div className="sl-quiz-header">
        <h2 id="knowledge-check-title" className="sl-quiz-title">Knowledge Check</h2>
        {answeredCount > 0 && (
          <div className="sl-quiz-score" role="status" aria-live="polite">
            {correctCount}/{answeredCount} correct
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="sl-quiz-body">
        {questions.map((q, qIdx) => {
          const chosen = state.answered[qIdx];
          const isAnswered = chosen !== null;
          const isCorrect = chosen === q.correct;

          return (
            <fieldset key={qIdx} className="sl-question">
              <div className="sl-question-num">Q{qIdx + 1} of {questions.length}</div>
              <legend className="sl-question-text">{q.question}</legend>

              <div className="sl-options">
                {q.options.map((opt, oIdx) => {
                  let cls = "sl-option";
                  if (isAnswered) {
                    if (oIdx === q.correct) cls += " correct";
                    else if (oIdx === chosen) cls += " wrong";
                  }
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      className={cls}
                      onClick={() => choose(qIdx, oIdx)}
                      disabled={isAnswered}
                    >
                      <span className="sl-option-letter">{LETTERS[oIdx]}</span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {isAnswered && (
                <div className={`sl-explanation ${isCorrect ? "correct" : "wrong"}`} role="status" aria-live="polite">
                  {isCorrect ? "✓ " : "✗ "}
                  {q.explanation}
                </div>
              )}
            </fieldset>
          );
        })}
      </div>
    </section>
  );
}

// ─── Celebration overlay ──────────────────────────────────────────────────────

function CelebrationOverlay({
  lessonTitle,
  nextLesson,
  streak,
  onClose,
}: {
  lessonTitle: string;
  nextLesson: Lesson | null;
  streak: number;
  onClose: () => void;
}) {
  return (
    <Dialog open onClose={onClose} title="Lesson complete">
      <div className="sl-celebration-content">
        {/* Check */}
        <div className="sl-celebration-check">✓</div>

        {/* Title */}
        <div className="sl-celebration-subtitle">{lessonTitle}</div>

        {/* XP badge */}
        <div className="sl-xp-badge">
          <span className="sl-num">+100 XP</span>
        </div>

        {/* Streak */}
        <div className="sl-streak-display">
          {streak > 0 ? (
            <>
              <FlameIcon size={13} className={styles.flame} /> <span className="streak-num sl-num">{streak}-day</span> streak — keep it up!
            </>
          ) : (
            "Complete a lesson each day to build your streak"
          )}
        </div>

        {/* Actions */}
        <div className="sl-celebration-actions">
          {nextLesson ? (
            <ActionLink href={`/lesson/${nextLesson.id}`} onClick={onClose}>
              Next lesson: {nextLesson.title}
            </ActionLink>
          ) : (
            <ActionLink href="/playground" onClick={onClose}>
              Open the Playground
            </ActionLink>
          )}
          <Button variant="ghost" onClick={onClose}>
            Stay on this lesson
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

// ─── Main lesson component ────────────────────────────────────────────────────

export default function LessonClient({ lesson, sections, chunks, prev, next, trackId, trackTitle, positionInTrack, trackLength, related, startHere }: Props) {
  // Investing Fundamentals has no coding exercise — the track's own pitch is
  // "no finance background required, just curiosity and pre-algebra," and
  // every one of its lessons already has a no-code drag-slider
  // FormulaSandbox covering the same formula the old Python exercise made
  // you re-implement. Completion for this track gates on the Knowledge
  // Check quiz instead (below). Options/Quant keep the Python exercise —
  // "implement Black-Scholes yourself" is the whole point there.
  const hasCodingExercise = trackId !== "investing";

  const { code, setCode, status: codeSync, markPassed } = useSyncedCode(lesson.id, lesson.exercise.starterCode);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "pass" | "fail">("idle");
  const [python, setPython] = useState<"loading" | "ready" | "failed">("loading");
  const [showCelebration, setShowCelebration] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [quizAnsweredCount, setQuizAnsweredCount] = useState(0);
  const { markComplete, completed, streak, hydrated } = useProgress();
  const runRef = useRef<(() => void) | null>(null);
  const celebratedRef = useRef(false);


  // Track lesson start
  useEffect(() => {
    trackLessonStart(lesson.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const quizQuestions = QUIZZES[lesson.id] ?? [];
  const alreadyDone = hydrated && completed.has(lesson.id);

  useEffect(() => {
    if (alreadyDone) completeSavedLesson(lesson.id);
  }, [alreadyDone, lesson.id]);

  // No-code lessons: completion gates on the Knowledge Check instead of a
  // passed exercise. Fires once, the moment the last question is answered.
  //
  // Deliberately does NOT branch on markComplete's return value — under
  // React Strict Mode's dev-only double-invocation of setState updaters,
  // that return value can't be trusted to reflect whether this was really
  // the first completion (verified: it fired with isNew=false on both
  // invocations in dev, despite this genuinely being a first completion).
  // `alreadyDone` is recomputed fresh each render from the real progress
  // state instead, and `celebratedRef` stops a second effect invocation
  // from scheduling a second celebration.
  useEffect(() => {
    if (hasCodingExercise) return;
    if (quizQuestions.length === 0) return;
    if (quizAnsweredCount < quizQuestions.length) return;
    if (!hydrated) return; // avoid marking complete before we know it's already done
    if (celebratedRef.current) return;

    markComplete(lesson.id); // idempotent — no-op if already completed

    if (!alreadyDone) {
      celebratedRef.current = true;
      trackLessonComplete(lesson.id);
      setTimeout(() => setShowCelebration(true), 400);
    }
  }, [hasCodingExercise, quizAnsweredCount, quizQuestions.length, hydrated, alreadyDone, markComplete, lesson.id]);

  // Map of chunk index -> question index, so each checkpoint renders after the
  // section it tests. Questions beyond the number of eligible slots fall back
  // to the end-of-lesson block instead of being dropped.
  const placement = checkpointPlacement(quizQuestions.length, sections.length);
  const checkpointFor = new Map<number, number>(placement.map((chunkIdx, qIdx) => [chunkIdx, qIdx]));
  const leftoverQuestions = quizQuestions.slice(placement.length);

  // Map of chunk index -> sandbox config, keyed by matching each sandbox's
  // afterSectionId to its section's position (chunk i+1 holds section i).
  const sandboxList: FormulaSandboxConfig[] = lesson.sandboxes ?? [];
  const sandboxFor = new Map<number, FormulaSandboxConfig>(
    sandboxList
      .map((sb): [number, FormulaSandboxConfig] | null => {
        const sectionIdx = sections.findIndex((s) => s.id === sb.afterSectionId);
        return sectionIdx === -1 ? null : [sectionIdx + 1, sb];
      })
      .filter((entry): entry is [number, FormulaSandboxConfig] => entry !== null)
  );

  // Same placement mechanics as sandboxFor, for the larger interactive tools
  // (payoff diagram, binomial tree) that have their own dedicated components.
  const visualList: LessonVisual[] = lesson.visuals ?? [];
  const visualFor = new Map<number, LessonVisual>(
    visualList
      .map((vz): [number, LessonVisual] | null => {
        const sectionIdx = sections.findIndex((s) => s.id === vz.afterSectionId);
        return sectionIdx === -1 ? null : [sectionIdx + 1, vz];
      })
      .filter((entry): entry is [number, LessonVisual] => entry !== null)
  );

  // Start loading Python as soon as the exercise is on screen, so Run is fast.
  // Investing lessons have no editor, so they skip the download entirely.
  useEffect(() => {
    if (!hasCodingExercise) return;
    let active = true;
    loadPythonRuntime().then(
      () => active && setPython("ready"),
      () => active && setPython("failed"), // Run tries again.
    );
    return () => {
      active = false;
    };
  }, [hasCodingExercise]);

  const runCode = useCallback(async () => {
    setStatus("running");
    setOutput(python === "ready" ? "Running tests…" : PYTHON_LOADING_OUTPUT);

    let pyodide: PythonRuntime;
    try {
      pyodide = await loadPythonRuntime();
      setPython("ready");
    } catch (err: unknown) {
      setPython("failed");
      setOutput(err instanceof Error ? err.message : String(err));
      setStatus("fail");
      return;
    }

    setOutput("Running tests…");
    let phase: PythonPhase = "code";
    try {
      await pyodide.runPython(code);
      phase = "tests";
      await pyodide.runPython(lesson.exercise.testFn);
      setOutput("✓ All tests passed!");
      setStatus("pass");
      trackTestsPassed(lesson.id);
      markPassed();

      // Award XP + show celebration only for first-time completions
      const isNew = markComplete(lesson.id);
      if (isNew) {
        trackLessonComplete(lesson.id);
        setTimeout(() => setShowCelebration(true), 400);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setOutput(friendlyPythonError(msg, phase));
      setStatus("fail");
    }
  }, [code, lesson.exercise.testFn, lesson.id, markComplete, markPassed, python]);

  useEffect(() => {
    runRef.current = runCode;
  }, [runCode]);

  // Ctrl+Enter / Cmd+Enter shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runRef.current?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Progressive enhancement over the plain #exercise anchor: scroll smoothly
  // (unless motion is reduced) and put focus on the exercise so the next Tab
  // lands in its editor. Without JavaScript the browser's own jump does it.
  const jumpToExercise = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(EXERCISE_ANCHOR);
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    target.focus({ preventScroll: true });
    history.replaceState(null, "", `#${EXERCISE_ANCHOR}`);
  };

  // The section that opens the prose sits right under the brief panel, so its
  // heading drops the divider every later section gets. With a preamble, the
  // preamble is the opener and every heading keeps its divider.
  const leadChunk = chunks[0]?.trim() === "" ? 1 : -1;

  const resultLabel = status === "pass" ? "Tests passed" : status === "running" ? "Running" : "Error";

  return (
    <>
      {/* Celebration overlay */}
      {showCelebration && (
        <CelebrationOverlay
          lessonTitle={lesson.title}
          nextLesson={next}
          streak={streak}
          onClose={() => setShowCelebration(false)}
        />
      )}

      <div className={styles.shell}>
        {/* Section nav — occupies the column that used to sit empty beside the
            prose. Hidden under 1180px, where there's no room for it. */}
        <aside className={styles.tocCol}>
          <LessonToc
            sections={sections}
            exercise={hasCodingExercise ? { id: EXERCISE_ANCHOR, title: "Exercise" } : undefined}
          />
        </aside>

        {/* Highlight any passage in the prose to have it re-explained. */}
        <ExplainSelection lessonId={lesson.id} />

        <div className={styles.main}>
          <Breadcrumbs
            trail={[{ name: "Lessons", path: "/lessons" }, { name: lesson.title, path: `/lesson/${lesson.id}` }]}
          />

          <header className={styles.head}>
            <p className={styles.kicker}>
              {trackTitle} <span aria-hidden="true">·</span>{" "}
              <span className="sl-num">{positionInTrack} of {trackLength}</span>
              {alreadyDone && (
                <span className={styles.doneBadge}>
                  <CheckIcon /> Completed
                </span>
              )}
            </p>
            <h1 className={styles.title}>{lesson.title}</h1>
            <p className={styles.subtitle}>
              {lesson.subtitle} <span aria-hidden="true">·</span> <span className="sl-num">{lesson.duration}</span>
            </p>
            {hasCodingExercise && (
              <div className={styles.headActions}>
                <a
                  href={`#${EXERCISE_ANCHOR}`}
                  onClick={jumpToExercise}
                  className={buttonClassName({ variant: "secondary", size: "sm" })}
                >
                  Jump to the exercise
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                    <path d="M6 1.5v9M2 6.5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                {!alreadyDone && <span className={styles.xpNote}><span className="sl-num">+100 XP</span> when the tests pass</span>}
              </div>
            )}
            {/* No-code lessons have no exercise panel to carry the reward, so
                say it here; otherwise finishing the Knowledge Check has no
                visible payoff. */}
            {!hasCodingExercise && !alreadyDone && quizQuestions.length > 0 && (
              <p className={styles.xpNote}><span className="sl-num">+100 XP</span> for finishing the Knowledge Check</p>
            )}
          </header>

          <LessonBrief
            lesson={lesson}
            startHere={startHere && !(hydrated && completed.has(startHere.id)) ? startHere : null}
          />

          {/* Lesson content, with checkpoints interleaved between sections.
              The questions used to sit in one block at the end, so you could
              read the whole lesson without once being asked to retrieve any of
              it. Each one now lands while its section is still fresh. */}
          <div className={`lesson-content ${styles.content}`}>
            {chunks.map((chunk, i) => (
              <div key={i} data-lead={i === leadChunk || undefined}>
                <div dangerouslySetInnerHTML={{ __html: chunk }} />
                {sandboxFor.has(i) && (
                  <FormulaSandbox config={sandboxFor.get(i)!} />
                )}
                {visualFor.get(i)?.type === "payoffDiagram" && <PayoffDiagram />}
                {visualFor.get(i)?.type === "binomialTree" && <BinomialTree />}
                {checkpointFor.has(i) && (
                  <Checkpoint
                    question={quizQuestions[checkpointFor.get(i)!]}
                    lessonId={lesson.id}
                    index={checkpointFor.get(i)! + 1}
                    onAnswered={() => setQuizAnsweredCount((c) => c + 1)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Any questions that didn't fit between sections (short lessons)
              still get shown, rather than silently dropped. */}
          {leftoverQuestions.length > 0 && (
            <div className={styles.block}>
              <QuizSection
                questions={leftoverQuestions}
                lessonId={lesson.id}
                onAnswered={() => setQuizAnsweredCount((c) => c + 1)}
              />
            </div>
          )}

          {/* Exercise — Options/Quant only, see hasCodingExercise above.
              tabIndex -1 lets the jump link and TOC move focus here. */}
          {hasCodingExercise && (
          <section
            id={EXERCISE_ANCHOR}
            tabIndex={-1}
            aria-labelledby="coding-exercise-title"
            className={styles.exercise}
            data-status={status}
          >
            <div className={styles.exHead}>
              <div className={styles.exTitleRow}>
                <h2 id="coding-exercise-title" className={styles.exTitle}>Coding exercise</h2>
                <span className={styles.exMeta}>Python, runs in your browser</span>
              </div>
              {status === "pass" ? (
                <span className={styles.exPassed}><CheckIcon /> Complete</span>
              ) : !alreadyDone ? (
                <span className={`${styles.exXp} sl-num`}>+100 XP</span>
              ) : null}
            </div>

            <p className={styles.exPrompt}>{withInlineCode(lesson.exercise.prompt)}</p>

            <div className={styles.editor}>
              <MiniEditor value={code} onChange={setCode} ariaLabel={`${lesson.title} coding exercise`} />
            </div>
            {/* Only a failed save is announced; "Saving…/Saved" after every pause would be noise. */}
            <p className={styles.sync} data-state={codeSync}>
              <span aria-hidden={codeSync === "retrying" || undefined}>{CODE_SYNC_LABELS[codeSync]}</span>
              <span className="sl-visually-hidden" role="status">
                {codeSync === "retrying" ? CODE_SYNC_LABELS.retrying : ""}
              </span>
            </p>

            {/* Run bar. Sticks to the bottom of the viewport while the editor
                scrolls past, so on a phone Run is never a screen away from
                the code it runs. */}
            <div className={styles.runBar}>
              <div className={styles.runActions}>
                <Button
                  onClick={runCode}
                  disabled={status === "running"}
                  aria-keyshortcuts="Control+Enter Meta+Enter"
                >
                  {status === "running" ? (
                    <>
                      <span className={styles.spinner} aria-hidden="true" />
                      {python === "ready" ? "Running…" : "Loading Python…"}
                    </>
                  ) : (
                    <>
                      <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true" focusable="false">
                        <path d="M1 1.2v9.6a.6.6 0 0 0 .9.5l7.6-4.8a.6.6 0 0 0 0-1L1.9.7a.6.6 0 0 0-.9.5Z" fill="currentColor" />
                      </svg>
                      Run Tests
                      <kbd className={styles.kbd} aria-hidden="true">Ctrl/⌘ Enter</kbd>
                    </>
                  )}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowHint((v) => !v)}
                  aria-expanded={showHint}
                  aria-controls="lesson-ai-tutor"
                >
                  {showHint ? "Hide tutor" : "Ask the tutor"}
                </Button>
              </div>

              {status === "idle" && !showHint && python !== "failed" && (
                <span className={styles.runHint}>
                  {python === "loading" ? "Loading Python in the background…" : "Write your solution, then run"}
                </span>
              )}
              {status === "idle" && !showHint && python === "failed" && (
                <span className={styles.runHint} data-tone="warning" role="status">
                  Python didn&apos;t load. Press Run to try again.
                </span>
              )}
              {status === "fail" && !showHint && (
                <span className={styles.runHint} data-tone="danger">
                  Fix the error and try again
                </span>
              )}
            </div>

            {/* Output */}
            {output && (
              <div className={styles.output} data-status={status} role={status === "fail" ? "alert" : "status"} aria-live="polite" aria-atomic="true">
                <div className={styles.outputHead}>
                  <span aria-hidden="true">{status === "pass" ? "✓" : status === "running" ? "…" : "✗"}</span>
                  <span>{resultLabel}</span>
                </div>
                <pre className={styles.outputBody}>{output}</pre>
              </div>
            )}

            {/* Review is offered only once the tests pass — reviewing broken
                code is the tutor's job, and doing it here would just be a second
                hint button. */}
            {status === "pass" && <AiReview lessonId={lesson.id} code={code} />}

            {/* Extra drilling on the same concept, for a student who passed but
                doesn't feel like it clicked. Reuses the Pyodide runtime already
                loaded here, so a generated exercise costs no extra download. */}
            {status === "pass" && <PracticeProblem lessonId={lesson.id} />}

            {/* AI tutor — conversational, sees the current code and error */}
            {showHint && (
              <div id="lesson-ai-tutor" className={styles.tutor}>
                <AiTutor
                  lessonId={lesson.id}
                  code={code}
                  error={status === "fail" ? output : ""}
                  onClose={() => setShowHint(false)}
                />
              </div>
            )}
          </section>
          )}

          {/* Related lessons — same track, nearest-position-first, excluding
              prev/next (those already have their own links below). */}
          {related.length > 0 && (
            <section className={styles.related} aria-labelledby="related-title">
              <h2 id="related-title" className={styles.relatedTitle}>More in {trackTitle}</h2>
              <ul className={styles.relatedGrid}>
                {related.map((r) => (
                  <li key={r.id}>
                    <Link href={`/lesson/${r.id}`} className={styles.relatedCard}>
                      <span className={styles.relatedName}>{r.title}</span>
                      <span className={styles.relatedSub}>{r.subtitle}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Previous / next */}
          <nav className={styles.pager} aria-label="Lesson navigation">
            {prev ? (
              <Link href={`/lesson/${prev.id}`} className={styles.pagerLink} rel="prev">
                <span className={styles.pagerDir}>Previous</span>
                <span className={styles.pagerName}>{prev.title}</span>
              </Link>
            ) : <span />}
            {next ? (
              <Link href={`/lesson/${next.id}`} className={`${styles.pagerLink} ${styles.pagerNext}`} rel="next">
                <span className={styles.pagerDir}>Next</span>
                <span className={styles.pagerName}>{next.title}</span>
              </Link>
            ) : (
              <Link href="/playground" className={`${styles.pagerLink} ${styles.pagerNext}`}>
                <span className={styles.pagerDir}>Up next</span>
                <span className={styles.pagerName}>Open the Playground</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path d="m2.5 6.2 2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Exercise prompts are plain strings that mark code with `backticks`. */
function withInlineCode(text: string) {
  return text.split(/`([^`]+)`/).map((part, i) => (i % 2 === 1 ? <code key={i}>{part}</code> : part));
}
