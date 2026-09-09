"use client";
import { useState, useCallback } from "react";
import { TRACKS } from "@/lib/tracks";

export interface AssignmentSummary {
  id: string;
  lessonId: string;
  lessonTitle: string;
  trackTitle: string;
  createdAt: string;
}

interface Props {
  classId: string;
  /** Lesson ids already assigned, so the picker can show them checked+disabled without a second fetch. */
  assignedLessonIds: string[];
  onAssigned: () => void;
}

/**
 * Collapsible lesson picker for assigning lessons to a class. Kept as its
 * own component rather than folded into ClassRosterClient.tsx — that file
 * already handles fetch/CSV/metrics/roster-table concerns, and a full
 * 3-track lesson picker would roughly double it while mixing two different
 * jobs (viewing progress vs. authoring assignments).
 */
export default function AssignLessonsPanel({ classId, assignedLessonIds, onAssigned }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignedSet = new Set(assignedLessonIds);

  const toggle = useCallback((lessonId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  }, []);

  function close() {
    setOpen(false);
    setSelected(new Set());
    setError(null);
  }

  async function submit() {
    if (selected.size === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/classes/${classId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonIds: Array.from(selected) }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed to assign lessons");
        return;
      }
      close();
      onAssigned();
    } catch {
      setError("Failed to assign lessons");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="v2-btn ghost sm">
        + Assign lessons
      </button>
    );
  }

  return (
    <div className="db-panel assign-panel">
      <div className="db-panel-head">
        <span className="db-panel-title">Assign lessons</span>
        <button type="button" onClick={close} className="v2-btn text sm">
          Cancel
        </button>
      </div>

      {error && <p className="assign-error">{error}</p>}

      <div className="assign-tracks">
        {TRACKS.map((track) => (
          <div key={track.id} className="assign-track">
            <div className="assign-track-title">{track.title}</div>
            <div className="assign-lesson-list">
              {track.lessons.map((lesson) => {
                const alreadyAssigned = assignedSet.has(lesson.id);
                return (
                  <label key={lesson.id} className="assign-lesson-row">
                    <input
                      type="checkbox"
                      checked={alreadyAssigned || selected.has(lesson.id)}
                      disabled={alreadyAssigned}
                      onChange={() => toggle(lesson.id)}
                    />
                    <span>{lesson.title}</span>
                    {alreadyAssigned && <span className="assign-lesson-tag">Assigned</span>}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={selected.size === 0 || submitting}
        className="v2-btn sm"
      >
        {submitting ? "Assigning…" : `Assign ${selected.size || ""} lesson${selected.size === 1 ? "" : "s"}`}
      </button>
    </div>
  );
}
