import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { privatePageMetadata } from "@/lib/seo";
import { isFounder } from "@/lib/admin/founder";
import { loadFounderMetrics, type FounderCohortRow } from "@/lib/admin/loadFounderMetrics";
import { shortWeek } from "@/lib/admin/chartScale";
import WeeklyChart from "./WeeklyChart";
import styles from "./metrics.module.css";

export const metadata = privatePageMetadata({
  title: "Founder metrics",
  description: "Every cohort's numbers and the weekly growth series, in one place.",
});

/**
 * Founder-only (mega plan Q10, frontend plan FY-4): every launched cohort's
 * scorecard numbers and the weekly growth series, replacing SQL copy-paste on
 * Mondays. Aggregates only, never names. Anyone who isn't in FOUNDER_USER_IDS
 * gets the ordinary 404, so the page doesn't reveal that it exists.
 */
export default async function FounderMetricsPage() {
  await connection();
  const supabase = await getSupabaseServer();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!isFounder(data.user?.id)) notFound();

  const admin = getSupabaseAdmin();
  if (!admin) {
    return (
      <div className={styles.shell}>
        <h1 className={styles.title}>Founder metrics</h1>
        <p className={styles.muted}>The server has no service-role key, so it can&apos;t read across cohorts.</p>
      </div>
    );
  }

  const { cohorts, growth } = await loadFounderMetrics(admin);
  const latest = growth.at(-1);
  const previous = growth.at(-2);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <p className={styles.kicker}>Founder only</p>
        <h1 className={styles.title}>Founder metrics</h1>
        <p className={styles.muted}>
          Every launched cohort, measured the same way leaders see it, and the weekly series for the scorecard and the YC
          application. Aggregates only. Weeks run Monday to Sunday, UTC.
        </p>
      </header>

      {growth.length === 0 || !latest ? (
        <p className={styles.muted}>No cohort has launched yet. This page fills in once a leader launches one.</p>
      ) : (
        <>
          <dl className={styles.kpis}>
            <div className={`${styles.tile} ${styles.hero}`}>
              <dt>Capstones submitted</dt>
              <dd>{latest.capstonesCum}</dd>
            </div>
            <div className={styles.tile}>
              <dt>Active this week</dt>
              <dd>{latest.activeStudents}</dd>
              {previous ? <span className={styles.delta}>{signed(latest.activeStudents - previous.activeStudents)} vs last week</span> : null}
            </div>
            <div className={styles.tile}>
              <dt>Students enrolled</dt>
              <dd>{latest.enrolledCum}</dd>
            </div>
            <div className={styles.tile}>
              <dt>Cohorts launched</dt>
              <dd>{latest.cohortsLaunched}</dd>
            </div>
          </dl>

          <div className={styles.charts}>
            <WeeklyChart title="Active students per week" unit="active students" kind="columns" points={growth.map((g) => ({ week: g.weekStart, value: g.activeStudents }))} />
            <WeeklyChart title="Capstones submitted, running total" unit="capstones" kind="line" points={growth.map((g) => ({ week: g.weekStart, value: g.capstonesCum }))} />
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption>Week by week</caption>
              <thead>
                <tr>
                  <th scope="col">Week of</th>
                  <th scope="col">Cohorts</th>
                  <th scope="col">Enrolled</th>
                  <th scope="col">Active</th>
                  <th scope="col">Active vs last week</th>
                  <th scope="col">Capstones</th>
                  <th scope="col">Capstones vs last week</th>
                </tr>
              </thead>
              <tbody>
                {growth.map((g) => (
                  <tr key={g.weekStart}>
                    <th scope="row">{shortWeek(g.weekStart)}</th>
                    <td>{g.cohortsLaunched}</td>
                    <td>{g.enrolledCum}</td>
                    <td>{g.activeStudents}</td>
                    <td>{change(g.activeWowPct)}</td>
                    <td>{g.capstonesCum}</td>
                    <td>{change(g.capstonesWowPct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption>Cohorts</caption>
              <thead>
                <tr>
                  <th scope="col">Cohort</th>
                  <th scope="col">Leader source</th>
                  <th scope="col">Starts</th>
                  <th scope="col">Status</th>
                  <th scope="col">Enrolled</th>
                  <th scope="col">Activated</th>
                  <th scope="col">Active this week</th>
                  <th scope="col">Week-4 retained</th>
                  <th scope="col">Capstones</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c) => (
                  <tr key={`${c.name}-${c.startsOn}`}>
                    <th scope="row">{c.name}</th>
                    <td>{c.leaderSource}</td>
                    <td>{c.startsOn}</td>
                    <td>{c.unavailable ?? statusLabel(c.status)}</td>
                    <td>{num(c.enrolled)}</td>
                    <td>{rate(c.activatedPct)}</td>
                    <td>{num(c.activeThisWeek)}</td>
                    <td>{rate(c.week4RetainedPct)}</td>
                    <td>{num(c.capstones)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <section aria-labelledby="elsewhere">
        <h2 id="elsewhere" className={styles.h2}>Not on this page</h2>
        <ul className={styles.notes}>
          <li>The leader funnel by source: run <code>scripts/metrics/leader-funnel.sql</code> in the Supabase SQL editor.</li>
          <li>Pipeline and support hours live in the repo&apos;s CSVs: <code>npm run pipeline</code> and <code>npm run support</code>.</li>
        </ul>
      </section>
    </div>
  );
}

function num(v: number | null): string {
  return v === null ? "—" : String(v);
}

/** A rate, e.g. activation: "62%". */
function rate(v: number | null): string {
  return v === null ? "—" : `${v}%`;
}

/** A week-over-week change: "+12.5%", "-3%"; "—" when last week was zero. */
function change(v: number | null): string {
  return v === null ? "—" : `${v > 0 ? "+" : ""}${v}%`;
}

function signed(v: number): string {
  return v > 0 ? `+${v}` : String(v);
}

function statusLabel(status: FounderCohortRow["status"]): string {
  if (!status) return "—";
  if (status.kind === "week") return `Week ${status.week}`;
  if (status.kind === "before") return "Not started";
  if (status.kind === "after") return "Finished";
  return "Break";
}
