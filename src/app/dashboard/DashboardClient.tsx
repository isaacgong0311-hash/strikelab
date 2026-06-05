"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { TRACKS, getAllLessons } from "@/lib/tracks";
import { useProgress, getLevel, getXpToNextLevel, XP_LEVELS } from "@/lib/useProgress";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

const ACHIEVEMENTS = [
  { id: "first",    icon: "⊗",  name: "First Strike",   desc: "Complete your first lesson",          unlocked: (ids: Set<string>) => ids.size >= 1 },
  { id: "parity",   icon: "≡",  name: "Parity Pro",     desc: "Master Put-Call Parity",              unlocked: (ids: Set<string>) => ids.has("2") },
  { id: "bsm",      icon: "∂",  name: "BSM Builder",    desc: "Implement Black-Scholes",             unlocked: (ids: Set<string>) => ids.has("3") },
  { id: "greeks",   icon: "Δ",  name: "Greek Scholar",  desc: "Complete all four Greek lessons",     unlocked: (ids: Set<string>) => ["4","5","6","7"].every(id => ids.has(id)) },
  { id: "iv",       icon: "σ",  name: "Vol Wizard",     desc: "Solve for implied volatility",        unlocked: (ids: Set<string>) => ids.has("8") },
  { id: "strategy", icon: "∑",  name: "Strategist",     desc: "Learn option strategies",             unlocked: (ids: Set<string>) => ids.has("9") },
  { id: "investor", icon: "↗",  name: "Investor",       desc: "Start the Investing track",           unlocked: (ids: Set<string>) => ids.has("inv-1") },
  { id: "portfolio",icon: "⊞",  name: "Portfolio Mgr",  desc: "Finish all 6 Investing lessons",      unlocked: (ids: Set<string>) => ["inv-1","inv-2","inv-3","inv-4","inv-5","inv-6"].every(id => ids.has(id)) },
  { id: "capm",     icon: "β",  name: "Quant Initiate", desc: "Understand CAPM and Beta",            unlocked: (ids: Set<string>) => ids.has("q1") },
  { id: "factor",   icon: "λ",  name: "Factor King",    desc: "Master factor investing",             unlocked: (ids: Set<string>) => ids.has("q2") },
  { id: "backtest", icon: "⟲",  name: "Backtester",     desc: "Build your first backtest",           unlocked: (ids: Set<string>) => ids.has("q3") },
  { id: "allstar",  icon: "✶",  name: "All-Star",       desc: "Complete all 21 lessons",             unlocked: (ids: Set<string>) => ids.size >= 21 },
];

// ── SVG circular progress ring ──────────────────────────────
function XPRing({ pct, color, size = 130 }: { pct: number; color: string; size?: number }) {
  const strokeW = 10;
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(pct, 100)) / 100 * circ;
  const cx = size / 2, cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg2)" strokeWidth={strokeW} />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth={strokeW} strokeLinecap="round"
        strokeDasharray={`${filled} ${circ - filled}`}
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.2,.7,.3,1)" }}
      />
    </svg>
  );
}

// ── Thin inline progress bar ─────────────────────────────────
function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="db-mini-bar">
      <div className="db-mini-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function DashboardClient() {
  const { completed, hydrated, xp, streak, weekActivity } = useProgress();
  const allLessons = getAllLessons();
  const totalLessons = allLessons.length;
  const completedCount = hydrated ? allLessons.filter(l => completed.has(l.id)).length : 0;
  const overallPct = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  const level = getLevel(xp);
  const { progress: xpProgress, needed: xpNeeded } = getXpToNextLevel(xp);
  const levelNum = XP_LEVELS.findIndex(l => l.label === level.label) + 1;

  const nextLesson = hydrated
    ? allLessons.find(l => !completed.has(l.id)) ?? allLessons[0]
    : allLessons[0];

  const week = weekActivity ?? Array(7).fill(0);
  const todayDOW = new Date().getDay(); // 0=Sun
  const mondayOffset = (todayDOW + 6) % 7; // index in Mon-first array that is today

  const unlockedAch = hydrated ? ACHIEVEMENTS.filter(a => a.unlocked(completed)).length : 0;

  const [firstName, setFirstName] = useState("there");
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("sl_user") || "null");
      if (u?.name) setFirstName(String(u.name).split(" ")[0]);
    } catch {}
  }, []);

  const [activeTrackIdx, setActiveTrackIdx] = useState(0);

  return (
    <div className="db">

      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="db-hero">
        <div className="db-hero-content">
          <div className="db-hero-eyebrow">
            {hydrated && streak > 0 ? `🔥 ${streak}-day streak · keep it up` : "Learning Dashboard"}
          </div>
          <h1 className="db-hero-h">Welcome back, {firstName}</h1>
          <p className="db-hero-sub">
            {completedCount} of {totalLessons} lessons complete &mdash; {overallPct}% there
          </p>
          <div className="db-hero-actions">
            <Link href={nextLesson ? `/lesson/${nextLesson.id}` : "/lessons"} className="db-cta-btn">
              {completedCount === 0 ? "Start learning" : "Continue"} <span>→</span>
            </Link>
            <Link href="/lessons" className="db-ghost-btn">View learning path</Link>
          </div>
        </div>
        <div className="db-hero-progress-wrap">
          <MiniBar pct={overallPct} color="var(--grass)" />
        </div>
      </div>

      {/* ── METRIC TILES ─────────────────────────────────── */}
      <div className="db-metrics">
        <div className="db-metric">
          <div className="db-metric-icon" style={{ background: "var(--grass-tint)", color: "var(--grass)" }}>✓</div>
          <div className="db-metric-v" style={{ color: "var(--grass)" }}>{completedCount}</div>
          <div className="db-metric-l">Lessons done</div>
        </div>
        <div className="db-metric">
          <div className="db-metric-icon" style={{ background: "var(--coral-tint)", color: "var(--coral)" }}>△</div>
          <div className="db-metric-v" style={{ color: "var(--coral)" }}>{hydrated ? streak : 0}</div>
          <div className="db-metric-l">Day streak</div>
        </div>
        <div className="db-metric">
          <div className="db-metric-icon" style={{ background: "rgba(251,191,36,0.12)", color: "var(--amber)" }}>◆</div>
          <div className="db-metric-v" style={{ color: "var(--amber)" }}>{hydrated ? xp.toLocaleString() : "0"}</div>
          <div className="db-metric-l">Total XP</div>
        </div>
        <div className="db-metric">
          <div className="db-metric-icon" style={{ background: `${level.color}18`, color: level.color }}>◉</div>
          <div className="db-metric-v" style={{ color: level.color, fontSize: 20 }}>{level.label}</div>
          <div className="db-metric-l">Level {levelNum}</div>
        </div>
      </div>

      {/* ── XP RING  +  ACTIVITY ─────────────────────────── */}
      <div className="db-row2">

        {/* XP Level panel */}
        <div className="db-panel">
          <div className="db-panel-head">
            <span className="db-panel-title">Level &amp; XP</span>
            <span className="db-level-chip" style={{ background: `${level.color}20`, color: level.color }}>Lv.{levelNum}</span>
          </div>
          <div className="db-ring-layout">
            <div className="db-ring-wrap">
              <XPRing pct={xpProgress} color={level.color} />
              <div className="db-ring-label" style={{ color: level.color }}>
                <span className="db-ring-pct">{xpProgress}%</span>
                <span className="db-ring-sub">to next</span>
              </div>
            </div>
            <div className="db-ring-info">
              <div className="db-ring-name" style={{ color: level.color }}>{level.label}</div>
              <div className="db-ring-xp">{hydrated ? xp.toLocaleString() : 0} XP total</div>
              {xpNeeded > 0 && (
                <div className="db-ring-needed">{xpNeeded} XP → {XP_LEVELS[levelNum]?.label ?? "Max"}</div>
              )}
              <div className="db-level-track">
                {XP_LEVELS.map((l, i) => (
                  <div
                    key={l.label}
                    className="db-level-pip"
                    style={{ background: i < levelNum ? l.color : "var(--line-2)" }}
                    title={`Lv.${i + 1} ${l.label}`}
                  />
                ))}
              </div>
              <div className="db-level-labels">
                {XP_LEVELS.map((l, i) => (
                  <span key={i} className="db-level-lbl" style={{ color: i < levelNum ? l.color : "var(--ink-3)" }}>
                    {i + 1}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity heatmap */}
        <div className="db-panel">
          <div className="db-panel-head">
            <span className="db-panel-title">Last 7 days</span>
            <span className="db-streak-pill" style={{ color: streak > 0 ? "var(--coral)" : "var(--ink-3)" }}>
              {streak > 0 ? `🔥 ${streak} days` : "No active streak"}
            </span>
          </div>
          <div className="db-heatmap">
            {week.map((v, i) => {
              const isToday = i === mondayOffset;
              const intensity = v > 0 ? Math.min(v / 3, 1) : 0;
              const bg = v > 0
                ? isToday
                  ? "var(--coral)"
                  : `rgba(34,197,94,${0.25 + intensity * 0.75})`
                : "var(--bg2)";
              return (
                <div key={i} className="db-heatmap-col">
                  <div
                    className={`db-heatmap-cell ${isToday ? "today" : ""} ${v > 0 ? "active" : ""}`}
                    style={{ background: bg, boxShadow: isToday && v > 0 ? `0 0 14px rgba(239,68,68,0.4)` : "none" }}
                    title={v > 0 ? `${v} lesson${v > 1 ? "s" : ""} completed` : "No activity"}
                  >
                    {v > 0 && <span className="db-heatmap-n">{v}</span>}
                  </div>
                  <div className={`db-heatmap-day ${isToday ? "today" : ""}`}>{DAY_LABELS[i]}</div>
                </div>
              );
            })}
          </div>
          <p className="db-panel-note">Finish at least one lesson each day to grow your streak.</p>
        </div>
      </div>

      {/* ── CURRICULUM PROGRESS ──────────────────────────── */}
      <div className="db-section-head">
        <span className="db-section-title">Curriculum</span>
        <span className="db-section-meta">{completedCount} / {totalLessons} lessons</span>
      </div>

      {/* Track tab bar */}
      <div className="db-tabs">
        {TRACKS.map((track, i) => {
          const done = hydrated ? track.lessons.filter(l => completed.has(l.id)).length : 0;
          const pct = Math.round((done / track.lessons.length) * 100);
          return (
            <button
              key={track.id}
              className={`db-tab ${activeTrackIdx === i ? "active" : ""}`}
              style={{ "--tc": track.color } as React.CSSProperties}
              onClick={() => setActiveTrackIdx(i)}
            >
              <span className="db-tab-glyph">{track.icon}</span>
              <span className="db-tab-name">{track.title}</span>
              <span className="db-tab-prog">{pct}%</span>
            </button>
          );
        })}
      </div>

      {/* Active track panel */}
      {TRACKS.map((track, ti) => {
        if (ti !== activeTrackIdx) return null;
        const done = hydrated ? track.lessons.filter(l => completed.has(l.id)).length : 0;
        const pct = totalLessons ? Math.round((done / track.lessons.length) * 100) : 0;
        const nextInTrack = hydrated ? track.lessons.find(l => !completed.has(l.id)) : track.lessons[0];

        return (
          <div key={track.id} className="db-track-panel">
            <div className="db-track-top">
              <div>
                <div className="db-track-title" style={{ color: track.color }}>{track.title}</div>
                <div className="db-track-sub">{track.subtitle} · {track.level}</div>
              </div>
              <div className="db-track-count">
                <span style={{ color: track.color }}>{done}</span>
                <span className="db-track-count-sep">/{track.lessons.length}</span>
              </div>
            </div>
            <MiniBar pct={pct} color={track.color} />
            <div className="db-lesson-list">
              {track.lessons.map((l, li) => {
                const isDone = hydrated && completed.has(l.id);
                const isCurrent = nextInTrack?.id === l.id;
                return (
                  <Link
                    key={l.id}
                    href={`/lesson/${l.id}`}
                    className={`db-lesson-row ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}
                    style={{ "--tc": track.color } as React.CSSProperties}
                  >
                    <div
                      className="db-lesson-circle"
                      style={{
                        background: isDone ? `${track.color}22` : isCurrent ? `${track.color}14` : "var(--bg2)",
                        color: isDone || isCurrent ? track.color : "var(--ink-3)",
                        borderColor: isDone || isCurrent ? `${track.color}60` : "transparent",
                      }}
                    >
                      {isDone ? "✓" : li + 1}
                    </div>
                    <div className="db-lesson-text">
                      <div className="db-lesson-name" style={{ color: isDone ? "var(--ink-3)" : "var(--ink)" }}>
                        {l.title}
                      </div>
                      <div className="db-lesson-dur">{l.duration} · +100 XP</div>
                    </div>
                    {isCurrent && (
                      <span className="db-next-badge" style={{ background: track.color }}>Next →</span>
                    )}
                    {isDone && <span className="db-done-tick" style={{ color: track.color }}>✓</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ── UP NEXT  +  QUICK ACTIONS ─────────────────────── */}
      <div className="db-bottom">

        {/* Featured up-next lesson */}
        <div className="db-feat">
          <div className="db-feat-label">Up next</div>
          <h3 className="db-feat-title">{nextLesson?.title ?? "All done!"}</h3>
          <p className="db-feat-sub">{nextLesson?.subtitle}</p>
          <div className="db-feat-pills">
            {nextLesson && <>
              <span className="db-pill">⏱ {nextLesson.duration}</span>
              <span className="db-pill">✦ +100 XP</span>
              <span className="db-pill">1 exercise</span>
            </>}
          </div>
          <Link
            href={nextLesson ? `/lesson/${nextLesson.id}` : "/lessons"}
            className="db-feat-btn"
          >
            {completedCount === 0 ? "Start" : "Continue"} <span>→</span>
          </Link>
        </div>

        {/* Quick actions */}
        <div className="db-actions">
          {[
            { href: "/lessons",    glyph: "≡", title: "Learning path",    sub: "Duolingo-style path view",  ic: "var(--grass)",   bg: "var(--grass-tint)" },
            { href: "/playground", glyph: "∂", title: "Playground",       sub: "Live Black-Scholes sandbox", ic: "var(--sky)",     bg: "var(--sky-tint)" },
            { href: "/roadmap",    glyph: "→", title: "Roadmap",          sub: "What's shipping next",       ic: "var(--coral)",   bg: "var(--coral-tint)" },
          ].map(q => (
            <Link key={q.href} href={q.href} className="db-action">
              <span className="db-action-icon" style={{ background: q.bg, color: q.ic }}>{q.glyph}</span>
              <div className="db-action-copy">
                <div className="db-action-t">{q.title}</div>
                <div className="db-action-s">{q.sub}</div>
              </div>
              <span className="db-action-arr">›</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── ACHIEVEMENTS ─────────────────────────────────── */}
      <div className="db-section-head" style={{ marginTop: 8 }}>
        <span className="db-section-title">Achievements</span>
        <span className="db-section-meta">{unlockedAch} / {ACHIEVEMENTS.length} unlocked</span>
      </div>
      <div className="db-ach-grid">
        {ACHIEVEMENTS.map(a => {
          const unlocked = hydrated && a.unlocked(completed);
          return (
            <div key={a.id} className={`db-ach ${unlocked ? "unlocked" : ""}`} title={a.desc}>
              {unlocked && <div className="db-ach-glow" />}
              <div className="db-ach-icon">{a.icon}</div>
              <div className="db-ach-name">{a.name}</div>
              <div className="db-ach-desc">{a.desc}</div>
              {unlocked && <div className="db-ach-check">✓</div>}
            </div>
          );
        })}
      </div>

    </div>
  );
}
