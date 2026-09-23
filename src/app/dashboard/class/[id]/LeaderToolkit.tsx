"use client";

import { useState } from "react";
import { QUANT_FOUNDATIONS_TEMPLATE } from "@/lib/cohorts/template";
import { FACILITATOR_WEEKS, MEETING_SHAPE, nudgeMessage, weeklyMessage } from "@/lib/cohorts/facilitator";
import type { CohortMetrics } from "@/lib/cohorts/metrics";
import { useOrigin } from "@/lib/useOrigin";
import styles from "./scorecard.module.css";

interface AssignmentLite {
  lessonTitle: string;
  weekNumber: number | null;
  position: number | null;
}

function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={styles.copyBlock}>
      <div className={styles.copyHead}>
        <span className={styles.tileLabel}>{label}</span>
        <button
          type="button"
          className="v2-btn ghost sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            } catch {
              // Clipboard blocked: the text is selectable below.
            }
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className={styles.copyText}>{text}</pre>
      <span className="sl-visually-hidden" role="status">{copied ? `${label} copied` : ""}</span>
    </div>
  );
}

/**
 * This week's meeting plan and ready-to-send messages for the leader, so a
 * pilot runs without the founder in the room. Messages carry no student
 * contact details; the leader sends them through their own channel.
 */
export default function LeaderToolkit({
  classId,
  metrics,
  assignments,
}: {
  classId: string;
  metrics: CohortMetrics;
  assignments: AssignmentLite[];
}) {
  const origin = useOrigin();
  if (metrics.status.kind === "after") return null;
  const week =
    metrics.status.kind === "week"
      ? metrics.status.week
      : metrics.status.kind === "before"
        ? 1
        : (metrics.weeks.find((w) => !w.started)?.week ?? metrics.weeks.length);
  const weekWindow = metrics.weeks[week - 1];
  const guide = FACILITATOR_WEEKS[week - 1];
  const title = QUANT_FOUNDATIONS_TEMPLATE.weeks[week - 1]?.title ?? `Week ${week}`;
  const lessons = assignments
    .filter((a) => a.weekNumber === week)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((a) => a.lessonTitle);
  const cohortUrl = `${origin}/cohort/${classId}`;
  const behind = metrics.students.filter((s) => s.needsHelp);

  return (
    <section className={styles.card} aria-labelledby="toolkit-title">
      <div>
        <h2 id="toolkit-title" className={styles.title}>
          {metrics.status.kind === "week" ? "This week" : "Next up"}: week {week}, {title}
        </h2>
        <p className={styles.note}>From the facilitator guide. Meet once, 45–60 minutes.</p>
      </div>

      <div className={styles.toolkitGrid}>
        <div>
          <h3 className={styles.helpTitle}>Goal</h3>
          <p className={styles.body}>{guide.objective}</p>
          <h3 className={styles.helpTitle}>Meeting</h3>
          <ol className={styles.bodyList}>{MEETING_SHAPE.map((m) => <li key={m}>{m}</li>)}</ol>
        </div>
        <div>
          <h3 className={styles.helpTitle}>Discussion prompts</h3>
          <ul className={styles.bodyList}>{guide.prompts.map((p) => <li key={p}>{p}</li>)}</ul>
          <h3 className={styles.helpTitle}>Watch for</h3>
          <ul className={styles.bodyList}>{guide.watchFor.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      </div>

      <CopyBlock
        label="Message to the class"
        text={weeklyMessage({ week, weekTitle: title, lessonTitles: lessons, dueOn: weekWindow.endsOn, cohortUrl })}
      />
      {behind.length > 0 && (
        <CopyBlock
          label={`Nudge for ${behind.length === 1 ? behind[0].displayName : `${behind.length} students who are behind`}`}
          text={nudgeMessage({ firstName: behind.length === 1 ? behind[0].displayName.split(" ")[0] : "", cohortUrl })}
        />
      )}
    </section>
  );
}
