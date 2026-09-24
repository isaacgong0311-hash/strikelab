"use client";

import { useId } from "react";
import { MAX_SKIP_WEEKS, pruneSkipWeeks, skipWeekOptions } from "@/lib/cohorts/template";
import { endDate, readableDate } from "@/lib/cohorts/launch";

/**
 * Holiday weeks to skip. Only weeks inside the program are offered, and the
 * list grows as breaks push the end date back.
 */
export default function BreakWeeksPicker({
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
