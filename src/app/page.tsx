"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { LESSONS, COMING_SOON } from "@/lib/lessons";

// ────────────────────────────────────────────────────────────────────────
// Code window — Black-Scholes printout for hero
// ────────────────────────────────────────────────────────────────────────
const CODE_LINES: { ln: string; src: string }[] = [
  { ln: "1",  src: '<span class="c">#  black_scholes.py — Lesson 03</span>' },
  { ln: "2",  src: '<span class="k">import</span> <span class="v">numpy</span> <span class="k">as</span> <span class="v">np</span>' },
  { ln: "3",  src: '<span class="k">from</span> <span class="v">scipy.stats</span> <span class="k">import</span> <span class="v">norm</span>' },
  { ln: "4",  src: "" },
  { ln: "5",  src: '<span class="k">def</span> <span class="fn">bs_call</span>(S, K, T, r, σ):' },
  { ln: "6",  src: '&nbsp;&nbsp;&nbsp;&nbsp;d1 = (np.log(S/K) + (r + σ**2/2)*T) / (σ*np.sqrt(T))' },
  { ln: "7",  src: '&nbsp;&nbsp;&nbsp;&nbsp;d2 = d1 − σ*np.sqrt(T)' },
  { ln: "8",  src: '&nbsp;&nbsp;&nbsp;&nbsp;<span class="k">return</span> S*norm.cdf(d1) − K*np.exp(−r*T)*norm.cdf(d2)' },
  { ln: "9",  src: "" },
  { ln: "10", src: '<span class="c"># SPY · $521 spot · $525 strike · 30d · 4.4% r · 18.2% σ</span>' },
  { ln: "11", src: 'price = <span class="fn">bs_call</span>(<span class="s">521</span>, <span class="s">525</span>, <span class="s">30/365</span>, <span class="s">.044</span>, <span class="s">.182</span>)' },
];

const MARQUEE_ITEMS = [
  { lbl: "CALL",    eq: "C = S₀N(d₁) − Ke⁻ʳᵀN(d₂)" },
  { lbl: "DELTA",   eq: "Δ = ∂V/∂S" },
  { lbl: "GAMMA",   eq: "Γ = ∂²V/∂S²" },
  { lbl: "THETA",   eq: "Θ = ∂V/∂t" },
  { lbl: "VEGA",    eq: "ν = ∂V/∂σ" },
  { lbl: "RHO",     eq: "ρ = ∂V/∂r" },
  { lbl: "BSM PDE", eq: "∂V/∂t + ½σ²S²∂²V/∂S² + rS∂V/∂S − rV = 0" },
];

const GREEKS = [
  { sym: "Δ", name: "Delta", formula: "∂V / ∂S",  desc: "How much the option price changes per $1 move in the underlying. The hedge ratio." },
  { sym: "Γ", name: "Gamma", formula: "∂²V / ∂S²", desc: "The rate of change of delta. Explodes near expiry — where careers are made and ended." },
  { sym: "Θ", name: "Theta", formula: "∂V / ∂t",  desc: "Time decay. The rent the option seller collects, and the option buyer pays each day." },
  { sym: "ν", name: "Vega",  formula: "∂V / ∂σ",  desc: "Sensitivity to implied volatility. The market's opinion about future moves." },
  { sym: "ρ", name: "Rho",   formula: "∂V / ∂r",  desc: "Sensitivity to interest rates. Forgotten in calm times, lethal in tightening cycles." },
];

const FEATURES = [
  { num: "01", tag: "CURRICULUM", glyph: "∫", title: "Interactive Curriculum", desc: "Ten progressive lessons with embedded Python exercises and unit-tested coding problems. From first principles to Black-Scholes, all five Greeks, implied vol, strategies, and binomial trees.", meta: ["10 lessons", "~3h total", "Self-paced"] },
  { num: "02", tag: "PLAYGROUND", glyph: "λ", title: "Pyodide WASM",          desc: "A full Python 3.11 environment running in your browser. NumPy, SciPy, and our options pricer pre-wired. No installs, no setup, no excuses.", meta: ["Python 3.11", "NumPy · SciPy", "Auto-save"] },
  { num: "03", tag: "VISUALIZER", glyph: "ϕ", title: "Live Greek Visualizer", desc: "Drag a slider, watch Δ, Γ, Θ, ν, ρ update in real time across strike and maturity. The pricer is your scratchpad.", meta: ["Real-time", "5 Greeks", "Vol surface"] },
];

const AUDIENCE = [
  { num: "A", tag: "MATH COMP",   glyph: "π", title: "Math competition kids",  desc: "If you've seen AMC, AIME, or USAMO, you have more than enough machinery. We translate the math you already love into options pricing.", meta: ["AMC · AIME · USAMO", "Proofs welcome"] },
  { num: "B", tag: "QUANT TRACK", glyph: "σ", title: "Future quant track",     desc: "Aiming for a CS/math major and a Jane Street internship? Start now. The interviews will ask you about Black-Scholes, vol arbitrage, and Greeks.", meta: ["Internship-prep", "Resume-ready"] },
  { num: "C", tag: "SELF-TAUGHT", glyph: "μ", title: "Self-taught builders",   desc: "Already coding in Python and curious why options exist? StrikeLab is the missing semester your school skipped. No prerequisites except curiosity.", meta: ["Python-friendly", "No prereqs"] },
];

const STACK = [
  ["Next.js", "16"], ["React", "19"], ["Pyodide", "0.25"], ["NumPy", "1.26"], ["SciPy", "1.13"],
  ["Framer Motion", "11"], ["D3", "7"], ["TypeScript", "5.4"], ["Tailwind", "4"], ["Vercel", "Edge"],
];

const COMPARISON = [
  { feature: "Built for high schoolers",      cells: [true,  true,  false, false] },
  { feature: "Real options pricing",          cells: [true,  false, true,  true ] },
  { feature: "In-browser Python notebook",    cells: [true,  false, false, false] },
  { feature: "Live Greek visualizer",         cells: [true,  false, false, false] },
  { feature: "Coding exercises with tests",   cells: [true,  false, true,  false] },
  { feature: "Open-source engine",            cells: [true,  false, false, false] },
  { feature: "Free, forever",                 cells: [true,  true,  false, false] },
];
const COMPARE_COLS = ["StrikeLab", "Wharton WGHS", "Coursera Quant", "Textbooks"];

const STRIP_STATS = [
  { target: 10,  label: "Lessons live" },
  { target: 5,   label: "Greeks covered" },
  { target: 3,   label: "Strategies covered" },
  { target: 0,   label: "Installs needed" },
  { target: 0,   label: "Cost, ever", prefix: "$" },
  { target: 100, label: "Open source", suffix: "%" },
];

// ────────────────────────────────────────────────────────────────────────
// Count-up animation utility
// ────────────────────────────────────────────────────────────────────────
function animateCount(el: HTMLElement, target: number, duration = 1400, overshoot = 1.08) {
  if (el.dataset.done) return;
  el.dataset.done = "1";
  const t0 = performance.now();
  function frame(t: number) {
    const p = Math.min(1, (t - t0) / duration);
    const eased = p < 0.7 ? (p / 0.7) * overshoot : overshoot - ((p - 0.7) / 0.3) * (overshoot - 1);
    const v = Math.round(target * eased);
    el.textContent = v.toLocaleString();
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(frame);
}

export default function Home() {
  const inlineStatsRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const infRef = useRef<HTMLSpanElement>(null);

  // ───── Page-specific animations (head/stagger/parallax handled by global V2Animator) ─────
  useEffect(() => {
    // Inline 4-stat row — count-up + ∞ spin
    if (inlineStatsRef.current) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.querySelectorAll<HTMLElement>(".v2-counter").forEach((c) => {
            animateCount(c, Number(c.dataset.target));
          });
          infRef.current?.classList.add("in");
          io.unobserve(e.target);
        });
      }, { threshold: 0.3 });
      io.observe(inlineStatsRef.current);
    }

    // Stats strip — sequential 80ms stagger
    if (stripRef.current) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const counters = e.target.querySelectorAll<HTMLElement>(".v2-counter");
          counters.forEach((c, i) => setTimeout(() => animateCount(c, Number(c.dataset.target)), i * 80));
          io.unobserve(e.target);
        });
      }, { threshold: 0.3 });
      io.observe(stripRef.current);
    }

    // Comparison checks pop in row-by-row
    if (compareRef.current) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const rows = e.target.querySelectorAll(".v2-compare-row:not(.v2-compare-head)");
          rows.forEach((row, rIdx) => {
            row.querySelectorAll(".v2-compare-cell").forEach((cell, cIdx) => {
              setTimeout(() => cell.classList.add("in"), rIdx * 120 + cIdx * 40);
            });
          });
          io.unobserve(e.target);
        });
      }, { threshold: 0.15 });
      io.observe(compareRef.current);
    }
  }, []);

  // ───── Combine real LESSONS + COMING_SOON into a single rendered list ─────
  const allLessons = [
    ...LESSONS.map((l) => ({ ...l, status: "live" as const })),
    ...COMING_SOON.map((l) => ({ ...l, status: "coming" as const })),
  ];

  return (
    <div className="v2">
      <div className="v2-wrap">

        {/* ── HERO ── */}
        <section className="v2-hero">
          <div className="v2-container v2-hero-grid">
            <div>
              <div className="v2-badge">
                <span className="dot" />
                <span>Creator Colosseum 2025 · 10 Lessons Live</span>
              </div>
              <h1 className="v2-headline">
                <span className="it">Quant finance,</span><br />
                <span className="underlined">building the engine</span><br />
                <span className="dim it">for high schoolers.</span>
              </h1>
              <p className="v2-hero-sub">
                A free, open-source curriculum that teaches options pricing and the five
                Greeks — with a real Pyodide notebook and a live Black-Scholes visualizer
                that updates every Greek in real time.
              </p>

              <div className="v2-inline-stats" ref={inlineStatsRef}>
                <div className="v2-inline-stat">
                  <span className="n v2-counter" data-target="10">0</span>
                  <span className="l">Lessons live</span>
                </div>
                <div className="v2-inline-stat">
                  <span className="n v2-counter" data-target="5">0</span>
                  <span className="l">Greeks covered</span>
                </div>
                <div className="v2-inline-stat">
                  <span className="n v2-counter" data-target="0">0</span>
                  <span className="l">Setup required</span>
                </div>
                <div className="v2-inline-stat">
                  <span className="n"><span className="v2-spin-180" ref={infRef}>∞</span></span>
                  <span className="l">Paper trades</span>
                </div>
              </div>

              <div className="v2-cta-row">
                <Link href="/lessons" className="v2-btn">
                  <span className="v2-label">Start Lesson 01</span><span className="v2-arr">→</span>
                </Link>
                <Link href="/lessons" className="v2-btn ghost">
                  <span className="v2-label">View curriculum</span>
                </Link>
                <a href="https://github.com/isaacgong0311-hash/strikelab" target="_blank" rel="noopener noreferrer" className="v2-btn text">
                  <span className="v2-label">★ on GitHub</span>
                </a>
              </div>
            </div>

            {/* Code window */}
            <div className="v2-code-window">
              <div className="v2-cw-chrome">
                <span className="v2-cw-dot" /><span className="v2-cw-dot" /><span className="v2-cw-dot" />
                <span className="v2-cw-title">black_scholes.py — StrikeLab Playground</span>
                <span className="v2-cw-tab">L03</span>
              </div>
              <div className="v2-cw-body">
                {CODE_LINES.map((line, i) => (
                  <div
                    key={i}
                    className="v2-code-line"
                    style={{ animationDelay: `${0.6 + i * 0.16}s` }}
                  >
                    <span className="ln">{line.ln}</span>
                    <span className="src" dangerouslySetInnerHTML={{ __html: line.src }} />
                  </div>
                ))}
                <div
                  className="v2-code-line result"
                  style={{ animationDelay: `${0.6 + CODE_LINES.length * 0.16 + 0.25}s` }}
                >
                  <span className="ln check">»</span>
                  <span className="src">
                    <span className="check">#</span> ✓ Tests passed&nbsp;&nbsp;|&nbsp;&nbsp;price: 3.47&nbsp;&nbsp;|&nbsp;&nbsp;Δ: 0.443
                  </span>
                </div>
              </div>
              <div className="v2-cw-foot">
                <span>Pyodide 0.25 · WASM</span>
                <span>Run · ⌘↵</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <div className="v2-marquee">
          <div className="v2-marquee-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((it, i) => (
              <span key={i} style={{ display: "inline-flex" }}>
                <span className="v2-marquee-item">
                  <span className="lbl">{it.lbl}</span>
                  <span dangerouslySetInnerHTML={{ __html: it.eq.replace(/⁻ʳᵀ/g, "<sup style='font-size:0.6em;'>−rT</sup>") }} />
                </span>
                <span className="v2-marquee-item sep">·</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── STATS STRIP ── */}
        <section style={{ padding: 0 }}>
          <div className="v2-container">
            <div className="v2-stats-strip" ref={stripRef}>
              {STRIP_STATS.map((s, i) => (
                <div key={i} className="v2-strip-stat">
                  <div className="n">
                    {s.prefix}
                    <span className="v2-counter" data-target={s.target}>0</span>
                    {s.suffix}
                  </div>
                  <div className="l">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CURRICULUM ── */}
        <section className="v2-section" id="curriculum">
          <div className="v2-container">
            <div className="v2-curr-wrap">
              <div>
                <div className="v2-sec-head" data-v2-head>
                  <div className="v2-sec-label">Curriculum</div>
                  <div className="v2-sec-title">
                    <span className="dim">Ten</span><br />lessons.<br /><span>One arc.</span>
                  </div>
                </div>
                <div className="v2-curr-meta">
                  <div><span>Total time</span><b>~2h</b></div>
                  <div><span>Format</span><b>Self-paced</b></div>
                  <div><span>Cost</span><b>$0</b></div>
                  <div><span>Prereq</span><b>Pre-calc</b></div>
                </div>
              </div>

              <div className="v2-lesson-rows">
                {allLessons.map((lesson, i) => (
                  <Link
                    key={lesson.id}
                    href={lesson.status === "live" ? `/lesson/${lesson.id}` : "#"}
                    className="v2-lesson-row"
                    style={lesson.status === "coming" ? { opacity: 0.6, pointerEvents: "none" } : undefined}
                  >
                    <div className="v2-lesson-badge">{String(i + 1).padStart(2, "0")}</div>
                    <div className="v2-lesson-title">
                      {lesson.title}
                      <span className="sub">{lesson.subtitle}</span>
                    </div>
                    <span />
                    <span className={`v2-chip ${lesson.status === "live" ? "live" : "coming"}`}>
                      {lesson.status === "live" ? "Live" : "Coming soon"}
                    </span>
                    <span className="arrow">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── GREEKS ── */}
        <section className="v2-section" id="greeks">
          <div className="v2-container">
            <div className="v2-sec-head" data-v2-head>
              <div className="v2-sec-label">The Greeks</div>
              <div className="v2-sec-title">Five sensitivities,<br /><span className="dim">one option.</span></div>
              <div className="v2-sec-sub">Every option price has five partial derivatives. Master them and you understand the trade.</div>
            </div>
            <div className="v2-greeks-grid">
              {GREEKS.map((g) => (
                <div key={g.name} className="v2-greek-card">
                  <div className="v2-greek-sym">{g.sym}</div>
                  <div className="v2-greek-pill">{g.name}</div>
                  <div className="v2-greek-formula">{g.formula}</div>
                  <div className="v2-greek-desc">{g.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PLATFORM FEATURES ── */}
        <section className="v2-section" id="platform">
          <div className="v2-container">
            <div className="v2-sec-head" data-v2-head>
              <div className="v2-sec-label">Platform</div>
              <div className="v2-sec-title">Three tools,<br /><span className="dim">one workspace.</span></div>
            </div>
            <div className="v2-cards-3" data-v2-stagger>
              {FEATURES.map((f) => (
                <div key={f.title} className="v2-feat-card">
                  <div className="v2-feat-num"><span>{f.num}</span><span>{f.tag}</span></div>
                  <div className="v2-feat-glyph">{f.glyph}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <div className="v2-feat-meta">
                    {f.meta.map((m) => <span key={m} className="v2-chip">{m}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AUDIENCE ── */}
        <section className="v2-section" id="audience">
          <div className="v2-container">
            <div className="v2-sec-head" data-v2-head>
              <div className="v2-sec-label">Audience</div>
              <div className="v2-sec-title">Built for the<br /><span className="dim">curious sixteen.</span></div>
            </div>
            <div className="v2-cards-3" data-v2-stagger>
              {AUDIENCE.map((a) => (
                <div key={a.title} className="v2-feat-card">
                  <div className="v2-feat-num"><span>{a.num}</span><span>{a.tag}</span></div>
                  <div className="v2-feat-glyph">{a.glyph}</div>
                  <h3>{a.title}</h3>
                  <p>{a.desc}</p>
                  <div className="v2-feat-meta">
                    {a.meta.map((m) => <span key={m} className="v2-chip">{m}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STACK ── */}
        <section className="v2-section" style={{ paddingTop: 0 }}>
          <div className="v2-container">
            <div className="v2-sec-head" data-v2-head>
              <div className="v2-sec-label">Stack</div>
              <div className="v2-sec-title">Open-source,<br /><span className="dim">end to end.</span></div>
            </div>
            <div className="v2-stack-strip">
              {STACK.map(([name, v]) => (
                <div key={name} className="v2-stack-chip">
                  <span className="sq" />{name} <span className="v">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMPARISON ── */}
        <section className="v2-section" id="compare">
          <div className="v2-container">
            <div className="v2-sec-head" data-v2-head>
              <div className="v2-sec-label">Comparison</div>
              <div className="v2-sec-title">Nothing else is<br /><span className="dim">built for sixteen.</span></div>
            </div>
            <div className="v2-compare" ref={compareRef}>
              <div className="v2-compare-row v2-compare-head">
                <div className="col-h">Feature</div>
                {COMPARE_COLS.map((c, i) => (
                  <div key={c} className={`col-h${i === 0 ? " us" : ""}`}>{c}</div>
                ))}
              </div>
              {COMPARISON.map((row) => (
                <div key={row.feature} className="v2-compare-row">
                  <div className="feature">{row.feature}</div>
                  {row.cells.map((v, i) => (
                    <div key={i} className={`v2-compare-cell${i === 0 ? " v2-col-us" : ""}`}>
                      {v ? <span className="v2-check">✓</span> : <span className="v2-cross">—</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── NEWSLETTER ── */}
        <section className="v2-section" id="newsletter">
          <div className="v2-container">
            <div className="v2-newsletter">
              <div>
                <div className="v2-sec-label" style={{ marginBottom: 14 }}>Newsletter</div>
                <h3>Sunday Greeks.</h3>
                <p>One email a week. A new derivation, a code snippet, and a paper-trading prompt. No spam, no sponsorships, unsubscribe in one click.</p>
              </div>
              <form
                className="v2-signup-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget;
                  (f.querySelector("input") as HTMLInputElement).value = "";
                  const lbl = f.querySelector(".v2-label");
                  if (lbl) lbl.textContent = "Subscribed ✓";
                }}
              >
                <input type="email" placeholder="you@school.edu" required />
                <button type="submit" className="v2-btn">
                  <span className="v2-label">Subscribe</span><span className="v2-arr">→</span>
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="v2-final-cta">
          <div className="v2-container">
            <div className="v2-final-formula">∂Education / ∂Zip Code = 0</div>
            <h2 className="v2-final-headline">
              <span className="it">Quant finance shouldn&apos;t</span><br />
              <span className="dim it">require the right zip code.</span>
            </h2>
            <p className="v2-final-sub">Ten lessons. A real Python notebook. A live Greek visualizer. All free, all open source. Start tonight.</p>
            <div className="v2-final-actions">
              <Link href="/lessons" className="v2-btn">
                <span className="v2-label">Start Lesson 01</span><span className="v2-arr">→</span>
              </Link>
              <a href="https://github.com/isaacgong0311-hash/strikelab" target="_blank" rel="noopener noreferrer" className="v2-btn ghost">
                <span className="v2-label">★ on GitHub</span>
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
