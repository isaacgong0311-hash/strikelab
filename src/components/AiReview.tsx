"use client";
import { useState, useCallback } from "react";
import { renderAiMarkdown, streamInto } from "./AiMarkdown";

/**
 * "Review my solution" — offered only once the tests pass.
 *
 * Opt-in rather than automatic: a student who just went green has earned the
 * win, and immediately shoving critique in front of them undercuts it. It also
 * keeps the token spend tied to intent instead of firing on every pass.
 */
export default function AiReview({ lessonId, code }: { lessonId: string; code: string }) {
  const [review, setReview] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const run = useCallback(async () => {
    setState("loading");
    setReview("");
    try {
      await streamInto("/api/ai/review", { lessonId, code }, (chunk) =>
        setReview((prev) => prev + chunk),
      );
    } catch {
      setReview("Couldn't reach the reviewer. Your solution still passed — that part is real.");
    } finally {
      setState("done");
    }
  }, [lessonId, code]);

  if (state === "idle") {
    return (
      <div className="ai-review-cta">
        <div className="ai-review-cta-text">
          <strong>Nice — that passes.</strong> Want it reviewed? Correct isn&apos;t the same as
          idiomatic.
        </div>
        <button type="button" className="ai-review-btn" onClick={run}>
          Review my solution
        </button>
      </div>
    );
  }

  return (
    <section className="ai-review" aria-labelledby="ai-review-title">
      <div className="ai-review-head">
        <h3 id="ai-review-title" className="ai-review-title">
          <span className="ai-dot" aria-hidden="true" />
          Code review
        </h3>
        {state === "done" && (
          <button type="button" className="ai-review-again" onClick={run}>
            Re-run
          </button>
        )}
      </div>
      <div className="ai-review-body" aria-busy={state === "loading"}>
        {review ? (
          renderAiMarkdown(review)
        ) : (
          <span className="ai-thinking" aria-label="Reviewing">
            <i /><i /><i />
          </span>
        )}
      </div>
      <span className="sl-visually-hidden" role="status" aria-live="polite">{state === "loading" ? "Reviewing solution." : "Code review ready."}</span>
    </section>
  );
}
