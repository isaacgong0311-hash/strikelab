"use client";

import { useEffect, useState } from "react";
import { buttonClassName } from "@/components/ui/Action";
import { markReadiness } from "@/lib/seasons/checklist";
import { countdown, type NextChallenge as Next } from "@/lib/seasons/countdown";
import { browserStorage } from "@/lib/seasons/draft";
import styles from "./seasons.module.css";

/**
 * "Next challenge opens in …" plus the one calendar action. The server renders
 * the countdown text at request time, so it reads correctly with JavaScript
 * off; in the browser it ticks forward every few seconds.
 */
export default function NextChallenge({
  next,
  initial,
  when,
  calendarLabel,
}: {
  next: NonNullable<Next>;
  initial: { compact: string; words: string };
  /** Pre-formatted Eastern time of the opening (or closing) moment. */
  when: string;
  calendarLabel: string;
}) {
  const target = next.kind === "opens" ? next.opensAt : next.closesAt;
  const [text, setText] = useState(initial);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setPassed(now.getTime() >= Date.parse(target));
      setText(countdown(now, target));
    };
    tick();
    const timer = window.setInterval(tick, 5_000);
    return () => window.clearInterval(timer);
  }, [target]);

  const label = next.kind === "opens"
    ? (passed ? `Week ${next.week} is open now. Reload to start.` : "Next challenge opens in")
    : (passed ? `Week ${next.week} has closed.` : `Week ${next.week} is open now · closes in`);

  return (
    <div className={styles.schedule}>
      <div className={styles.next}>
        <p className={styles.nextLabel}>{label}</p>
        {!passed && (
          <p className={styles.nextValue} role="timer" aria-live="off">
            <span aria-hidden="true">{text.compact}</span>
            <span className="sl-visually-hidden">{text.words}</span>
          </p>
        )}
        <p className={styles.nextWhen}>
          {next.kind === "opens" ? `Week ${next.week} opens ${when}` : `Closes ${when}`}
        </p>
      </div>
      <a
        href="/seasons/calendar.ics"
        download
        className={buttonClassName({ variant: "secondary", className: styles.calendarAction })}
        onClick={() => markReadiness(browserStorage(), "calendar")}
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
          <rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        {calendarLabel}
      </a>
    </div>
  );
}
