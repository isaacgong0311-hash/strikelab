"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { QUANT_FOUNDATIONS_TEMPLATE } from "@/lib/cohorts/template";
import { useBrowserTimezone } from "@/lib/cohorts/useBrowserTimezone";
import { defaultTimezone, endDate, postLaunch, readableDate, timezoneChoices } from "@/lib/cohorts/launch";
import BreakWeeksPicker from "@/components/cohort/BreakWeeksPicker";
import Stepper from "../Stepper";
import styles from "../teach.module.css";

/**
 * Screens 1 and 2 of class setup: name the class, then schedule the six
 * weeks. Screen 3 (the invite link and printable card) is a server page so
 * it prints and works without JavaScript.
 */
export default function SetupWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const [klass, setKlass] = useState<{ id: string; name: string } | null>(null);
  const [name, setName] = useState("");
  const [leaderConfirmed, setLeaderConfirmed] = useState(false);
  const [startsOn, setStartsOn] = useState("");
  const detectedZone = useBrowserTimezone();
  const [pickedZone, setPickedZone] = useState<string | null>(null);
  const timezone = pickedZone ?? defaultTimezone(detectedZone);
  const [skipWeeks, setSkipWeeks] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const step = klass ? 2 : 1;

  // Move focus to the new screen's heading so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (step === 2) headingRef.current?.focus();
  }, [step]);

  async function createClass(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, leaderConfirmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Couldn't create the class");
      setKlass({ id: data.id, name: data.name });
      // Mark the account as a leader so the nav shows "My classes".
      // Also records the "I'm responsible for these students" confirmation.
      if (user?.user_metadata?.signup_role !== "leader" || !user?.user_metadata?.leader_confirmed_at) {
        getSupabaseBrowser()
          ?.auth.updateUser({ data: { signup_role: "leader", leader_confirmed_at: new Date().toISOString() } })
          .catch(() => {});
      }
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Couldn't create the class");
    } finally {
      setBusy(false);
    }
  }

  async function launch(event: React.FormEvent) {
    event.preventDefault();
    if (!klass) return;
    setBusy(true);
    setError(null);
    try {
      await postLaunch(klass.id, { startsOn, timezone, skipWeeks });
      router.push(`/teach/${klass.id}/invite?setup=1`);
    } catch (launchError) {
      setError(launchError instanceof Error ? launchError.message : "Couldn't schedule the six weeks");
      setBusy(false);
    }
  }

  const end = startsOn ? endDate(startsOn, skipWeeks) : null;

  return (
    <>
      <div className={styles.headerText}>
        <p className={styles.kicker}>Set up your class</p>
        <Stepper step={step} />
      </div>

      {step === 1 ? (
        <form className={styles.panel} onSubmit={createClass}>
          <h1 className={styles.title}>What&apos;s your class called?</h1>
          <p className={styles.muted}>
            Students see this name when they join. You&apos;ll run the {QUANT_FOUNDATIONS_TEMPLATE.name}: six weeks,
            one 45–60 minute meeting a week, and StrikeLab gives you the plan for each one.
          </p>
          <label className={styles.field}>
            Class name
            <input
              className={styles.input}
              type="text"
              required
              maxLength={80}
              autoComplete="off"
              placeholder="e.g. Westlake Investment Club"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className={styles.attest}>
            <input
              type="checkbox"
              required
              checked={leaderConfirmed}
              onChange={(e) => setLeaderConfirmed(e.target.checked)}
            />
            <span>I&apos;m a teacher, club advisor or club leader, and I&apos;m responsible for the students who join this class.</span>
          </label>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <div className={styles.actions}>
            <button type="submit" className={styles.primary} disabled={busy}>
              {busy ? "Creating…" : "Next: pick your dates"}
            </button>
          </div>
        </form>
      ) : (
        <form className={styles.panel} onSubmit={launch}>
          <h1 className={styles.title} ref={headingRef} tabIndex={-1}>When is your first meeting?</h1>
          <p className={styles.muted}>
            Each week&apos;s lessons are due on the last day of that week. Skip holidays below, and nothing is due that
            week.
          </p>
          <div className={styles.row}>
            <label className={styles.field}>
              First meeting
              <input
                className={styles.input}
                type="date"
                required
                value={startsOn}
                onChange={(e) => {
                  setStartsOn(e.target.value);
                  // Break weeks are tied to the meeting day, so a new start clears them.
                  setSkipWeeks([]);
                }}
              />
            </label>
            <label className={styles.field}>
              Timezone
              <select className={styles.input} value={timezone} onChange={(e) => setPickedZone(e.target.value)}>
                {timezoneChoices(detectedZone).map((zone) => (
                  <option key={zone} value={zone}>{zone.replace("_", " ")}</option>
                ))}
              </select>
            </label>
          </div>
          {startsOn && <BreakWeeksPicker startsOn={startsOn} value={skipWeeks} onChange={setSkipWeeks} />}
          {end && <p className={styles.endLine}>Six weeks, {readableDate(startsOn)} to {readableDate(end)}</p>}
          {error && <p className={styles.error} role="alert">{error}</p>}
          <div className={styles.actions}>
            <button type="submit" className={styles.primary} disabled={busy}>
              {busy ? "Scheduling…" : "Schedule and get the invite link"}
            </button>
            <button
              type="button"
              className={styles.textButton}
              onClick={() => router.push(`/teach/${klass!.id}/invite?setup=1`)}
            >
              I don&apos;t have a date yet
            </button>
          </div>
        </form>
      )}
    </>
  );
}
