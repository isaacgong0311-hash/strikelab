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
    <div className="ai-review">
      <div className="ai-review-head">
        <span className="ai-review-title">
          <span className="ai-dot" aria-hidden="true" />
          Code review
        </span>
        {state === "done" && (
          <button type="button" className="ai-review-again" onClick={run}>
            Re-run
          </button>
        )}
      </div>
      <div className="ai-review-body">
        {review ? (
          renderAiMarkdown(review)
        ) : (
          <span className="ai-thinking" aria-label="Reviewing">
            <i /><i /><i />
          </span>
        )}
      </div>
    </div>
  );
}
