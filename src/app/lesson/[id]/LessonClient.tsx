"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Lesson } from "@/lib/lessons";
import dynamic from "next/dynamic";
import { useProgress } from "@/lib/useProgress";

const MiniEditor = dynamic(() => import("@/components/MiniEditor"), { ssr: false });

interface Props {
  lesson: Lesson;
  prev: Lesson | null;
  next: Lesson | null;
}

export default function LessonClient({ lesson, prev, next }: Props) {
  const [code, setCode] = useState(lesson.exercise.starterCode);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "pass" | "fail">("idle");
  const { markComplete } = useProgress();
  const runRef = useRef<(() => void) | null>(null);

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
      markComplete(lesson.id);
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
    status === "pass" ? "rgba(34,197,94,0.5)"
    : status === "fail" ? "rgba(239,68,68,0.4)"
    : "var(--border)";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--muted)" }}>
        <Link href="/lessons" className="hover:text-white transition-colors">
          Lessons
        </Link>
        <span>/</span>
        <span className="text-white">{lesson.title}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div
          className="text-xs tracking-widest uppercase mb-2 opacity-50"
          style={{ fontFamily: "var(--font-mono)", color: "#888888" }}
        >
          Lesson
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
        className="lesson-content rounded-xl border p-7 mb-8"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
        dangerouslySetInnerHTML={{ __html: lesson.content }}
      />

      {/* Exercise */}
      <div
        className="rounded-xl border overflow-hidden mb-8"
        style={{
          borderColor,
          boxShadow: status === "pass"
            ? "0 0 0 1px rgba(34,197,94,0.2), 0 0 20px rgba(34,197,94,0.06)"
            : status === "fail"
              ? "0 0 0 1px rgba(239,68,68,0.15)"
              : "none",
          transition: "border-color 0.25s, box-shadow 0.25s",
        }}
      >
        {/* Exercise header */}
        <div
          className="px-5 py-3 flex items-center justify-between border-b"
          style={{ borderColor, background: "var(--bg2)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="font-semibold text-white text-sm"
              style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
            >
              Exercise
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{
                background: "rgba(96,165,250,0.1)",
                color: "#60a5fa",
                fontFamily: "var(--font-mono)",
                border: "1px solid rgba(96,165,250,0.2)",
              }}
            >
              Python
            </span>
          </div>
          <span className="text-[10px]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            runs in browser · no install
          </span>
        </div>

        {/* Prompt */}
        <div
          className="px-5 py-3 border-b text-sm leading-relaxed"
          style={{ borderColor, color: "#94a3b8", background: "var(--card)" }}
        >
          {lesson.exercise.prompt}
        </div>

        {/* Code editor */}
        <MiniEditor value={code} onChange={setCode} />

        {/* Run bar */}
        <div
          className="px-5 py-3 flex items-center justify-between border-t gap-3"
          style={{ borderColor, background: "var(--bg2)" }}
        >
          <button
            onClick={runCode}
            disabled={status === "running"}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-40"
            style={{
              background: status === "running"
                ? "rgba(34,197,94,0.12)"
                : "linear-gradient(135deg, #16a34a, #22c55e)",
              color: status === "running" ? "#4ade80" : "#000",
              fontFamily: "var(--font-mono)",
              boxShadow: status === "running"
                ? "none"
                : "0 0 14px rgba(34,197,94,0.45), 0 2px 8px rgba(34,197,94,0.25)",
              border: "1px solid rgba(34,197,94,0.5)",
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
                <span>▶</span>
                Run Tests
                <kbd
                  className="text-[9px] px-1 py-0.5 rounded ml-0.5"
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    color: "rgba(0,0,0,0.6)",
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
          {status === "pass" && (
            <span className="text-sm font-semibold" style={{ color: "#4ade80", fontFamily: "var(--font-mono)" }}>
              ✓ Lesson complete
            </span>
          )}
          {status === "fail" && (
            <span className="text-xs" style={{ color: "#fca5a5", fontFamily: "var(--font-mono)" }}>
              Fix the error above and try again
            </span>
          )}
        </div>

        {/* Output */}
        {output && (
          <div
            className="border-t"
            style={{
              borderColor,
              background: status === "pass" ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)",
            }}
          >
            <div
              className="flex items-center gap-2 px-5 py-2 border-b text-[10px] uppercase tracking-widest"
              style={{
                borderColor,
                color: status === "pass" ? "#4ade80" : "#fca5a5",
                fontFamily: "var(--font-mono)",
              }}
            >
              <span>{status === "pass" ? "✓" : "✗"}</span>
              <span>{status === "pass" ? "Tests passed" : "Test failed"}</span>
            </div>
            <pre
              className="px-5 py-4 text-xs font-mono whitespace-pre-wrap overflow-auto"
              style={{
                color: status === "pass" ? "#4ade80" : "#fca5a5",
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
      <div className="flex justify-between items-center">
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
            className="text-sm px-4 py-2 rounded-lg transition-opacity hover:opacity-90 text-white font-semibold"
            style={{ background: "linear-gradient(135deg, #ffffff, #cccccc)" }}
          >
            {next.title} →
          </Link>
        ) : (
          <Link
            href="/playground"
            className="text-sm px-4 py-2 rounded-lg transition-opacity hover:opacity-90 text-white font-semibold"
            style={{ background: "linear-gradient(135deg, #a3a3a3, #ffffff)" }}
          >
            Open Playground →
          </Link>
        )}
      </div>
    </div>
  );
}

function PyodideLoader() {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).__pyodideReady) return null;

  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
  script.onload = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pyodide = await (window as any).loadPyodide();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__pyodideReady = Promise.resolve(pyodide);
  };
  document.head.appendChild(script);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__pyodideReady = new Promise((resolve) => {
    script.onload = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pyodide = await (window as any).loadPyodide();
      resolve(pyodide);
    };
  });

  return null;
}
