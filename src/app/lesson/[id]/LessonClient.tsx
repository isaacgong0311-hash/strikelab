"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { Lesson, FormulaSandboxConfig, LessonVisual } from "@/lib/lessons";
import { QUIZZES, type QuizQuestion } from "@/lib/quizzes";
import dynamic from "next/dynamic";
import { useProgress } from "@/lib/useProgress";
import { trackLessonStart, trackTestsPassed, trackLessonComplete, trackQuizAnswer } from "@/lib/analytics";
import Eyebrow from "@/components/Eyebrow";
import AiTutor from "@/components/AiTutor";
import LessonToc from "@/components/LessonToc";
import AiReview from "@/components/AiReview";
import ExplainSelection from "@/components/ExplainSelection";
import Checkpoint from "@/components/Checkpoint";
import FormulaSandbox from "@/components/FormulaSandbox";
import PayoffDiagram from "@/components/PayoffDiagram";
import BinomialTree from "@/components/BinomialTree";
import PracticeProblem from "@/components/PracticeProblem";
import { checkpointPlacement, type TocSection } from "@/lib/lessonToc";
import FlameIcon from "@/components/FlameIcon";

const MiniEditor = dynamic(() => import("@/components/MiniEditor"), { ssr: false });

// Exercise code was pure React state with no persistence at all — reloading
// the tab, or even just navigating to another lesson and back, silently threw
// away everything the student had typed. Saved per-lesson so a draft survives
// both.
const CODE_KEY_PREFIX = "strikelab_code_";

function readSavedCode(lessonId: string): string | null {
  try {
    return localStorage.getItem(CODE_KEY_PREFIX + lessonId);
  } catch {
    return null;
  }
}

function writeSavedCode(lessonId: string, code: string) {
  try {
    localStorage.setItem(CODE_KEY_PREFIX + lessonId, code);
  } catch {
    // ignore (private browsing, quota, etc. — same fallback as useProgress)
  }
}

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
    <div className="sl-quiz">
      {/* Header */}
      <div className="sl-quiz-header">
        <div className="sl-quiz-title">Knowledge Check</div>
        {answeredCount > 0 && (
          <div className="sl-quiz-score">
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
            <div key={qIdx} className="sl-question">
              <div className="sl-question-num">Q{qIdx + 1} of {questions.length}</div>
              <div className="sl-question-text">{q.question}</div>

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
                <div className={`sl-explanation ${isCorrect ? "correct" : "wrong"}`}>
                  {isCorrect ? "✓ " : "✗ "}
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
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
  // Prevent body scroll while overlay is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="sl-celebration-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="sl-celebration-card">
        {/* Check */}
        <div className="sl-celebration-check">✓</div>

        {/* Title */}
        <div className="sl-celebration-title">Lesson Complete!</div>
        <div className="sl-celebration-subtitle">{lessonTitle}</div>

        {/* XP badge */}
        <div className="sl-xp-badge">
          <span>+100 XP</span>
        </div>

        {/* Streak */}
        <div className="sl-streak-display">
          {streak > 0 ? (
            <>
              <FlameIcon size={13} style={{ color: "var(--coral)" }} /> <span className="streak-num">{streak}-day</span> streak — keep it up!
            </>
          ) : (
            "Complete a lesson each day to build your streak"
          )}
        </div>

        {/* Actions */}
        <div className="sl-celebration-actions">
          {nextLesson ? (
            <Link
              href={`/lesson/${nextLesson.id}`}
              className="sl-btn-primary"
              onClick={onClose}
            >
              Next Lesson → {nextLesson.title}
            </Link>
          ) : (
            <Link
              href="/playground"
              className="sl-btn-primary"
              onClick={onClose}
            >
              Open Playground →
            </Link>
          )}
          <button className="sl-btn-ghost" onClick={onClose}>
            Stay on this lesson
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main lesson component ────────────────────────────────────────────────────

export default function LessonClient({ lesson, sections, chunks, prev, next, trackId, trackTitle, positionInTrack, trackLength }: Props) {
  // Investing Fundamentals has no coding exercise — the track's own pitch is
  // "no finance background required, just curiosity and pre-algebra," and
  // every one of its lessons already has a no-code drag-slider
  // FormulaSandbox covering the same formula the old Python exercise made
  // you re-implement. Completion for this track gates on the Knowledge
  // Check quiz instead (below). Options/Quant keep the Python exercise —
  // "implement Black-Scholes yourself" is the whole point there.
  const hasCodingExercise = trackId !== "investing";

  const [code, setCodeState] = useState(() => readSavedCode(lesson.id) ?? lesson.exercise.starterCode);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "pass" | "fail">("idle");
  const [showCelebration, setShowCelebration] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [quizAnsweredCount, setQuizAnsweredCount] = useState(0);
  const { markComplete, completed, streak, hydrated } = useProgress();
  const runRef = useRef<(() => void) | null>(null);
  const celebratedRef = useRef(false);

  // Persisting from the setter itself, rather than a useEffect watching
  // `code`, ties the write directly to the edit event instead of a render
  // pass.
  const setCode = useCallback((next: string) => {
    setCodeState(next);
    writeSavedCode(lesson.id, next);
  }, [lesson.id]);

  // Track lesson start
  useEffect(() => {
    trackLessonStart(lesson.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const quizQuestions = QUIZZES[lesson.id] ?? [];
  const alreadyDone = hydrated && completed.has(lesson.id);

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

  const runCode = useCallback(async () => {
    setStatus("running");
    setOutput("Running tests…");

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pyodide = await (window as any).__pyodideReady;
      pyodide.runPython(code);
      pyodide.runPython(lesson.exercise.testFn);
      setOutput("✓ All tests passed!");
      setStatus("pass");
      trackTestsPassed(lesson.id);

      // Award XP + show celebration only for first-time completions
      const isNew = markComplete(lesson.id);
      if (isNew) {
        trackLessonComplete(lesson.id);
        setTimeout(() => setShowCelebration(true), 400);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setOutput(msg);
      setStatus("fail");
    }
  }, [code, lesson.exercise.testFn, lesson.id, markComplete]);

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

  const borderColor =
    status === "pass" ? "rgba(34,197,94,0.35)"
    : status === "fail" ? "rgba(239,68,68,0.3)"
    : "var(--border)";

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

      <div className="lesson-shell max-w-6xl mx-auto px-6 py-10">
        {/* Section nav — occupies the column that used to sit empty beside the
            prose. Hidden under 1180px, where there's no room for it. */}
        <aside className="lesson-toc-col">
          <LessonToc sections={sections} />
        </aside>

        {/* Highlight any passage in the prose to have it re-explained. */}
        <ExplainSelection lessonId={lesson.id} />

        <div className="min-w-0 max-w-3xl">
        {/* Breadcrumb */}
        <div className="v2-rise in flex items-center gap-2 text-sm mb-5" style={{ color: "var(--muted)" }}>
          <Link href="/lessons" className="transition-opacity hover:opacity-70" style={{ color: "var(--ink-2)" }}>
            Lessons
          </Link>
          <span>/</span>
          <span style={{ color: "var(--ink)" }}>{lesson.title}</span>
        </div>

        {/* Header */}
        <div className="v2-page-head mb-6" data-v2-head style={{ padding: 0, border: 0 }}>
          {/* Already-completed badge */}
          {alreadyDone && (
            <div
              className="inline-flex items-center gap-2 mb-3 text-[10px] px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.2)",
                color: "var(--grass)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.08em",
              }}
            >
              <span>✓</span>
              <span>Completed · +100 XP earned</span>
            </div>
          )}

          <Eyebrow>{trackTitle} · Lesson {positionInTrack} of {trackLength}</Eyebrow>
          <h1
            className="text-3xl font-semibold mb-1"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            {lesson.title}
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            {lesson.subtitle} · {lesson.duration}
          </p>
          {/* Coding-exercise lessons show their +100 XP badge on the exercise
              panel itself, further down. No-code lessons don't have that
              panel, so say it here instead — otherwise there's no visible
              reward for finishing the Knowledge Check below. */}
          {!hasCodingExercise && !alreadyDone && quizQuestions.length > 0 && (
            <p
              className="text-xs mt-2"
              style={{ color: "var(--amber)", fontFamily: "var(--font-mono)" }}
            >
              +100 XP for finishing the Knowledge Check below
            </p>
          )}
        </div>

        {/* Lesson content, with checkpoints interleaved between sections.
            The questions used to sit in one block at the end, so you could
            read the whole lesson without once being asked to retrieve any of
            it. Each one now lands while its section is still fresh. */}
        <div
          className="v2-rise lesson-content mb-8 pb-8"
          style={{ borderBottom: "1px solid var(--border)", transitionDelay: "80ms" }}
        >
          {chunks.map((chunk, i) => (
            <div key={i}>
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
          <div className="v2-rise" style={{ transitionDelay: "120ms" }}>
            <QuizSection
              questions={leftoverQuestions}
              lessonId={lesson.id}
              onAnswered={() => setQuizAnsweredCount((c) => c + 1)}
            />
          </div>
        )}

        {/* Exercise — Options/Quant only, see hasCodingExercise above */}
        {hasCodingExercise && (
        <div
          className="v2-rise border overflow-hidden mb-8"
          style={{
            transitionDelay: "160ms",
            borderColor,
            transition: "border-color 0.25s, opacity 600ms cubic-bezier(.2,.7,.3,1), transform 600ms cubic-bezier(.2,.7,.3,1)",
          }}
        >
          {/* Exercise header */}
          <div
            className="px-5 py-3 flex items-center justify-between border-b"
            style={{ borderColor: "var(--border)", background: "var(--bg2)" }}
          >
            <div className="flex items-center gap-3">
              <span
                className="text-sm font-semibold"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
              >
                Coding Exercise
              </span>
              <span
                className="text-[10px] uppercase tracking-widest"
                style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
              >
                Python · runs in browser
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!alreadyDone && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded"
                  style={{ background: "var(--amber-tint)", color: "var(--amber)", fontFamily: "var(--font-mono)" }}
                >
                  +100 XP
                </span>
              )}
              {status === "pass" && (
                <span className="text-[11px]" style={{ color: "var(--check)", fontFamily: "var(--font-mono)" }}>
                  ✓ complete
                </span>
              )}
            </div>
          </div>

          {/* Prompt */}
          <div
            className="px-5 py-3 border-b text-sm leading-relaxed"
            style={{ borderColor: "var(--border)", color: "var(--fg-mute)", background: "var(--card)" }}
          >
            {lesson.exercise.prompt}
          </div>

          {/* Code editor */}
          <MiniEditor value={code} onChange={setCode} />

          {/* Run bar */}
          <div
            className="px-5 py-3 flex items-center justify-between border-t gap-3"
            style={{ borderColor: "var(--border)", background: "var(--bg2)" }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={runCode}
                disabled={status === "running"}
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium transition-all disabled:opacity-30"
                style={{
                  background: "var(--grass)",
                  color: "#ffffff",
                  fontFamily: "var(--font-mono)",
                  border: "1px solid transparent",
                  borderRadius: "10px",
                  boxShadow: "0 3px 0 var(--grass-d)",
                  letterSpacing: "0.03em",
                }}
              >
                {status === "running" ? (
                  <>
                    <span className="animate-spin inline-block" style={{ fontSize: 12 }}>◌</span>
                    Running…
                  </>
                ) : (
                  <>
                    ▶ Run Tests
                    <kbd
                      className="text-[9px] px-1.5 py-0.5 ml-1"
                      style={{
                        background: "rgba(255,255,255,0.25)",
                        color: "rgba(255,255,255,0.9)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      ⌘↵
                    </kbd>
                  </>
                )}
              </button>

              {/* AI Hint button — shows after first attempt or always */}
              <button
                onClick={() => setShowHint((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: showHint ? "rgba(34,197,94,0.12)" : "var(--card)",
                  color: showHint ? "var(--check)" : "var(--fg-mute)",
                  fontFamily: "var(--font-mono)",
                  border: `1px solid ${showHint ? "rgba(34,197,94,0.3)" : "var(--border-hi)"}`,
                  borderRadius: "10px",
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                }}
              >
                ∂ {showHint ? "Hide tutor" : "Ask the tutor"}
              </button>
            </div>

            {status === "idle" && !showHint && (
              <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                Write your solution, then run
              </span>
            )}
            {status === "fail" && !showHint && (
              <span className="text-xs" style={{ color: "#dc2626", fontFamily: "var(--font-mono)" }}>
                Fix the error and try again
              </span>
            )}
          </div>

          {/* Output */}
          {output && (
            <div className="border-t" style={{ borderColor: "var(--border)" }}>
              <div
                className="flex items-center gap-2 px-5 py-2 border-b text-[10px] uppercase tracking-widest"
                style={{
                  borderColor: "var(--border)",
                  color: status === "pass" ? "var(--check)" : "#dc2626",
                  fontFamily: "var(--font-mono)",
                  background: "var(--bg2)",
                }}
              >
                <span>{status === "pass" ? "✓" : "✗"}</span>
                <span>{status === "pass" ? "Tests passed" : "Error"}</span>
              </div>
              <pre
                className="px-5 py-4 text-xs font-mono whitespace-pre-wrap overflow-auto"
                style={{
                  color: status === "pass" ? "var(--check)" : "#dc2626",
                  background: "var(--bg)",
                  maxHeight: "12rem",
                }}
              >
                {output}
              </pre>
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
            <div style={{ padding: "0 14px 14px" }}>
              <AiTutor
                lessonId={lesson.id}
                code={code}
                error={status === "fail" ? output : ""}
                onClose={() => setShowHint(false)}
              />
            </div>
          )}
        </div>
        )}

        {/* Pyodide loader — only needed when there's a Python exercise on
            the page (Options/Quant). Loading a WASM Python runtime for an
            Investing lesson that has no code editor was pure waste. */}
        {hasCodingExercise && <PyodideLoader />}

        {/* Navigation */}
        <div className="v2-rise flex justify-between items-center" style={{ transitionDelay: "240ms" }}>
          {prev ? (
            <Link
              href={`/lesson/${prev.id}`}
              className="text-sm px-4 py-2 rounded-lg border transition-opacity hover:opacity-70"
              style={{ borderColor: "var(--border)", color: "var(--ink-2)" }}
            >
              ← {prev.title}
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/lesson/${next.id}`}
              className="text-sm px-4 py-2 font-medium transition-colors hover:opacity-80"
              style={{ background: "var(--grass)", color: "#ffffff", fontFamily: "var(--font-mono)", borderRadius: "10px", boxShadow: "0 3px 0 var(--grass-d)" }}
            >
              {next.title} →
            </Link>
          ) : (
            <Link
              href="/playground"
              className="text-sm px-4 py-2 font-medium transition-colors hover:opacity-80"
              style={{ background: "var(--grass)", color: "#ffffff", fontFamily: "var(--font-mono)", borderRadius: "10px", boxShadow: "0 3px 0 var(--grass-d)" }}
            >
              Open Playground →
            </Link>
          )}
        </div>
        </div>
      </div>
    </>
  );
}

function PyodideLoader() {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).__pyodideReady) return null;

  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__pyodideReady = new Promise((resolve) => {
    script.onload = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pyodide = await (window as any).loadPyodide();
      resolve(pyodide);
    };
  });
  document.head.appendChild(script);

  return null;
}
