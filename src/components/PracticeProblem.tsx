"use client";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

const MiniEditor = dynamic(() => import("@/components/MiniEditor"), { ssr: false });

interface Problem {
  title: string;
  prompt: string;
  starterCode: string;
  testCode: string;
  solution: string;
}

/**
 * Generate-and-solve extra practice on the current lesson's concept.
 *
 * The curriculum is 22 fixed exercises, so a student who finishes one without
 * it clicking has nowhere to drill. This reuses the Pyodide runtime already
 * loaded on the lesson page, so running a generated exercise costs no extra
 * download.
 *
 * The generated tests are model-written and occasionally wrong, so "Show
 * solution" is always available — being stuck on a bad test with no escape is
 * far worse than seeing an answer early.
 */
export default function PracticeProblem({ lessonId }: { lessonId: string }) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "ready" | "running" | "pass" | "fail">("idle");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [showSolution, setShowSolution] = useState(false);

  const generate = useCallback(async () => {
    setStatus("generating");
    setError("");
    setOutput("");
    setShowSolution(false);
    try {
      const res = await fetch("/api/ai/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't generate a problem.");
        setStatus("idle");
        return;
      }
      setProblem(data.problem);
      setCode(data.problem.starterCode);
      setStatus("ready");
    } catch {
      setError("Couldn't reach the generator. Check your connection.");
      setStatus("idle");
    }
  }, [lessonId]);

  const run = useCallback(async () => {
    if (!problem) return;
    setStatus("running");
    setOutput("Running tests…");
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pyodide = await (window as any).__pyodideReady;
      pyodide.runPython(code);
      pyodide.runPython(problem.testCode);
      setOutput("All tests passed!");
      setStatus("pass");
    } catch (err: unknown) {
      setOutput(err instanceof Error ? err.message : String(err));
      setStatus("fail");
    }
  }, [problem, code]);

  if (status === "idle") {
    return (
      <div className="pr-cta">
        <div className="pr-cta-text">
          <strong>Want another?</strong> Generate a fresh exercise on this concept.
        </div>
        <button type="button" className="pr-btn" onClick={generate}>
          New practice problem
        </button>
        {error && <p className="pr-error">{error}</p>}
      </div>
    );
  }

  if (status === "generating") {
    return (
      <div className="pr-cta">
        <div className="pr-cta-text">
          <span className="ai-thinking" aria-label="Generating"><i /><i /><i /></span>
          <span style={{ marginLeft: 10 }}>Writing you a problem…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pr">
      <div className="pr-head">
        <span className="pr-title">{problem?.title}</span>
        <button type="button" className="pr-again" onClick={generate}>
          Another
        </button>
      </div>

      <p className="pr-prompt">{problem?.prompt}</p>

      <div className="pr-editor">
        <MiniEditor value={code} onChange={setCode} />
      </div>

      <div className="pr-actions">
        <button type="button" className="pr-btn" onClick={run} disabled={status === "running"}>
          {status === "running" ? "Running…" : "Run tests"}
        </button>
        <button
          type="button"
          className="pr-ghost"
          onClick={() => setShowSolution((v) => !v)}
        >
          {showSolution ? "Hide solution" : "Show solution"}
        </button>
        {status === "pass" && <span className="pr-pass">Passed</span>}
      </div>

      {output && (
        <pre className={`pr-output${status === "fail" ? " fail" : ""}`}>{output}</pre>
      )}

      {showSolution && (
        <>
          <p className="pr-solution-note">
            These problems are generated, so the tests are occasionally wrong. If your answer
            looks right and still fails, it probably is right.
          </p>
          <pre className="pr-output">{problem?.solution}</pre>
        </>
      )}
    </div>
  );
}
