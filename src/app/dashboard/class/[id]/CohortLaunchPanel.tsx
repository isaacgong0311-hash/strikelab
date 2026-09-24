"use client";

import Link from "next/link";
import { useState } from "react";
import { QUANT_FOUNDATIONS_TEMPLATE } from "@/lib/cohorts/template";
import { TIMEZONES, endDate, postLaunch, readableDate } from "@/lib/cohorts/launch";
import BreakWeeksPicker from "@/components/cohort/BreakWeeksPicker";

interface CohortClass {
  templateId: string | null;
  startsOn: string | null;
  timezone: string | null;
  skipWeeks?: string[];
}

interface Props {
  classId: string;
  cohort: CohortClass;
  onLaunched: () => void;
}

function ActiveCohort({ classId, cohort, onLaunched }: Props & { cohort: CohortClass & { startsOn: string } }) {
  const [skipWeeks, setSkipWeeks] = useState(cohort.skipWeeks ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saved = cohort.skipWeeks ?? [];
  const end = endDate(cohort.startsOn, saved);
  const changed = skipWeeks.join() !== saved.join();

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await postLaunch(classId, {
        startsOn: cohort.startsOn,
        timezone: cohort.timezone ?? "America/Chicago",
        skipWeeks,
      });
      onLaunched();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save break weeks");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="cohort-launch cohort-launch-active" aria-labelledby="cohort-title">
      <div>
        <span className="cohort-kicker">Pilot cohort</span>
        <h2 id="cohort-title">{QUANT_FOUNDATIONS_TEMPLATE.name}</h2>
        <p>
          Six weeks, {readableDate(cohort.startsOn)}
          {end ? ` to ${readableDate(end)}` : ""}
          {cohort.timezone ? ` · ${cohort.timezone.replace("_", " ")}` : ""}
        </p>
        {saved.length > 0 && (
          <p>Breaks: {saved.map((d) => `week of ${readableDate(d, false)}`).join(", ")}</p>
        )}
        <Link href={`/cohort/${classId}`} className="cohort-preview-link">Preview what students see →</Link>
        <details className="cohort-breaks-edit">
          <summary>Change break weeks</summary>
          <BreakWeeksPicker startsOn={cohort.startsOn} value={skipWeeks} onChange={setSkipWeeks} />
          {error && <p className="cohort-launch-error" role="alert">{error}</p>}
          <button type="button" className="v2-btn sm" disabled={!changed || saving} onClick={save}>
            {saving ? "Saving…" : "Save and update due dates"}
          </button>
        </details>
      </div>
      <span className="cohort-live-badge">Live</span>
    </section>
  );
}

export default function CohortLaunchPanel({ classId, cohort, onLaunched }: Props) {
  const [startsOn, setStartsOn] = useState("");
  const [timezone, setTimezone] = useState("America/Chicago");
  const [skipWeeks, setSkipWeeks] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cohort.templateId && cohort.startsOn) {
    return <ActiveCohort classId={classId} cohort={{ ...cohort, startsOn: cohort.startsOn }} onLaunched={onLaunched} />;
  }

  const end = startsOn ? endDate(startsOn, skipWeeks) : null;

  async function launch(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await postLaunch(classId, { startsOn, timezone, skipWeeks });
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
            onChange={(event) => {
              setStartsOn(event.target.value);
              // Break weeks are tied to the meeting day, so a new start clears them.
              setSkipWeeks([]);
            }}
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
        {startsOn && <BreakWeeksPicker startsOn={startsOn} value={skipWeeks} onChange={setSkipWeeks} />}
        {end && <p className="cohort-launch-end">Last week ends {readableDate(end)}</p>}
        {error && <p className="cohort-launch-error" role="alert">{error}</p>}
        <button type="submit" disabled={submitting} className="v2-btn">
          {submitting ? "Launching…" : "Launch pilot cohort →"}
        </button>
        <small>Creates the full schedule. You can still add individual lessons afterward.</small>
      </form>
    </section>
  );
}
