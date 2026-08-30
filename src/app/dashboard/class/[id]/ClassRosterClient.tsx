"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

interface RosterEntry {
  studentId: string;
  displayName: string;
  tracksCompleted: number;
  lessonsCompleted: number;
  lastActivityDate: string | null;
}

type LoadState = "loading" | "ready" | "not-found";

function SignInPrompt() {
  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <h1
        className="text-2xl font-semibold mb-3"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        Sign in to view this class
      </h1>
      <Link href="/sign-in" className="v2-btn">Sign in →</Link>
    </div>
  );
}

export default function ClassRosterClient() {
  const { user, loading } = useAuth();
  const params = useParams<{ id: string }>();
  const classId = params.id;

  const [state, setState] = useState<LoadState>("loading");
  const [className, setClassName] = useState("");
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [totals, setTotals] = useState({ tracks: 0, lessons: 0 });

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/classes/${classId}/roster`);
      if (!res.ok) {
        setState("not-found");
        return;
      }
      const data = await res.json();
      setClassName(data.class?.name ?? "");
      setRoster(data.roster ?? []);
      setTotals(data.totals ?? { tracks: 0, lessons: 0 });
      setState("ready");
    } catch {
      setState("not-found");
    }
  }, [classId]);

  useEffect(() => {
    if (!user) return;
    const id = window.setTimeout(() => { load(); }, 0);
    return () => window.clearTimeout(id);
  }, [user, load]);

  function exportCsv() {
    const header = ["Name", "Tracks completed", `of ${totals.tracks}`, "Lessons completed", `of ${totals.lessons}`, "Last active"];
    const rows = roster.map((r) => [
      r.displayName,
      String(r.tracksCompleted),
      String(totals.tracks),
      String(r.lessonsCompleted),
      String(totals.lessons),
      r.lastActivityDate ?? "Never",
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${className || "class"}-roster.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return null;
  if (!user) return <SignInPrompt />;

  if (state === "not-found") {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1
          className="text-2xl font-semibold mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          Class not found
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--muted2)" }}>
          Either this class doesn&rsquo;t exist, or it isn&rsquo;t yours.
        </p>
        <Link href="/settings" className="v2-btn ghost">Back to Settings</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-3xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            {state === "loading" ? "Loading…" : className}
          </h1>
          <p className="text-sm" style={{ color: "var(--muted2)" }}>
            {roster.length} student{roster.length === 1 ? "" : "s"}
          </p>
        </div>
        {roster.length > 0 && (
          <button type="button" onClick={exportCsv} className="v2-btn ghost sm">
            Export CSV →
          </button>
        )}
      </div>

      {state === "ready" && roster.length === 0 && (
        <p className="text-sm" style={{ color: "var(--muted2)" }}>
          No students yet — share the join code from Settings.
        </p>
      )}

      {roster.length > 0 && (
        <div className="db-panel">
          <div className="flex flex-col gap-1">
            {roster.map((r) => (
              <div
                key={r.studentId}
                className="flex items-center gap-4 flex-wrap py-2 text-sm"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <span style={{ flex: "1 1 160px", color: "var(--ink)", fontWeight: 600 }}>
                  {r.displayName}
                </span>
                <span style={{ color: "var(--muted2)" }}>
                  {r.tracksCompleted}/{totals.tracks} tracks
                </span>
                <span style={{ color: "var(--muted2)" }}>
                  {r.lessonsCompleted}/{totals.lessons} lessons
                </span>
                <span style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  {r.lastActivityDate ? `Last active ${r.lastActivityDate}` : "No activity yet"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
