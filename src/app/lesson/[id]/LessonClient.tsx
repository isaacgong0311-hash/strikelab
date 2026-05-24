"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Lesson } from "@/lib/lessons";
import { QUIZZES, type QuizQuestion } from "@/lib/quizzes";
import dynamic from "next/dynamic";
import { useProgress } from "@/lib/useProgress";

const MiniEditor = dynamic(() => import("@/components/MiniEditor"), { ssr: false });

interface Props {
  lesson: Lesson;
  prev: Lesson | null;
  next: Lesson | null;
}

// ─── Tiny helpers ────────────────────────────────────────────────────────────

const LETTERS = ["A", "B", "C", "D"] as const;

interface QuizState {
  answered: (number | null)[]; // index of chosen option, or null
}

// ─── Quiz component ───────────────────────────────────────────────────────────

function QuizSection({ questions }: { questions: QuizQuestion[] }) {
  const [state, setState] = useState<QuizState>({
    answered: questions.map(() => null),
  });

  const answeredCount = state.answered.filter((a) => a !== null).length;
  const correctCount = state.answered.filter(
    (a, i) => a !== null && a === questions[i].correct
  ).length;

  function choose(qIdx: number, optIdx: number) {
    if (state.answered[qIdx] !== null) return; // already answered
    setState((prev) => {
      const next = [...prev.answered];
      next[qIdx] = optIdx;
      return { answered: next };
    });
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
              🔥 <span className="streak-num">{streak}-day</span> streak — keep it up!
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

export default function LessonClient({ lesson, prev, next }: Props) {
  const [code, setCode] = useState(lesson.exercise.starterCode);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "pass" | "fail">("idle");
  const [showCelebration, setShowCelebration] = useState(false);
  const { markComplete, completed, streak, hydrated } = useProgress();
  const runRef = useRef<(() => void) | null>(null);

  const quizQuestions = QUIZZES[lesson.id] ?? [];
  const alreadyDone = hydrated && completed.has(lesson.id);

  async function runCode() {
    setStatus("running");
    setOutput("Running tests…");

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pyodide = await (window as any).__pyodideReady;
      pyodide.runPython(code);
      pyodide.runPython(lesson.exercise.testFn);
      setOutput("✓ All tests passed!");
      setStatus("pass");

      // Award XP + show celebration only for first-time completions
      const isNew = markComplete(lesson.id);
      if (isNew) {
        setTimeout(() => setShowCelebration(true), 400);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setOutput(msg);
      setStatus("fail");
    }
  }

  runRef.current = runCode;

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

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="v2-rise in flex items-center gap-2 text-sm mb-5" style={{ color: "var(--muted)" }}>
          <Link href="/lessons" className="hover:text-white transition-colors">
            Lessons
          </Link>
          <span>/</span>
          <span className="text-white">{lesson.title}</span>
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
                color: "#4ade80",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.08em",
              }}
            >
              <span>✓</span>
              <span>Completed · +100 XP earned</span>
            </div>
          )}

          <div
            className="text-xs tracking-widest uppercase mb-2 opacity-50"
            style={{ fontFamily: "var(--font-mono)", color: "#888888" }}
          >
            Lesson {lesson.id} of 10
          </div>
          <h1
            className="text-3xl font-semibold text-white mb-1"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
          >
            {lesson.title}
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            {lesson.subtitle} · {lesson.duration}
          </p>
        </div>

        {/* Lesson content */}
        <div
          className="v2-rise lesson-content mb-8 pb-8"
          style={{ borderBottom: "1px solid var(--border)", transitionDelay: "80ms" }}
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />

        {/* Knowledge check quiz */}
        {quizQuestions.length > 0 && (
          <div className="v2-rise" style={{ transitionDelay: "120ms" }}>
            <QuizSection questions={quizQuestions} />
          </div>
        )}

        {/* Exercise */}
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
                className="text-sm font-medium text-white"
                style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
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
                  style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", fontFamily: "var(--font-mono)" }}
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
            <button
              onClick={runCode}
              disabled={status === "running"}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium transition-all disabled:opacity-30"
              style={{
                background: "var(--fg)",
                color: "#000000",
                fontFamily: "var(--font-mono)",
                border: "1px solid transparent",
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
                      background: "rgba(0,0,0,0.15)",
                      color: "rgba(0,0,0,0.55)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    ⌘↵
                  </kbd>
                </>
              )}
            </button>

            {status === "idle" && (
              <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                Write your solution, then run
              </span>
            )}
            {status === "fail" && (
              <span className="text-xs" style={{ color: "#f87171", fontFamily: "var(--font-mono)" }}>
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
                  color: status === "pass" ? "var(--check)" : "#f87171",
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
                  color: status === "pass" ? "var(--check)" : "#f87171",
                  background: "var(--bg)",
                  maxHeight: "12rem",
                }}
              >
                {output}
              </pre>
            </div>
          )}
        </div>

        {/* Pyodide loader */}
        <PyodideLoader />

        {/* Navigation */}
        <div className="v2-rise flex justify-between items-center" style={{ transitionDelay: "240ms" }}>
          {prev ? (
            <Link
              href={`/lesson/${prev.id}`}
              className="text-sm px-4 py-2 rounded-lg border transition-colors hover:border-white"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}
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
              style={{ background: "var(--fg)", color: "#000000", fontFamily: "var(--font-mono)" }}
            >
              {next.title} →
            </Link>
          ) : (
            <Link
              href="/playground"
              className="text-sm px-4 py-2 font-medium transition-colors hover:opacity-80"
              style={{ background: "var(--fg)", color: "#000000", fontFamily: "var(--font-mono)" }}
            >
              Open Playground →
            </Link>
          )}
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
