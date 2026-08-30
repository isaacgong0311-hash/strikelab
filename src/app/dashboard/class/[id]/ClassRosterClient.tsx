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

  const avgProgressPct = roster.length && totals.lessons
    ? Math.round(
        (roster.reduce((sum, r) => sum + r.lessonsCompleted, 0) / (roster.length * totals.lessons)) * 100
      )
    : 0;
  const activeThisWeek = roster.filter((r) => {
    if (!r.lastActivityDate) return false;
    const days = (Date.now() - new Date(r.lastActivityDate).getTime()) / 86_400_000;
    return days <= 7;
  }).length;

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
    <div className="max-w-4xl mx-auto px-6 py-14">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
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
        <>
          <div className="roster-metrics">
            <div className="db-metric">
              <div className="db-metric-icon" style={{ background: "var(--grass-tint)", color: "var(--grass)" }}>◉</div>
              <div className="db-metric-v" style={{ color: "var(--grass)" }}>{roster.length}</div>
              <div className="db-metric-l">Students</div>
            </div>
            <div className="db-metric">
              <div className="db-metric-icon" style={{ background: "rgba(251,191,36,0.12)", color: "var(--amber)" }}>◆</div>
              <div className="db-metric-v" style={{ color: "var(--amber)" }}>{avgProgressPct}%</div>
              <div className="db-metric-l">Avg. progress</div>
            </div>
            <div className="db-metric">
              <div className="db-metric-icon" style={{ background: "var(--coral-tint)", color: "var(--coral)" }}>△</div>
              <div className="db-metric-v" style={{ color: "var(--coral)" }}>{activeThisWeek}</div>
              <div className="db-metric-l">Active this week</div>
            </div>
          </div>

          <div className="db-panel">
            <div className="roster-head-row">
              <span>Student</span>
              <span>Tracks</span>
              <span>Lessons</span>
              <span>Last active</span>
            </div>
            <div className="flex flex-col">
              {roster.map((r) => {
                const initials = r.displayName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w) => w[0]?.toUpperCase())
                  .join("") || "?";
                const trackPct = totals.tracks ? Math.round((r.tracksCompleted / totals.tracks) * 100) : 0;
                const lessonPct = totals.lessons ? Math.round((r.lessonsCompleted / totals.lessons) * 100) : 0;
                return (
                  <div key={r.studentId} className="roster-row">
                    <div className="roster-name">
                      <span className="roster-avatar">{initials}</span>
                      <span className="roster-name-text">{r.displayName}</span>
                    </div>
                    <div className="roster-progress-cell">
                      <span className="roster-cell-label">Tracks</span>
                      <div className="db-mini-bar"><div className="db-mini-bar-fill" style={{ width: `${trackPct}%`, background: "var(--grass)" }} /></div>
                      <span className="roster-stat">{r.tracksCompleted}/{totals.tracks}</span>
                    </div>
                    <div className="roster-progress-cell">
                      <span className="roster-cell-label">Lessons</span>
                      <div className="db-mini-bar"><div className="db-mini-bar-fill" style={{ width: `${lessonPct}%` }} /></div>
                      <span className="roster-stat">{r.lessonsCompleted}/{totals.lessons}</span>
                    </div>
                    <span className="roster-activity">
                      {r.lastActivityDate ? `Last active ${r.lastActivityDate}` : "No activity yet"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
