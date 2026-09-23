"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  MAX_SKIP_WEEKS,
  QUANT_FOUNDATIONS_TEMPLATE,
  cohortWeekWindows,
  pruneSkipWeeks,
  skipWeekOptions,
} from "@/lib/cohorts/template";

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

const TIMEZONES = [
  "America/Chicago",
  "America/New_York",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
];

function readableDate(value: string, withYear = true): string {
  return new Intl.DateTimeFormat("en-US", {
    month: withYear ? "long" : "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

/** Last day of the program for a start date and break list, or null if either is invalid. */
function endDate(startsOn: string, skipWeeks: string[]): string | null {
  try {
    return cohortWeekWindows(startsOn, skipWeeks).at(-1)?.endsOn ?? null;
  } catch {
    return null;
  }
}

async function postLaunch(classId: string, body: { startsOn: string; timezone: string; skipWeeks: string[] }) {
  const response = await fetch(`/api/classes/${classId}/launch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error ?? "Failed to launch cohort");
}

/**
 * Holiday weeks to skip. Only weeks inside the program are offered, and the
 * list grows as breaks push the end date back.
 */
function BreakWeeksPicker({
  startsOn,
  value,
  onChange,
}: {
  startsOn: string;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const hintId = useId();
  const end = endDate(startsOn, value);
  if (!end) return null;
  const options = skipWeekOptions(startsOn).filter((d) => d <= end || value.includes(d));
  const full = value.length >= MAX_SKIP_WEEKS;

  function toggle(week: string, checked: boolean) {
    onChange(pruneSkipWeeks(startsOn, checked ? [...value, week] : value.filter((d) => d !== week)));
  }

  return (
    <fieldset className="cohort-breaks" aria-describedby={hintId}>
      <legend>Break weeks <em>optional</em></legend>
      <div className="cohort-breaks-options">
        {options.map((week) => {
          const checked = value.includes(week);
          return (
            <label key={week} className="cohort-break-option">
              <input
                type="checkbox"
                checked={checked}
                disabled={!checked && full}
                onChange={(event) => toggle(week, event.target.checked)}
              />
              <span>Week of {readableDate(week, false)}</span>
            </label>
          );
        })}
      </div>
      <small id={hintId}>
        Nothing is due on a break, and it doesn&apos;t count against retention. Up to {MAX_SKIP_WEEKS}.
      </small>
    </fieldset>
  );
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
