import type { StepKind, StepState } from "@/lib/seasons/path";

/**
 * Icons for the season path. Each challenge gets the shape of the thing it
 * measures (two payoff lines for parity, the call-price curve for
 * Black-Scholes, the S-curve for delta) instead of a generic star.
 */
const CHALLENGE_GLYPHS: Record<string, string[]> = {
  "put-call-parity": ["M5 21 H16 L27 9", "M5 9 L16 21 H27"],
  "black-scholes-call": ["M5 22 H15 L27 10", "M5 21 C13 20.5 18 17 27 8"],
  "call-delta": ["M5 22 C14 22 16 7 27 7", "M5 25 H27"],
};

export default function PathIcon({ kind, state, slug }: { kind: StepKind; state: StepState; slug?: string }) {
  const common = { viewBox: "0 0 32 32", width: 32, height: 32, "aria-hidden": true, focusable: false, fill: "none", stroke: "currentColor", strokeWidth: 2.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (state === "done") return <svg {...common}><path d="M8 16.5 L13.5 22 L24 10" strokeWidth={3.4} /></svg>;
  if (state === "missed") return <svg {...common}><path d="M10 16 H22" strokeWidth={3.4} /></svg>;
  switch (kind) {
    case "warmup":
      return <svg {...common}><circle cx="16" cy="18" r="9" /><path d="M16 18 L19.5 14.5 M13 5.5 H19 M16 5.5 V9" /></svg>;
    case "train":
      return <svg {...common}><path d="M6 8 C10 7 13 7.5 16 10 C19 7.5 22 7 26 8 V24 C22 23 19 23.5 16 26 C13 23.5 10 23 6 24 Z M16 10 V26" /></svg>;
    case "record":
      return <svg {...common}><path d="M16 4 L26 8 V15 C26 21 21.5 25.5 16 28 C10.5 25.5 6 21 6 15 V8 Z" /><path d="M11.5 16 L14.8 19.3 L20.5 13" /></svg>;
    case "challenge": {
      const paths = CHALLENGE_GLYPHS[slug ?? ""] ?? ["M5 22 L13 14 L18 18 L27 8"];
      return <svg {...common}>{paths.map((d) => <path key={d} d={d} />)}</svg>;
    }
  }
}

export function LockBadge() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
      <rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor" />
      <path d="M5.5 7 V5 a2.5 2.5 0 0 1 5 0 V7" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
