import Link from "next/link";
import styles from "@/components/marketing/marketing.module.css";
import { buildDemoData, demoStartsOn } from "@/lib/demo/fixtures";
import { inviteMessage } from "@/lib/cohorts/facilitator";

/**
 * What a leader gets, shown before they are asked for an account. Everything
 * here is computed from the same sample club the /demo page uses and is
 * labelled as example data; no student on this page is real.
 */
export default function PilotPreview() {
  const { metrics } = buildDemoData();
  const needHelp = metrics.students.filter((s) => s.needsHelp).slice(0, 3);
  const message = inviteMessage({ className: "Demo Club", startsOn: demoStartsOn(), joinUrl: "https://strikelab.dev/join/ABC234" });

  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="pilot-preview">
      <div className={styles.wrap}>
        <h2 id="pilot-preview" className={styles.h2}>What you&apos;ll see, before you sign up for anything</h2>
        <p className={styles.note}>
          Example data from a pretend club. No student on this page is real.{" "}
          <Link href="/demo" className={styles.textLink}>See the full teacher view</Link>.
        </p>
        <div className={styles.grid2} style={{ marginTop: "1.5rem" }}>
          <div className={styles.card}>
            <h3 className={styles.h3}>Your scorecard, a couple of weeks in</h3>
            <ul className={styles.checks}>
              <li><strong>{metrics.enrolled}</strong> students joined</li>
              <li><strong>{metrics.activated.count} of {metrics.activated.of}</strong> finished at least one lesson</li>
              <li><strong>{metrics.activeThisWeek ?? 0}</strong> active this week</li>
              <li><strong>{needHelp.length === 0 ? "No one" : `${metrics.students.filter((s) => s.needsHelp).length}`}</strong> {needHelp.length === 0 ? "needs" : "may need"} a nudge</li>
            </ul>
            {needHelp.length > 0 && (
              <>
                <p className={styles.body} style={{ marginTop: "0.75rem", fontWeight: 700 }}>Who, and why:</p>
                <ul className={styles.checks}>
                  {needHelp.map((s) => (
                    <li key={s.studentId}>{s.displayName}: {s.needsHelp}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div className={styles.card}>
            <h3 className={styles.h3}>The message you send before the first meeting</h3>
            <p className={styles.body}>Copy it from your class page, change anything you like, and paste it into your club&apos;s chat or email.</p>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                font: "inherit",
                fontSize: "0.875rem",
                lineHeight: 1.55,
                margin: "0.75rem 0 0",
                padding: "0.875rem 1rem",
                border: "1px solid var(--sl-border)",
                borderRadius: "var(--sl-radius-md)",
                background: "var(--sl-surface)",
              }}
            >
              {message}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
