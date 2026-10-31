"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import AssignLessonsPanel from "./AssignLessonsPanel";
import AssignmentsPanel, { type AssignmentWithCompletion } from "./AssignmentsPanel";
import CohortLaunchPanel from "./CohortLaunchPanel";
import { downloadCsv, toCsv } from "@/lib/csv";
import { useOrigin } from "@/lib/useOrigin";
import CohortScorecard from "./CohortScorecard";
import LeaderToolkit from "./LeaderToolkit";
import AiTutorSwitch from "./AiTutorSwitch";
import ChapterSeasonBoard from "./ChapterSeasonBoard";
import StudentsPanel from "./StudentsPanel";
import { WORKSPACE_TABS, type WorkspaceTab } from "./workspaceTabs";
import type { CohortScorecard as Scorecard } from "@/lib/cohorts/loadScorecard";
import styles from "./scorecard.module.css";

interface RosterEntry {
  studentId: string;
  displayName: string;
  tracksCompleted: number;
  lessonsCompleted: number;
  lastActivityDate: string | null;
}

type LoadState = "loading" | "ready" | "not-found";

interface ClassSummary {
  id: string;
  name: string;
  templateId: string | null;
  startsOn: string | null;
  timezone: string | null;
  launchedAt: string | null;
  skipWeeks?: string[];
  joinCode?: string;
  aiTutorEnabled?: boolean;
}

/** The link students open to join. Readable text first; copying is a bonus. */
function InviteLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${useOrigin()}/join/${code}`;
  return (
    <div className="class-invite">
      <span className="class-invite-label">Invite link</span>
      <code className="class-invite-url">{url}</code>
      <button
        type="button"
        className="v2-btn ghost sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          } catch {
            // Clipboard blocked (e.g. school-managed browser): the link is still on screen.
          }
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <span className="sl-visually-hidden" role="status">{copied ? "Invite link copied" : ""}</span>
    </div>
  );
}

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

/**
 * The class workspace: Overview (outcomes and who needs help), Students
 * (each one's work), Plan (schedule, meeting plans, assignments) and
 * Settings (invite, AI tutor, exports). The tab comes from ?tab= so each
 * section has a link a leader can bookmark.
 */
export default function ClassRosterClient({
  season,
  tab,
}: {
  season: { id: string; title: string } | null;
  tab: WorkspaceTab;
}) {
  const { user, loading } = useAuth();
  const params = useParams<{ id: string }>();
  const classId = params.id;

  const [state, setState] = useState<LoadState>("loading");
  const [className, setClassName] = useState("");
  const [classSummary, setClassSummary] = useState<ClassSummary | null>(null);
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithCompletion[]>([]);
  const [totals, setTotals] = useState({ tracks: 0, lessons: 0 });
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/classes/${classId}/roster`);
      if (!res.ok) {
        setState("not-found");
        return;
      }
      const data = await res.json();
      setClassName(data.class?.name ?? "");
      setClassSummary(data.class ?? null);
      setRoster(data.roster ?? []);
      setAssignments(data.assignments ?? []);
      setTotals(data.totals ?? { tracks: 0, lessons: 0 });
      setScorecard(data.scorecard ?? null);
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
    const header = [
      "Name",
      "Tracks completed",
      `of ${totals.tracks}`,
      "Lessons completed",
      `of ${totals.lessons}`,
      "Last active",
      ...assignments.map((a) => `Assigned: ${a.lessonTitle}`),
    ];
    const rows = roster.map((r) => [
      r.displayName,
      String(r.tracksCompleted),
      String(totals.tracks),
      String(r.lessonsCompleted),
      String(totals.lessons),
      r.lastActivityDate ?? "Never",
      ...assignments.map((a) => (a.completedStudentIds.includes(r.studentId) ? "Done" : "Not yet")),
    ]);
    downloadCsv(`${className || "class"}-roster.csv`, toCsv([header, ...rows]));
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
        <Link href="/teach" className="v2-btn ghost">Back to your classes</Link>
      </div>
    );
  }

  const ready = state === "ready";
  const metrics = scorecard?.measurable ? scorecard.metrics : null;
  const launched = !!classSummary?.templateId && !!classSummary?.startsOn;
  const helpCount = metrics?.students.filter((s) => s.needsHelp).length ?? 0;
  const status = metrics?.status;
  const statusText = !status
    ? null
    : status.kind === "week"
      ? `Week ${status.week} of ${metrics.weeks.length}`
      : status.kind === "break"
        ? "Break week"
        : status.kind === "before"
          ? "Starts soon"
          : "Program finished";

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm mb-1" style={{ color: "var(--muted2)" }}>
            <Link href="/teach">Your classes</Link>
          </p>
          <h1
            className="text-3xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            {ready ? className : "Loading…"}
          </h1>
          <p className="text-sm" style={{ color: "var(--muted2)" }}>
            {roster.length} student{roster.length === 1 ? "" : "s"}
            {statusText && ` · ${statusText}`}
          </p>
        </div>
      </div>

      <nav className={styles.tabs} aria-label="Class workspace">
        {WORKSPACE_TABS.map((t) => (
          <Link
            key={t.id}
            href={`/dashboard/class/${classId}${t.id === "overview" ? "" : `?tab=${t.id}`}`}
            className={styles.tab}
            aria-current={tab === t.id ? "page" : undefined}
            scroll={false}
          >
            {t.label}
            {t.id === "students" && helpCount > 0 && (
              <span className={styles.tabBadge}>
                {helpCount}
                <span className="sl-visually-hidden"> need a nudge</span>
              </span>
            )}
          </Link>
        ))}
      </nav>

      {!ready ? (
        <p className="text-sm" style={{ color: "var(--muted2)" }}>Loading your class…</p>
      ) : tab === "overview" ? (
        <div className={styles.stack}>
          {!launched && classSummary && (
            <CohortLaunchPanel classId={classId} cohort={classSummary} onLaunched={load} />
          )}
          {roster.length === 0 && classSummary?.joinCode && (
            <section className={styles.card} aria-labelledby="invite-title">
              <h2 id="invite-title" className={styles.title}>Invite your students</h2>
              <p className={styles.note}>Nobody has joined yet. Send this link; students make a free account and land in your class.</p>
              <InviteLink code={classSummary.joinCode} />
            </section>
          )}
          {scorecard && (
            <CohortScorecard
              scorecard={scorecard}
              className={className}
              classId={classId}
              studentHrefPrefix={`/dashboard/class/${classId}/student/`}
            />
          )}
          {season && <ChapterSeasonBoard classId={classId} season={season} />}
          {launched && !scorecard && (
            <p className={styles.note}>Outcomes appear here once students join and start the assigned lessons.</p>
          )}
        </div>
      ) : tab === "students" ? (
        <StudentsPanel
          classId={classId}
          roster={roster}
          students={metrics?.students ?? null}
          totalLessons={totals.lessons}
        />
      ) : tab === "plan" ? (
        <div className={styles.stack}>
          {classSummary && <CohortLaunchPanel classId={classId} cohort={classSummary} onLaunched={load} />}
          {metrics && <LeaderToolkit classId={classId} metrics={metrics} assignments={assignments} />}
          <AssignLessonsPanel
            classId={classId}
            assignedLessonIds={assignments.map((a) => a.lessonId)}
            onAssigned={load}
          />
          {assignments.length > 0 && (
            <AssignmentsPanel
              classId={classId}
              assignments={assignments}
              roster={roster.map((r) => ({ studentId: r.studentId, displayName: r.displayName }))}
              onDeleted={load}
            />
          )}
        </div>
      ) : (
        <div className={styles.stack}>
          <section className={styles.card} aria-labelledby="settings-invite-title">
            <h2 id="settings-invite-title" className={styles.title}>Invite link</h2>
            <p className={styles.note}>Anyone with this link can join your class after making a free account.</p>
            {classSummary?.joinCode && <InviteLink code={classSummary.joinCode} />}
            <p className={styles.note}>
              <Link href={`/teach/${classId}/invite`}>Printable invite and kickoff view →</Link>
            </p>
          </section>
          {classSummary && <AiTutorSwitch classId={classId} initial={classSummary.aiTutorEnabled === true} />}
          <section className={styles.card} aria-labelledby="settings-export-title">
            <h2 id="settings-export-title" className={styles.title}>Export</h2>
            <p className={styles.note}>
              A roster with lifetime progress and each assignment&rsquo;s status. Cohort outcome exports live on the Overview scorecard.
            </p>
            <div className={styles.exportActions}>
              <button type="button" onClick={exportCsv} className="v2-btn ghost sm" disabled={roster.length === 0}>
                Export roster CSV →
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
