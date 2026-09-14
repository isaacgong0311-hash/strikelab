"use client";

import { useState } from "react";
import { QUANT_FOUNDATIONS_TEMPLATE } from "@/lib/cohorts/template";

interface CohortClass {
  templateId: string | null;
  startsOn: string | null;
  timezone: string | null;
}

interface Props {
  classId: string;
  cohort: CohortClass;
  onLaunched: () => void;
}

const TIMEZONES = [
  "America/Chicago",
  "America/New_York",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
];

function readableDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

export default function CohortLaunchPanel({ classId, cohort, onLaunched }: Props) {
  const [startsOn, setStartsOn] = useState("");
  const [timezone, setTimezone] = useState("America/Chicago");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cohort.templateId && cohort.startsOn) {
    return (
      <section className="cohort-launch cohort-launch-active" aria-labelledby="cohort-title">
        <div>
          <span className="cohort-kicker">Pilot cohort</span>
          <h2 id="cohort-title">{QUANT_FOUNDATIONS_TEMPLATE.name}</h2>
          <p>
            Six weeks starting {readableDate(cohort.startsOn)}
            {cohort.timezone ? ` · ${cohort.timezone.replace("_", " ")}` : ""}
          </p>
        </div>
        <span className="cohort-live-badge">Live</span>
      </section>
    );
  }

  async function launch(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/classes/${classId}/launch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startsOn, timezone }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "Failed to launch cohort");
      onLaunched();
    } catch (launchError) {
      setError(launchError instanceof Error ? launchError.message : "Failed to launch cohort");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="cohort-launch" aria-labelledby="cohort-title">
      <div className="cohort-launch-copy">
        <span className="cohort-kicker">Ready-to-run pilot</span>
        <h2 id="cohort-title">Launch the {QUANT_FOUNDATIONS_TEMPLATE.name}</h2>
        <p>{QUANT_FOUNDATIONS_TEMPLATE.description}</p>
        <ol className="cohort-week-grid">
          {QUANT_FOUNDATIONS_TEMPLATE.weeks.map((week) => (
            <li key={week.week}>
              <span>Week {week.week}</span>
              <strong>{week.title}</strong>
              <small>{week.lessonIds.length} lesson{week.lessonIds.length === 1 ? "" : "s"}</small>
            </li>
          ))}
        </ol>
      </div>

      <form onSubmit={launch} className="cohort-launch-form">
        <label>
          <span>First meeting</span>
          <input
            type="date"
            required
            value={startsOn}
            onChange={(event) => setStartsOn(event.target.value)}
          />
        </label>
        <label>
          <span>Timezone</span>
          <select value={timezone} onChange={(event) => setTimezone(event.target.value)}>
            {TIMEZONES.map((zone) => (
              <option key={zone} value={zone}>{zone.replace("_", " ")}</option>
            ))}
          </select>
        </label>
        {error && <p className="cohort-launch-error" role="alert">{error}</p>}
        <button type="submit" disabled={submitting} className="v2-btn">
          {submitting ? "Launching…" : "Launch pilot cohort →"}
        </button>
        <small>Creates the full schedule. You can still add individual lessons afterward.</small>
      </form>
    </section>
  );
}
