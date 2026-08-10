import type { CSSProperties } from "react";

/**
 * Decorative line-art scenery for the learning path (/lessons) — the
 * Duolingo-style "stuff growing beside the trail" touch. Same stroke
 * language as TrophyIcon/ConstructionIcon (24x24, currentColor, 1.75
 * stroke) so it reads as part of this app's icon set instead of clip-art
 * dropped in from somewhere else.
 *
 * Purely decorative: aria-hidden, pointer-events none, and hidden below
 * ~900px in CSS since the path itself is only ~660px wide and there's
 * nowhere for these to go without colliding with it on tablet/mobile.
 */

type SceneryKind = "pine" | "bush" | "sprout" | "rock";

function Pine({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 6 11h3l-4 6h5v4" />
      <path d="M12 3l6 8h-3l4 6h-5" />
      <path d="M12 21v-4" />
    </svg>
  );
}

function Bush({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 18a3.5 3.5 0 0 1 1.2-6.8A4 4 0 0 1 12 8a4 4 0 0 1 6.8 3.2A3.5 3.5 0 0 1 20 18Z" />
      <path d="M4 18h16" />
    </svg>
  );
}

function Sprout({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20v-8" />
      <path d="M12 12C12 8 9 6 6 6c0 3.5 2.5 6 6 6Z" />
      <path d="M12 9c0-2.5 2-4 4.5-4C16.5 7.5 14.5 9 12 9Z" />
    </svg>
  );
}

function Rock({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 18c0-2 1.5-3 3-4.5S8.5 9 12 9s5 2 7 4.5 2 4.5 2 4.5Z" />
      <path d="M7 18c.5-2 2-3.5 4-3.5" />
    </svg>
  );
}

const KIND: Record<SceneryKind, (p: { size: number }) => React.JSX.Element> = {
  pine: Pine, bush: Bush, sprout: Sprout, rock: Rock,
};

/**
 * Deterministic pick, not random — same node always gets the same prop on
 * every render/hydration. Cycles pine/bush/sprout/rock with rock deliberately
 * rarer (every 4th slot only) so it reads as scattered, not a repeating tile.
 */
export function sceneryForIndex(i: number): SceneryKind | null {
  const cycle: (SceneryKind | null)[] = ["pine", null, "bush", "sprout", null, "pine", "rock", "bush"];
  return cycle[i % cycle.length];
}

export default function PathScenery({
  kind,
  side,
  color,
  size = 34,
}: {
  kind: SceneryKind;
  side: "left" | "right";
  color: string;
  size?: number;
}) {
  const Icon = KIND[kind];
  const style: CSSProperties = {
    position: "absolute",
    top: "6px",
    [side]: "calc(100% + 26px)",
    color,
    opacity: 0.55,
    pointerEvents: "none",
  };
  return (
    <div className="dpath-scenery" style={style}>
      <Icon size={size} />
    </div>
  );
}
