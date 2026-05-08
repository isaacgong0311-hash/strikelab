"use client";
import { useState } from "react";
import Link from "next/link";
import type { Lesson } from "@/lib/lessons";
import dynamic from "next/dynamic";

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

  async function runCode() {
    setStatus("running");
    setOutput("Loading Python runtime…");

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pyodide = await (window as any).__pyodideReady;
      pyodide.runPython(code);
      pyodide.runPython(lesson.exercise.testFn);
      setOutput("✓ All tests passed!");
      setStatus("pass");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setOutput(msg);
      setStatus("fail");
    }
  }

  const borderColor =
    status === "pass" ? "#22c55e" : status === "fail" ? "#ef4444" : "var(--border)";

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
          style={{ fontFamily: "var(--font-mono)", color: "#93c5fd" }}
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
      <div className="rounded-xl border overflow-hidden mb-8" style={{ borderColor }}>
        <div
          className="px-5 py-3 flex items-center justify-between border-b"
          style={{ borderColor, background: "var(--bg2)" }}
        >
          <span
            className="font-semibold text-white text-sm"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
          >
            Exercise
          </span>
          <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            Python · runs in browser
          </span>
        </div>
        <div className="px-5 py-3 border-b text-sm" style={{ borderColor, color: "#94a3b8", background: "var(--card)" }}>
          {lesson.exercise.prompt}
        </div>
        <MiniEditor value={code} onChange={setCode} />
        <div
          className="px-5 py-3 flex items-center justify-between border-t"
          style={{ borderColor, background: "var(--bg2)" }}
        >
          <button
            onClick={runCode}
            disabled={status === "running"}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #3b82f6, #0ea5e9)" }}
          >
            {status === "running" ? "Running…" : "▶ Run Tests"}
          </button>
          {status === "idle" && (
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              Click Run Tests to check your code
            </span>
          )}
        </div>
        {output && (
          <pre
            className="px-5 py-4 text-sm font-mono whitespace-pre-wrap border-t"
            style={{
              borderColor,
              background: status === "pass" ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
              color: status === "pass" ? "#86efac" : "#fca5a5",
            }}
          >
            {output}
          </pre>
        )}
      </div>

      {/* Pyodide loader */}
      <PyodideLoader />

      {/* Navigation */}
      <div className="flex justify-between items-center">
        {prev ? (
          <Link
            href={`/lesson/${prev.id}`}
            className="text-sm px-4 py-2 rounded-lg border transition-colors hover:border-blue-500"
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
            style={{ background: "linear-gradient(135deg, #3b82f6, #0ea5e9)" }}
          >
            {next.title} →
          </Link>
        ) : (
          <Link
            href="/playground"
            className="text-sm px-4 py-2 rounded-lg transition-opacity hover:opacity-90 text-white font-semibold"
            style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}
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
