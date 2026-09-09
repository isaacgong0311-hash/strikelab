"use client";
import { useState } from "react";

export interface AssignmentWithCompletion {
  id: string;
  lessonId: string;
  lessonTitle: string;
  trackTitle: string;
  createdAt: string;
  completedStudentIds: string[];
}

interface RosterEntryLite {
  studentId: string;
  displayName: string;
}

interface Props {
  classId: string;
  assignments: AssignmentWithCompletion[];
  roster: RosterEntryLite[];
  onDeleted: () => void;
}

/**
 * Per-assignment completion, one row per lesson (not per student — the
 * existing roster table's 4-column layout is sized for aggregate stats and
 * doesn't scale past 2-3 extra columns). Each row expands to a Done /
 * Not-yet name split rather than adding a column per student.
 */
export default function AssignmentsPanel({ classId, assignments, roster, onDeleted }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (assignments.length === 0) return null;

  async function handleDelete(assignmentId: string) {
    setDeletingId(assignmentId);
    try {
      const res = await fetch(`/api/classes/${classId}/assignments/${assignmentId}`, { method: "DELETE" });
      if (res.ok) onDeleted();
    } finally {
      setDeletingId(null);
      setConfirmingId(null);
    }
  }

  return (
    <div className="db-panel assignments-panel">
      <div className="db-panel-head">
        <span className="db-panel-title">Assignments</span>
      </div>
      <div className="flex flex-col">
        {assignments.map((a) => {
          const total = roster.length;
          const doneCount = a.completedStudentIds.length;
          const pct = total ? Math.round((doneCount / total) * 100) : 0;
          const expanded = expandedId === a.id;
          const done = roster.filter((r) => a.completedStudentIds.includes(r.studentId));
          const notDone = roster.filter((r) => !a.completedStudentIds.includes(r.studentId));

          return (
            <div key={a.id} className="assignment-row-wrap">
              <button
                type="button"
                className="assignment-row"
                onClick={() => setExpandedId(expanded ? null : a.id)}
              >
                <div className="assignment-title">
                  <span className="assignment-lesson-title">{a.lessonTitle}</span>
                  <span className="assignment-track-title">{a.trackTitle}</span>
                </div>
                <div className="db-mini-bar">
                  <div className="db-mini-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="roster-stat">{doneCount}/{total} done</span>
                <span
                  role="button"
                  tabIndex={0}
                  className="assignment-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmingId(a.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      setConfirmingId(a.id);
                    }
                  }}
                >
                  ×
                </span>
              </button>

              {confirmingId === a.id && (
                <div className="assignment-confirm">
                  <span>Delete this assignment?</span>
                  <button
                    type="button"
                    className="v2-btn text sm"
                    onClick={() => handleDelete(a.id)}
                    disabled={deletingId === a.id}
                  >
                    {deletingId === a.id ? "Deleting…" : "Yes, delete"}
                  </button>
                  <button type="button" className="v2-btn text sm" onClick={() => setConfirmingId(null)}>
                    Cancel
                  </button>
                </div>
              )}

              {expanded && (
                <div className="assignment-detail">
                  <div className="assignment-detail-col">
                    <div className="assignment-detail-label">Done ({done.length})</div>
                    {done.map((r) => (
                      <div key={r.studentId} className="assignment-detail-name">{r.displayName}</div>
                    ))}
                  </div>
                  <div className="assignment-detail-col">
                    <div className="assignment-detail-label">Not yet ({notDone.length})</div>
                    {notDone.map((r) => (
                      <div key={r.studentId} className="assignment-detail-name">{r.displayName}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
