"use client";

import Link from "next/link";
import { useState } from "react";
import { TRACKS, type Track } from "@/lib/tracks";

// ─── Hero notebook card ──────────────────────────────────────────────────────
const CODE_ROWS: { ln: string; src: string }[] = [
  { ln: "1", src: '<span class="c"># black_scholes.py</span>' },
  { ln: "2", src: '<span class="k">def</span> <span class="fn">bs_call</span>(S, K, T, r, σ):' },
  { ln: "3", src: "    d1 = (ln(S/K) + (r+σ²/2)T) / σ√T" },
  { ln: "4", src: "    d2 = d1 − σ√T" },
  { ln: "5", src: '    <span class="k">return</span> S·N(d1) − K·<span class="s">e</span>⁻ʳᵀ·N(d2)' },
  { ln: "6", src: "" },
  { ln: "7", src: 'price = <span class="fn">bs_call</span>(<span class="s">521</span>, <span class="s">525</span>, <span class="s">30/365</span>, <span class="s">.044</span>, <span class="s">.182</span>)' },
];

// ─── Greeks ticket ───────────────────────────────────────────────────────────
const GREEKS = [
  { cls: "d", sym: "Δ", name: "Delta", val: "+0.443", note: "moves per $1 of underlying" },
  { cls: "g", sym: "Γ", name: "Gamma", val: "+0.023", note: "how fast Delta changes" },
  { cls: "t", sym: "Θ", name: "Theta", val: "−0.082", note: "value lost each day" },
  { cls: "v", sym: "ν", name: "Vega",  val: "+0.184", note: "per 1pt of implied vol" },
  { cls: "r", sym: "ρ", name: "Rho",   val: "+0.041", note: "per 1pt of interest rate" },
];

const TOTAL_LESSONS = TRACKS.reduce((s, t) => s + t.lessons.length, 0);

const FACTS = [
  { b: "3",                     s: "Tracks" },
  { b: String(TOTAL_LESSONS),   s: "Lessons" },
  { b: "$0",                    s: "Forever free" },
  { b: "0",                     s: "Installs" },
];

/**
 * One collapsible track on the homepage.
 *
 * The page used to render all 21 lessons inline, which made it enormous and
 * pushed the actual call-to-action far below the fold — you had to scroll past
 * a wall of near-identical rows to reach anything else. Collapsing to three
 * cards makes the curriculum scannable in one screen while keeping the detail
 * one click away.
 *
 * The lesson links are ALWAYS rendered, never conditionally mounted. Collapsing
 * is done with a grid-template-rows transition, so every lesson URL stays in
 * the prerendered HTML and crawlers still see the full internal link graph —
 * which conditional rendering would have quietly destroyed.
 */
function TrackCard({ track, defaultOpen }: { track: Track; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `track-panel-${track.id}`;

  const totalMinutes = track.lessons.reduce(
    (sum, l) => sum + (Number.parseInt(l.duration, 10) || 0),
    0,
  );

  return (
    <div className={`sk-track-card${open ? " open" : ""}`} id={track.id}>
      <button
        type="button"
        className="sk-track-head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span
          className="sk-track-glyph"
          style={{
            background: `color-mix(in srgb, ${track.color} 12%, transparent)`,
            color: track.color,
          }}
          aria-hidden="true"
        >
          {track.icon}
        </span>

        <span className="sk-track-main">
          <span className="sk-track-titles">
            <span
              className="sk-track-level"
              style={{
                background: `color-mix(in srgb, ${track.color} 14%, transparent)`,
                color: track.color,
              }}
            >
              {track.level}
            </span>
            <span className="sk-track-name">{track.title}</span>
          </span>
          <span className="sk-track-sub">{track.subtitle}</span>
        </span>

        <span className="sk-track-meta">
          <span className="sk-track-count">{track.lessons.length} lessons</span>
          <span className="sk-track-mins">{totalMinutes} min</span>
        </span>

        <span className="sk-track-chev" aria-hidden="true">›</span>
      </button>

      <div className="sk-track-panel" id={panelId} role="region">
        <div className="sk-track-panel-inner">
          {/* Background character for the path. Duolingo puts scenery behind
              its tree; the equivalent here is the maths the track is actually
              about, so the decoration means something instead of just being
              filler. Purely ornamental — hidden from assistive tech. */}
          <span className="sk-track-deco" aria-hidden="true" style={{ color: track.color }}>
            {track.icon}
          </span>
          <div className="sk-lessons">
            {track.lessons.map((lesson, i) => (
              <Link key={lesson.id} href={`/lesson/${lesson.id}`} className="sk-lesson">
                <div
                  className="sk-lesson-num"
                  style={{
                    background: `color-mix(in srgb, ${track.color} 12%, transparent)`,
                    color: track.color,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="sk-lesson-t">
                  {lesson.title}
                  <span className="sub">{lesson.subtitle}</span>
                </div>
                <span className="sk-pill live">{lesson.duration}</span>
                <span className="arr">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [subEmail, setSubEmail] = useState("");
  const [subbed, setSubbed] = useState(false);

  function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!subEmail.includes("@")) return;
    try {
      const k = "sl_newsletter";
      const list = JSON.parse(localStorage.getItem(k) || "[]");
      if (!list.includes(subEmail)) list.push(subEmail);
      localStorage.setItem(k, JSON.stringify(list));
    } catch {}
    setSubbed(true);
  }

  return (
    <div className="sk-home">

      {/* ── HERO (dark) ─────────────────────────────────────────────────── */}
      <section className="sk-hero">
        <div className="sk-container">
        <div className="sk-hero-grid">
          <div>
            <span className="sk-tag dark"><span className="dot" />Free &amp; open-source · stocks · options · quant</span>
            <h1 className="sk-hero-h">
              Invest like<br />
              <em>
                the pros.
                <svg className="sk-squiggle" viewBox="0 0 200 12" preserveAspectRatio="none" fill="none" aria-hidden="true">
                  <path d="M3 8 Q 40 2 80 6 T 160 5 Q 180 5 197 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </em>
            </h1>
            <p className="sk-hero-sub">
              Three tracks — <em>Investing Fundamentals</em>, <em>Options Pricing</em>, and
              <em> Quant Investing</em> — taught through a real Python notebook in your browser.
              From your first stock to the efficient frontier. Free. No installs.
            </p>
            <div className="sk-hero-cta">
              <Link href="/lesson/inv-1" className="sk-btn">Start investing track <span className="arr">→</span></Link>
              <Link href="/lessons" className="sk-btn ghost dark">See all tracks</Link>
            </div>
          </div>

          <div className="sk-hero-visual">
            <div className="sk-codecard">
              <div className="sk-codecard-bar">
                <span className="sk-codecard-name">black_scholes.py</span>
                <span className="sk-codecard-tag">Lesson 03</span>
              </div>
              <div className="sk-code">
                {CODE_ROWS.map((r, i) => (
                  <div key={i} className="row">
                    <span className="ln">{r.ln}</span>
                    <span dangerouslySetInnerHTML={{ __html: r.src || "&nbsp;" }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="sk-result-chip">
              <span className="ok">✓ tests passed</span>
              <span>price <b>3.47</b></span>
              <span>Δ <b>0.443</b></span>
            </div>
          </div>
        </div>

        {/* Stats sit below both columns rather than inside the text one. The
            left column ran 600px against a 233px code card, so centring left
            ~180px of dead air above and below the card. Pulling the stats out
            shortens the text column and gives the hero a full-width base to
            rest on instead of two columns floating in space. */}
        <div className="sk-facts">
          {FACTS.map((f) => (
            <div key={f.s} className="sk-fact">
              <b>{f.b}</b>
              <span>{f.s}</span>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* ── CURRICULUM (light) ──────────────────────────────────────────── */}
      <section className="sk-section">
        <div className="sk-container">
          <div className="sk-center" style={{ marginBottom: 56 }}>
            <div className="sk-eyebrow"><span className="sk-kicker">The curriculum</span></div>
            <h2 className="sk-h2">Three tracks.<br /><em>Start anywhere.</em></h2>
            <p className="sk-lead" style={{ margin: "18px auto 0" }}>
              {TOTAL_LESSONS} lessons across three tracks — from buying your first stock to
              backtesting systematic strategies. Each lesson ends with a real Python exercise
              that runs in your browser.
            </p>
          </div>

          <div className="sk-tracks">
            {TRACKS.map((track, ti) => (
              <TrackCard key={track.id} track={track} defaultOpen={ti === 0} />
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 12 }}>
            <Link href="/lessons" className="sk-btn">Open learning path <span className="arr">→</span></Link>
          </div>
        </div>
      </section>

      {/* ── GREEKS (light) ──────────────────────────────────────────────── */}
      <section className="sk-section sk-section-alt">
        <div className="sk-container sk-greeks">
          <div className="sk-ticket">
            <div className="sk-ticket-head">
              <span>SPY · $525 CALL · 30d</span>
              <span className="px">price <b>$3.47</b></span>
            </div>
            <div className="sk-ticket-body">
              {GREEKS.map((g) => (
                <div key={g.name} className={`sk-grow ${g.cls}`}>
                  <span className="sk-gsym">{g.sym}</span>
                  <span>
                    <span className="sk-gname">{g.name}</span>
                    <span className="sk-gnote">{g.note}</span>
                  </span>
                  <span className="sk-gval">{g.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sk-greeks-copy">
            <div className="sk-eyebrow"><span className="sk-kicker">The Greeks</span></div>
            <h2 className="sk-h2">Five numbers that<br /><em>run the trade.</em></h2>
            <p style={{ marginTop: 18 }}>
              Every option price depends on five things: the underlying, strike, time,
              volatility, and rates. The Greeks measure how the price reacts to each one.
            </p>
            <p>
              Delta is your directional exposure. Gamma is how fast that changes. Theta is
              the daily cost of waiting. Vega is your bet on volatility. Rho is the rate effect.
            </p>
            <p>
              Learn to read all five and an options chain stops looking like noise — and
              starts looking like a map.
            </p>
            <Link href="/lesson/4" className="sk-btn" style={{ marginTop: 22 }}>
              Start with Delta →
            </Link>
          </div>
        </div>
      </section>

      {/* ── TOOLS (light) ───────────────────────────────────────────────── */}
      <section className="sk-section">
        <div className="sk-container">
          <div className="sk-center">
            <div className="sk-eyebrow"><span className="sk-kicker">The platform</span></div>
            <h2 className="sk-h2">Don&apos;t just read it. <em>Run it.</em></h2>
            <p className="sk-lead">
              The curriculum doesn&apos;t ask you to trust the formula. It asks you to
              derive it, code it, and watch what happens when the inputs move.
            </p>
          </div>

          <div className="sk-tools">
            <div className="sk-tool">
              <div className="sk-tool-icon">λ</div>
              <h3>A real Python notebook</h3>
              <p>
                Full Python 3.11 runs in your browser through Pyodide — NumPy, SciPy, and our
                pricer preloaded. Every lesson has exercises with tests that run as you type.
              </p>
            </div>
            <div className="sk-tool">
              <div className="sk-tool-icon">ƒ</div>
              <h3>A live Greek visualizer</h3>
              <p>
                Drag a slider and watch Δ, Γ, Θ, ν, ρ redraw across the strike curve in real
                time. <Link href="/playground">Open the Playground →</Link>
              </p>
            </div>
            <div className="sk-tool">
              <div className="sk-tool-icon">∂</div>
              <h3>An open-source engine</h3>
              <p>
                The pricing engine is MIT-licensed. Read it, fork it, extend it — it&apos;s
                yours. <a href="https://github.com/isaacgong0311-hash/strikelab" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA (dark) ──────────────────────────────────────────────────── */}
      <section className="sk-cta">
        <div className="sk-container">
          <div className="sk-cta-card">
            <div className="sk-cta-inner">
              <p className="sk-cta-kicker">∂Education / ∂Zip Code = 0</p>
              <h2 className="sk-cta-h">Start tonight.<br /><em>It&apos;s free.</em></h2>
              <p className="sk-cta-p">
                {TOTAL_LESSONS} lessons across three tracks — investing fundamentals, options pricing,
                and quant strategies — with real Python exercises running in your browser.
                Free and open-source, forever.
              </p>
              <div className="sk-cta-btns">
                <Link href="/lesson/inv-1" className="sk-btn">Start with stocks <span className="arr">→</span></Link>
                <a href="https://github.com/isaacgong0311-hash/strikelab" target="_blank" rel="noopener noreferrer" className="sk-btn dark">GitHub ↗</a>
              </div>

              <div className="sk-newsletter">
                <p className="sk-nl-label">Sunday Greeks — one derivation a week</p>
                {subbed ? (
                  <p className="sk-nl-done">✓ You&apos;re in — first issue lands Sunday.</p>
                ) : (
                  <form className="sk-nl-form" onSubmit={subscribe}>
                    <input
                      type="email"
                      placeholder="you@school.edu"
                      aria-label="Email address"
                      required
                      value={subEmail}
                      onChange={(e) => setSubEmail(e.target.value)}
                    />
                    <button type="submit" className="sk-btn">Subscribe</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
