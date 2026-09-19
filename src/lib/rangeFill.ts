import type { CSSProperties } from "react";

/**
 * Inline style for a range input: `--fill` drives the filled part of the
 * track (see the slider rules in src/styles/foundation.css) and
 * `--slider-accent` its colour. Firefox fills natively via ::-moz-range-progress.
 */
export function rangeFill(value: number, min: number, max: number, accent?: string): CSSProperties {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const style: Record<string, string> = { "--fill": `${Math.min(100, Math.max(0, pct))}%` };
  if (accent) style["--slider-accent"] = accent;
  return style as CSSProperties;
}
