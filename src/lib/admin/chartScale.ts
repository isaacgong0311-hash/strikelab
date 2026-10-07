/**
 * Axis helpers for the founder metrics charts: clean, whole-number y ticks
 * (counts of students and capstones) and how often to label the x axis so
 * week labels never collide.
 */

/** Ticks from 0 to a clean maximum >= max, about `target` steps, whole numbers only. */
export function niceTicks(max: number, target = 4): number[] {
  if (!(max > 0)) return [0, 1, 2, 3, 4];
  const rough = max / target;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = Math.max(1, [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? 10 * magnitude);
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(Math.round(v));
  return ticks;
}

/** Label every k-th x position so at most `maxLabels` labels show, always including the last. */
export function xLabelIndexes(count: number, maxLabels: number): Set<number> {
  if (count <= 0) return new Set();
  const every = Math.max(1, Math.ceil(count / Math.max(1, maxLabels)));
  const shown = new Set<number>();
  for (let i = count - 1; i >= 0; i -= every) shown.add(i);
  return shown;
}

/** "2026-10-05" -> "Oct 5". */
export function shortWeek(key: string): string {
  const d = new Date(`${key}T00:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}
