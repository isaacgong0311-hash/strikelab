import type { CSSProperties } from "react";

/**
 * Decorative scenery for the learning path (/lessons) — full-color flat
 * illustrations (trees, a bush, a flower, a rock), each built from a few
 * layered shapes with a shadow + highlight pass for a little dimensionality,
 * in the spirit of Duolingo's path decorations. Deliberately its own
 * illustration style rather than the app's line-art icon set (TrophyIcon,
 * ConstructionIcon) — this page is the gamified path, not the marketing
 * site, and it earns a richer, more playful register than the rest of the
 * app does.
 *
 * Purely decorative: aria-hidden, pointer-events none, and hidden below
 * ~940px in CSS since the path itself is only ~660px wide and there's
 * nowhere for these to go without colliding with it on tablet/mobile.
 */

type SceneryKind = "pine" | "roundTree" | "bush" | "flower" | "rock";

function Pine({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <ellipse cx="24" cy="43" rx="10" ry="2.5" fill="#000" opacity="0.08" />
      <rect x="21.5" y="30" width="5" height="11" rx="1.5" fill="#8a5a34" />
      <rect x="21.5" y="30" width="2" height="11" rx="1" fill="#6e4527" />
      <path d="M24 4 12 20h6L9 32h9v3h12v-3h9L30 20h6Z" fill="#2f9e52" />
      <path d="M24 4 9 32h9v-3l-9 .0L24 12Z" fill="#268a46" opacity="0.55" />
      <path d="M24 4 12 20h6l-3 4.5L24 12Z" fill="#4cc274" opacity="0.9" />
    </svg>
  );
}

function RoundTree({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <ellipse cx="24" cy="43" rx="10" ry="2.5" fill="#000" opacity="0.08" />
      <rect x="21.5" y="28" width="5" height="13" rx="1.5" fill="#8a5a34" />
      <rect x="21.5" y="28" width="2" height="13" rx="1" fill="#6e4527" />
      <circle cx="24" cy="18" r="14" fill="#37a35c" />
      <path d="M12 20a14 14 0 0 0 10 13 14 14 0 0 1-10-13Z" fill="#248347" opacity="0.6" />
      <circle cx="18.5" cy="12.5" r="5.5" fill="#57c17c" opacity="0.85" />
    </svg>
  );
}

function Bush({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <ellipse cx="24" cy="38" rx="15" ry="3" fill="#000" opacity="0.08" />
      <circle cx="14" cy="28" r="9" fill="#2f9e52" />
      <circle cx="24" cy="24" r="11" fill="#37a35c" />
      <circle cx="34" cy="28" r="9" fill="#2f9e52" />
      <path d="M9 30a9 9 0 0 0 8 6 9 9 0 0 1-8-6Z" fill="#20803f" opacity="0.6" />
      <circle cx="20" cy="18" r="4.5" fill="#57c17c" opacity="0.85" />
      <circle cx="30" cy="20" r="3.5" fill="#57c17c" opacity="0.7" />
    </svg>
  );
}

function Flower({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <ellipse cx="24" cy="43" rx="6" ry="1.8" fill="#000" opacity="0.08" />
      <path d="M24 40V22" stroke="#3f9a55" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M24 32c-3-1-6 0-7 3 3 1 6 0 7-3Z" fill="#4cc274" />
      <g transform="translate(24 16)">
        <circle cx="0" cy="-7" r="5.2" fill={color} />
        <circle cx="6.6" cy="-3.4" r="5.2" fill={color} />
        <circle cx="6.6" cy="3.4" r="5.2" fill={color} />
        <circle cx="0" cy="7" r="5.2" fill={color} />
        <circle cx="-6.6" cy="3.4" r="5.2" fill={color} />
        <circle cx="-6.6" cy="-3.4" r="5.2" fill={color} />
        <circle cx="0" cy="0" r="4.8" fill="#f6c343" />
      </g>
    </svg>
  );
}

function Rock({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <ellipse cx="24" cy="38" rx="14" ry="2.6" fill="#000" opacity="0.08" />
      <path d="M8 36c-1-6 3-11 8-14s10-4 15-2 9 6 9 12-6 6-16 6-15 4-16-2Z" fill="#a9a196" />
      <path d="M8 36c-.6-3.6.7-7 3-9.6C9 30 8 33 8.6 36Z" fill="#8d857a" opacity="0.7" />
      <path d="M14 21c4-1.7 8-1.6 11 0-3-3-8-3.4-11 0Z" fill="#c2bbad" opacity="0.8" />
    </svg>
  );
}

/** Treasure-chest milestone marker, dropped into the path itself (not
 *  beside it) every few lessons — same filled-illustration language as the
 *  scenery above, chunkier since it's a path element, not a backdrop. */
export function ChestIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <ellipse cx="16" cy="27" rx="11" ry="2" fill="#000" opacity="0.1" />
      <path d="M5 15h22v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" fill="#c98a3e" />
      <path d="M5 15h22v3H5z" fill="#a86d2c" />
      <path d="M4 10a3 3 0 0 1 3-3h18a3 3 0 0 1 3 3v5H4z" fill="#e2a355" />
      <path d="M4 10a3 3 0 0 1 3-3h18a3 3 0 0 1 3 3v1.5H4z" fill="#f0bd7a" opacity="0.8" />
      <circle cx="16" cy="13.5" r="2.6" fill="#f6c343" />
      <rect x="14.8" y="13.5" width="2.4" height="3.5" rx="0.6" fill="#c9962c" />
    </svg>
  );
}

const KIND: Record<SceneryKind, (p: { size: number; color: string }) => React.JSX.Element> = {
  pine: Pine,
  roundTree: RoundTree,
  bush: Bush,
  flower: Flower,
  rock: Rock,
};

/**
 * Deterministic pick, not random — same node always gets the same prop on
 * every render/hydration. Trees appear most often, flower/rock are rarer
 * accents so the path reads as scattered, not a repeating tile.
 */
export function sceneryForIndex(i: number): SceneryKind | null {
  const cycle: (SceneryKind | null)[] = [
    "pine", null, "bush", "flower", null, "roundTree", "rock", "bush", null, "flower",
  ];
  return cycle[i % cycle.length];
}

export default function PathScenery({
  kind,
  side,
  color,
  size = 46,
}: {
  kind: SceneryKind;
  side: "left" | "right";
  color: string;
  size?: number;
}) {
  const Icon = KIND[kind];
  const style: CSSProperties = {
    position: "absolute",
    top: "0",
    [side]: "calc(100% + 20px)",
    pointerEvents: "none",
  };
  return (
    <div className="dpath-scenery" style={style}>
      <Icon size={size} color={color} />
    </div>
  );
}
