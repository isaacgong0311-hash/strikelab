/**
 * Every number StrikeLab shows publicly as proof (outcome strips, quote
 * cards) comes from this file and nowhere else. Empty until real cohorts
 * exist: the site then shows nothing, never a placeholder.
 *
 * Rules, enforced by data.test.ts (the build fails if one is broken):
 *  - `sourcePath` is a file in this repo (a scorecard export, a pilot report,
 *    a signed consent) that backs the number, so anyone can check it;
 *  - `asOf` is the date the number was true;
 *  - `value` is exactly what the source says: never rounded up;
 *  - anything from a named person or a cohort needs `consent: true`.
 *
 * To add one: save the source under docs/gtm/ or docs/proof/, then add an entry.
 */
export interface ProofEntry {
  id: string;
  /** What is shown, e.g. "62%" or "14". */
  value: string;
  /** What it means, e.g. "of enrolled students finished the first lesson". */
  label: string;
  /** Short public source line, e.g. "Fall 2026 pilot, two clubs". */
  sourceLabel: string;
  /** Repo file that backs the number (checked to exist). */
  sourcePath: string;
  /** YYYY-MM-DD the number was true. */
  asOf: string;
  /** True once the leader (and guardians for any student content) consented to public use. */
  consent: boolean;
}

export const PROOF: ProofEntry[] = [];

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Pure checks; returns a list of problems (empty means fine). `exists` lets tests inject the filesystem. */
export function validateProof(entries: ProofEntry[], exists: (path: string) => boolean): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const e of entries) {
    const at = `proof "${e.id}"`;
    if (!e.id || seen.has(e.id)) problems.push(`${at}: id missing or duplicated`);
    seen.add(e.id);
    if (!e.value.trim() || !e.label.trim()) problems.push(`${at}: needs a value and a label`);
    if (!e.sourceLabel.trim()) problems.push(`${at}: needs a public sourceLabel`);
    if (!e.sourcePath.trim() || !exists(e.sourcePath)) problems.push(`${at}: sourcePath "${e.sourcePath}" does not exist`);
    if (!DATE.test(e.asOf) || Number.isNaN(Date.parse(e.asOf))) problems.push(`${at}: asOf must be a real YYYY-MM-DD date`);
    if (!e.consent) problems.push(`${at}: consent must be true before a number is shown publicly`);
  }
  return problems;
}
