// Support hours per cohort (YC plan Y4.3, mega plan §3: "support hours per
// cohort", lower is better). Pure functions; scripts/metrics/support.mjs is
// the CLI. Inputs are docs/gtm/cohorts.csv and docs/gtm/support-log.csv.
//
// cohorts.csv   cohort, leader_org, run_by (founder | leader | mixed), start_date, notes
// support-log.csv   date, cohort, minutes, reason  (one row per time you spent unblocking a cohort)

export const RUN_BY = new Set(["founder", "leader", "mixed"]);

/**
 * @param cohorts parsed cohorts.csv rows
 * @param log parsed support-log.csv rows
 * @returns one row per cohort plus a `problems` list for rows that don't parse
 */
export function summarizeSupport(cohorts, log) {
  const problems = [];
  const byCohort = new Map();
  for (const c of cohorts) {
    if (!c.cohort) continue;
    if (!RUN_BY.has(c.run_by)) problems.push(`cohorts.csv: "${c.cohort}" has run_by "${c.run_by}" (use founder, leader or mixed)`);
    byCohort.set(c.cohort, { cohort: c.cohort, runBy: c.run_by, minutes: 0, entries: 0 });
  }
  for (const r of log) {
    if (!r.cohort && !r.minutes) continue;
    const minutes = Number(r.minutes);
    if (!Number.isFinite(minutes) || minutes < 0) {
      problems.push(`support-log.csv: "${r.date}" ${r.cohort} has minutes "${r.minutes}"`);
      continue;
    }
    const row = byCohort.get(r.cohort);
    if (!row) {
      problems.push(`support-log.csv: "${r.cohort}" is not in cohorts.csv`);
      continue;
    }
    row.minutes += minutes;
    row.entries += 1;
  }
  const rows = [...byCohort.values()].map((r) => ({ ...r, hours: Math.round((r.minutes / 60) * 10) / 10 }));
  return { rows, problems };
}

export function formatSupport({ rows, problems }) {
  const lines = ["| Cohort | Run by | Support hours | Log entries |", "|---|---|---|---|"];
  for (const r of rows) lines.push(`| ${r.cohort} | ${r.runBy} | ${r.hours} | ${r.entries} |`);
  if (!rows.length) lines.push("| (no cohorts yet) | | | |");
  const total = rows.reduce((n, r) => n + r.minutes, 0);
  if (rows.length) lines.push("", `Average per cohort: ${Math.round((total / rows.length / 60) * 10) / 10} h (target: falling each cohort, under 2 h by Sep 2027).`);
  for (const p of problems) lines.push(`PROBLEM: ${p}`);
  return lines.join("\n");
}
