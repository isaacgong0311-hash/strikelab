"use client";
import Link from "next/link";
import { TRACKS } from "@/lib/tracks";
import { useProgress } from "@/lib/useProgress";
import FlameIcon from "@/components/FlameIcon";
import TrophyIcon from "@/components/TrophyIcon";
import ConstructionIcon from "@/components/ConstructionIcon";
import PathScenery, { sceneryForIndex, ChestIcon } from "@/components/PathScenery";

const OFFSETS = [0, 44, 62, 44, 0, -44, -62, -44];

const LEVEL_COLORS: Record<string, string> = {
  Beginner:     "var(--sky)",
  Intermediate: "var(--grass)",
  Advanced:     "var(--coral)",
};

// Roadmap items ("planned"/"in-progress" on /roadmap) shown as a preview
// past each track's finish line — the path keeps going, it's just not paved
// yet. Update alongside ROADMAP in src/app/roadmap/page.tsx.
const COMING_SOON: Record<string, string> = {
  quant: "VaR, GARCH & Monte Carlo",
};

export default function LessonsClient() {
  const { completed, hydrated, xp, streak } = useProgress();

  const totalLessons = TRACKS.reduce((s, t) => s + t.lessons.length, 0);
  const doneCount = hydrated
    ? TRACKS.flatMap((t) => t.lessons).filter((l) => completed.has(l.id)).length
    : 0;

  const pct = totalLessons ? (doneCount / totalLessons) * 100 : 0;

  return (
    <div className="dpath">
      {/* Header */}
      <div className="dpath-head">
        <div className="dpath-head-row">
          <div>
            <div className="v2-sec-label">Curriculum</div>
            <h1 className="dpath-title">Your learning path</h1>
          </div>
          <div className="dpath-stats">
            <div className="dstat">
              <FlameIcon className="i" size={13} style={{ color: "var(--coral)" }} />
              <b>{hydrated ? streak : 0}</b>
              <span className="l">streak</span>
            </div>
            <div className="dstat">
              <span className="i">✦</span>
              <b>{hydrated ? xp : 0}</b>
              <span className="l">XP</span>
            </div>
            <div className="dstat">
              <b>{doneCount}/{totalLessons}</b>
              <span className="l">done</span>
            </div>
          </div>
        </div>
        <div className="dpath-progress">
          <div className="dpath-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Tracks */}
      {TRACKS.map((track) => {
        const trackDone = hydrated
          ? track.lessons.filter((l) => completed.has(l.id)).length
          : 0;
        const activeId = hydrated
          ? track.lessons.find((l) => !completed.has(l.id))?.id ?? null
          : track.lessons[0]?.id ?? null;
        const levelColor = LEVEL_COLORS[track.level] ?? "var(--grass)";

        return (
          <div key={track.id}>
            {/* Unit banner */}
            <div
              className="dunit-banner"
              style={{ background: levelColor, boxShadow: `0 5px 0 color-mix(in srgb, ${levelColor} 70%, #000)` }}
            >
              <div>
                <div className="t">{track.title}</div>
                <div className="s">
                  {track.subtitle} · {track.level} · {trackDone}/{track.lessons.length} complete
                </div>
              </div>
              <span className="dunit-icon">{track.icon}</span>
            </div>

            {/* Winding path */}
            <div className="dpath-nodes">
              {track.lessons.flatMap((lesson, i) => {
                const done = hydrated && completed.has(lesson.id);
                const isActive = !done && lesson.id === activeId;
                const off = OFFSETS[i % OFFSETS.length];
                const state = done ? "done" : isActive ? "active" : "open";
                const scenery = sceneryForIndex(i);

                const node = (
                  <div
                    key={lesson.id}
                    className={`dnode ${state}`}
                    style={{
                      transform: `translateX(${off}px)`,
                      "--node-color": levelColor,
                    } as React.CSSProperties}
                  >
                    {scenery && (
                      <PathScenery
                        kind={scenery}
                        side={i % 2 === 0 ? "right" : "left"}
                        color={levelColor}
                      />
                    )}
                    <div
                      className="dnode-rise"
                      style={{ animationDelay: `${Math.min(i, 8) * 60}ms`, display: "flex", flexDirection: "column", alignItems: "center" }}
                    >
                      {isActive && <span className="dnode-start">START</span>}
                      <Link
                        href={`/lesson/${lesson.id}`}
                        className="dnode-btn"
                        style={
                          state === "done"
                            ? { background: levelColor, boxShadow: `0 6px 0 color-mix(in srgb, ${levelColor} 70%, #000)` }
                            : state === "active"
                            ? { background: "#fff", color: levelColor, border: `3px solid ${levelColor}`, boxShadow: `0 6px 0 color-mix(in srgb, ${levelColor} 20%, #fff)` }
                            : { background: "#fff", color: levelColor, border: `2px solid ${levelColor}44`, boxShadow: `0 2px 0 #e7e5e4` }
                        }
                        aria-label={lesson.title}
                      >
                        {state === "done" ? "✓" : i + 1}
                      </Link>
                      <div className="dnode-label">{lesson.title}</div>
                    </div>
                  </div>
                );

                // A small reward beat every 4 lessons — skip right before the
                // finish trophy, which already closes out the track.
                const showChest = (i + 1) % 4 === 0 && i + 1 < track.lessons.length;
                if (!showChest) return [node];

                return [
                  node,
                  <div key={`${lesson.id}-chest`} className="dnode dchest" aria-hidden="true">
                    <div className="dchest-btn"><ChestIcon /></div>
                    <div className="dchest-label">Nice pace</div>
                  </div>,
                ];
              })}

              {/* Track-finish trophy */}
              <div className={`dnode dfinish ${trackDone === track.lessons.length ? "won" : ""}`}>
                <div
                  className="dfinish-btn"
                  style={
                    trackDone === track.lessons.length
                      ? { background: levelColor, color: "#fff", boxShadow: `0 6px 0 color-mix(in srgb, ${levelColor} 70%, #000)` }
                      : { background: "#fff", color: levelColor, border: `2px dashed ${levelColor}66` }
                  }
                >
                  <TrophyIcon size={30} />
                </div>
                <div className="dnode-label">
                  {trackDone === track.lessons.length
                    ? `${track.title} complete`
                    : `${track.lessons.length - trackDone} more to finish ${track.title}`}
                </div>
              </div>

              {/* Coming soon — the path keeps going past what's built */}
              {COMING_SOON[track.id] && (
                <div
                  className="dnode locked"
                  style={{ transform: `translateX(${OFFSETS[(track.lessons.length + 1) % OFFSETS.length]}px)` }}
                >
                  <span className="dnode-soon">COMING SOON</span>
                  <div className="dnode-btn">
                    <ConstructionIcon size={24} />
                  </div>
                  <div className="dnode-label">{COMING_SOON[track.id]}</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
