"use client";
import Link from "next/link";
import { LESSONS } from "@/lib/lessons";
import { useProgress, getLevel, getXpToNextLevel, XP_LEVELS } from "@/lib/useProgress";

// ─── Achievement badges ───────────────────────────────────────────────────────

const ACHIEVEMENTS = [
  {
    id: "first",
    icon: "🎯",
    name: "First Strike",
    desc: "Complete your first lesson",
    unlocked: (ids: Set<string>) => ids.size >= 1,
  },
  {
    id: "parity",
    icon: "⚖️",
    name: "Parity Pro",
    desc: "Master Put-Call Parity",
    unlocked: (ids: Set<string>) => ids.has("2"),
  },
  {
    id: "bsm",
    icon: "∂",
    name: "BSM Builder",
    desc: "Implement Black-Scholes",
    unlocked: (ids: Set<string>) => ids.has("3"),
  },
  {
    id: "greeks",
    icon: "Δ",
    name: "Greek Scholar",
    desc: "Complete all 4 Greek lessons",
    unlocked: (ids: Set<string>) => ["4","5","6","7"].every((id) => ids.has(id)),
  },
  {
    id: "iv",
    icon: "σ",
    name: "Vol Wizard",
    desc: "Solve for implied vol",
    unlocked: (ids: Set<string>) => ids.has("8"),
  },
  {
    id: "strategy",
    icon: "🦅",
    name: "Strategist",
    desc: "Learn option strategies",
    unlocked: (ids: Set<string>) => ids.has("9"),
  },
];

// ─── XP Level ring display ────────────────────────────────────────────────────

function LevelBadge({ xp }: { xp: number }) {
  const level = getLevel(xp);
  const { progress, needed } = getXpToNextLevel(xp);
  const levelNum = XP_LEVELS.findIndex((l) => l.label === level.label) + 1;

  return (
    <div
      className="p-5 rounded-xl border"
      style={{ borderColor: "var(--border2)", background: "var(--card)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-sm font-semibold text-white"
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
        >
          Level & XP
        </h2>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: `${level.color}18`,
            border: `1px solid ${level.color}40`,
            color: level.color,
            fontFamily: "var(--font-mono)",
          }}
        >
          Lv.{levelNum}
        </span>
      </div>

      {/* Level name */}
      <div
        className="text-2xl font-bold mb-1"
        style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: level.color }}
      >
        {level.label}
      </div>

      {/* XP count */}
      <div
        className="text-xs mb-3"
        style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
      >
        {xp.toLocaleString()} XP total
      </div>

      {/* Progress bar to next level */}
      <div className="sl-xp-bar-track mb-2">
        <div
          className="sl-xp-bar-fill"
          style={{ width: `${progress}%`, background: level.color }}
        />
      </div>

      <div
        className="text-[10px] flex justify-between"
        style={{ color: "var(--fg-faint)", fontFamily: "var(--font-mono)" }}
      >
        <span>{progress}% to next level</span>
        {needed > 0 && <span>{needed} XP needed</span>}
      </div>
    </div>
  );
}

// ─── Real streak chart ────────────────────────────────────────────────────────

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function StreakChart({ weekActivity, streak }: { weekActivity: number[]; streak: number }) {
  const max = Math.max(...weekActivity, 1);
  // Align weekActivity[0] to the actual day of week
  const today = new Date().getDay(); // 0=Sun…6=Sat
  const mondayOffset = (today + 6) % 7; // how many days ago was Monday

  return (
    <div
      className="p-5 rounded-xl border"
      style={{ borderColor: "var(--border2)", background: "var(--card)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-sm font-semibold text-white"
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
        >
          Last 7 days
        </h2>
        <span
          className="text-xs"
          style={{
            color: streak > 0 ? "#fb923c" : "var(--muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {streak > 0 ? `🔥 ${streak}-day streak` : "Start your streak"}
        </span>
      </div>

      <div className="flex items-end justify-between gap-2 h-24 mb-3">
        {weekActivity.map((v, i) => {
          const isToday = i === mondayOffset;
          const hasActivity = v > 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="flex-1 w-full flex items-end">
                <div
                  className="w-full rounded-t transition-all duration-500"
                  title={`${v} lesson${v !== 1 ? "s" : ""}`}
                  style={{
                    height: `${Math.max((v / max) * 100, v > 0 ? 12 : 0)}%`,
                    minHeight: v > 0 ? "6px" : "0",
                    background: hasActivity
                      ? isToday ? "#fb923c" : "#22c55e"
                      : "var(--border2)",
                  }}
                />
              </div>
              <span
                className="text-[9px]"
                style={{
                  color: isToday ? "var(--fg)" : "var(--muted)",
                  fontFamily: "var(--font-mono)",
                  fontWeight: isToday ? 600 : 400,
                }}
              >
                {DAY_LABELS[i].charAt(0)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="text-xs" style={{ color: "var(--muted2)" }}>
        {weekActivity.some((v) => v > 0)
          ? "Green bars = lessons completed. Complete one today to keep your streak."
          : "Complete lessons to build your streak."}
      </div>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function DashboardClient() {
  const { completed, hydrated, xp, streak, weekActivity } = useProgress();
  const completedCount = hydrated ? LESSONS.filter((l) => completed.has(l.id)).length : 0;
  const nextLesson = hydrated
    ? LESSONS.find((l) => !completed.has(l.id)) ?? LESSONS[0]
    : LESSONS[0];
  const pct = (completedCount / LESSONS.length) * 100;

  const STATS = [
    {
      v: completedCount.toString(),
      l: "Lessons complete",
      sub: `of ${LESSONS.length}`,
      color: completedCount > 0 ? "#22c55e" : undefined,
    },
    {
      v: streak > 0 ? `${streak}` : "0",
      l: "Day streak",
      sub: streak > 0 ? "🔥 keep it up" : "start today",
      color: streak > 0 ? "#fb923c" : undefined,
    },
    {
      v: xp.toLocaleString(),
      l: "Total XP",
      sub: getLevel(xp).label,
      color: getLevel(xp).color,
    },
    {
      v: completedCount > 0 ? "100%" : "—",
      l: "Exercise accuracy",
      sub: "tests passed",
      color: completedCount > 0 ? "#22c55e" : undefined,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div
            className="text-[10px] tracking-widest uppercase mb-2 opacity-50"
            style={{ fontFamily: "var(--font-mono)", color: "#888888" }}
          >
            Dashboard
          </div>
          <h1
            className="text-3xl font-semibold text-white mb-1"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
          >
            Welcome back, Isaac
          </h1>
          <p className="text-sm" style={{ color: "var(--muted2)" }}>
            {completedCount}/{LESSONS.length} lessons complete
            {xp > 0 && ` · ${xp.toLocaleString()} XP`}
            {streak > 0 && ` · 🔥 ${streak}-day streak`}
          </p>
        </div>
        <Link
          href={`/lesson/${nextLesson.id}`}
          className="px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
          style={{
            background: "var(--fg)",
            color: "#000000",
            fontFamily: "var(--font-mono)",
          }}
        >
          {completedCount === 0 ? "Start Lesson 01" : `Resume → ${nextLesson.title}`}
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {STATS.map((s) => (
          <div
            key={s.l}
            className="p-4 rounded-xl border"
            style={{ borderColor: "var(--border2)", background: "var(--card)" }}
          >
            <div
              className="text-3xl font-bold leading-none mb-1"
              style={{
                fontFamily: "var(--font-mono)",
                color: s.color ?? "var(--fg)",
              }}
            >
              {s.v}
            </div>
            <div
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
            >
              {s.l}
            </div>
            {s.sub && (
              <div className="text-[10px] mt-0.5" style={{ color: "var(--fg-faint)", fontFamily: "var(--font-mono)" }}>
                {s.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* XP + Streak row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <LevelBadge xp={xp} />
        <StreakChart weekActivity={weekActivity} streak={streak} />
      </div>

      {/* Progress + Next lesson row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {/* Curriculum progress */}
        <div
          className="md:col-span-2 p-5 rounded-xl border"
          style={{ borderColor: "var(--border2)", background: "var(--card)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-sm font-semibold text-white"
              style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
            >
              Curriculum progress
            </h2>
            <span
              className="text-xs"
              style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
            >
              {Math.round(pct)}%
            </span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden mb-4"
            style={{ background: "var(--border2)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: "#22c55e" }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            {LESSONS.map((l, i) => {
              const done = hydrated && completed.has(l.id);
              const isCurrent = hydrated && !done && LESSONS.findIndex((x) => !completed.has(x.id)) === i;
              return (
                <Link
                  key={l.id}
                  href={`/lesson/${l.id}`}
                  className="flex items-center gap-2 text-xs py-1 transition-opacity hover:opacity-75"
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 font-medium"
                    style={{
                      background: done
                        ? "rgba(34,197,94,0.15)"
                        : isCurrent
                          ? "rgba(255,255,255,0.12)"
                          : "rgba(100,116,139,0.10)",
                      color: done ? "#4ade80" : isCurrent ? "var(--fg)" : "var(--muted)",
                      fontFamily: "var(--font-mono)",
                      border: isCurrent ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent",
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span style={{ color: done ? "var(--muted2)" : isCurrent ? "#e2e8f0" : "#64748b" }}>
                    {l.title}
                  </span>
                  {done && (
                    <span
                      className="ml-auto text-[9px]"
                      style={{ color: "#fbbf24", fontFamily: "var(--font-mono)" }}
                    >
                      +100 XP
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Up next */}
        <div
          className="p-5 rounded-xl border flex flex-col"
          style={{ borderColor: "var(--border2)", background: "var(--card)" }}
        >
          <div
            className="text-[10px] tracking-widest uppercase mb-3"
            style={{ fontFamily: "var(--font-mono)", color: "#a3a3a3" }}
          >
            Up next
          </div>
          <h3
            className="text-lg font-semibold text-white mb-1.5 leading-tight"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
          >
            {nextLesson.title}
          </h3>
          <p className="text-xs mb-3 flex-1" style={{ color: "var(--muted2)" }}>
            {nextLesson.subtitle}
          </p>
          <div className="flex items-center gap-2 mb-1 text-[11px]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            <span>{nextLesson.duration}</span>
            <span>·</span>
            <span>1 exercise</span>
          </div>
          <div className="flex items-center gap-1 mb-4 text-[11px]" style={{ color: "#fbbf24", fontFamily: "var(--font-mono)" }}>
            <span>+100 XP on completion</span>
          </div>
          <Link
            href={`/lesson/${nextLesson.id}`}
            className="block text-center px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: "var(--fg)", color: "#000000", fontFamily: "var(--font-mono)" }}
          >
            {completedCount === 0 ? "Start" : "Continue"} →
          </Link>
        </div>
      </div>

      {/* Achievement badges */}
      <div
        className="p-5 rounded-xl border mb-6"
        style={{ borderColor: "var(--border2)", background: "var(--card)" }}
      >
        <h2
          className="text-sm font-semibold text-white mb-4"
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
        >
          Achievements
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const isUnlocked = hydrated && a.unlocked(completed);
            return (
              <div
                key={a.id}
                className={`sl-badge${isUnlocked ? " unlocked" : ""}`}
                title={a.desc}
              >
                <div className="sl-badge-icon">{a.icon}</div>
                <div className="sl-badge-name">{a.name}</div>
                {!isUnlocked && (
                  <div className="text-[9px] mt-0.5" style={{ color: "var(--fg-faint)", fontFamily: "var(--font-mono)" }}>
                    locked
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { href: "/lessons", icon: "∂", title: "All lessons", sub: "Browse the full curriculum" },
          { href: "/playground", icon: "▶", title: "Playground", sub: "Full Greek sandbox with live charts" },
          { href: "/roadmap", icon: "◈", title: "Roadmap", sub: "What's shipping next" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="p-5 rounded-xl border transition-all hover:border-white/40 flex items-center gap-4 group"
            style={{ borderColor: "var(--border2)", background: "var(--card)" }}
          >
            <div
              className="w-10 h-10 rounded border flex items-center justify-center text-lg flex-shrink-0"
              style={{ borderColor: "var(--border2)", background: "var(--bg2)", color: "var(--fg-mute)", fontFamily: "var(--font-mono)" }}
            >
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-base font-semibold text-white"
                style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
              >
                {item.title}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--muted2)" }}>
                {item.sub}
              </div>
            </div>
            <span className="text-xl flex-shrink-0" style={{ color: "var(--muted)" }}>›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
