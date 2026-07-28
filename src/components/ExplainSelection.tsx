"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { renderAiMarkdown, streamInto } from "./AiMarkdown";

/**
 * Select any passage in the lesson prose to get it re-explained.
 *
 * Written prose has to commit to one level of explanation. This gives a reader
 * who bounces off a specific sentence a way to get that sentence unpacked,
 * without the author having to write three versions of every paragraph.
 *
 * Scoped to `.lesson-content` so selecting text in the nav, the editor or the
 * quiz doesn't pop a button — those aren't prose and re-explaining them makes
 * no sense.
 */

interface Anchor { x: number; y: number; text: string; }

export default function ExplainSelection({ lessonId }: { lessonId: string }) {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [answer, setAnswer] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Watch for selections inside the lesson prose.
  useEffect(() => {
    const onSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        // Don't dismiss while the panel is open — clicking into it clears the
        // selection, and that shouldn't close the thing you just opened.
        if (!open) setAnchor(null);
        return;
      }

      const text = sel.toString().trim();
      if (text.length < 3) { if (!open) setAnchor(null); return; }

      const container = sel.anchorNode?.parentElement?.closest(".lesson-content");
      if (!container) { if (!open) setAnchor(null); return; }

      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      setAnchor({
        x: rect.left + rect.width / 2 + window.scrollX,
        y: rect.top + window.scrollY,
        text,
      });
    };

    document.addEventListener("selectionchange", onSelection);
    return () => document.removeEventListener("selectionchange", onSelection);
  }, [open]);

  // Dismiss on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setAnchor(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const explain = useCallback(async () => {
    if (!anchor) return;
    setOpen(true);
    setLoading(true);
    setAnswer("");
    try {
      await streamInto("/api/ai/explain", { lessonId, selection: anchor.text }, (chunk) =>
        setAnswer((prev) => prev + chunk),
      );
    } catch {
      setAnswer("Couldn't reach the explainer. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, [anchor, lessonId]);

  if (!anchor) return null;

  // Keep the popover on screen near narrow viewport edges.
  const left = Math.min(Math.max(anchor.x, 180), (typeof window !== "undefined" ? window.innerWidth : 1200) - 180);

  return (
    <>
      {!open && (
        <button
          type="button"
          className="explain-chip"
          style={{ left, top: anchor.y - 42 }}
          onClick={explain}
        >
          Explain this
        </button>
      )}

      {open && (
        <div className="explain-panel" style={{ left, top: anchor.y - 12 }} ref={panelRef}>
          <div className="explain-head">
            <span className="explain-quote">&ldquo;{anchor.text.slice(0, 70)}{anchor.text.length > 70 ? "…" : ""}&rdquo;</span>
            <button
              type="button"
              className="ai-close"
              aria-label="Close explanation"
              onClick={() => { setOpen(false); setAnchor(null); }}
            >
              ✕
            </button>
          </div>
          <div className="explain-body">
            {loading && !answer ? (
              <span className="ai-thinking" aria-label="Thinking"><i /><i /><i /></span>
            ) : (
              renderAiMarkdown(answer)
            )}
          </div>
        </div>
      )}
    </>
  );
}
