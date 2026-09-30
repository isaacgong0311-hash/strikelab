import Link from "next/link";
import Faq from "@/components/marketing/Faq";
import CompareTable from "@/components/marketing/CompareTable";
import styles from "@/components/marketing/marketing.module.css";
import home from "./home.module.css";
import CohortHomeView from "@/app/cohort/[classId]/CohortHomeView";
import { buildDemoData, DEMO_CLASS_NAME } from "@/lib/demo/fixtures";
import { EXAMPLE_CAPSTONES } from "@/lib/demo/exampleCapstones";
import { getCapstonePrompt } from "@/lib/capstone/prompts";
import { TRACKS } from "@/lib/tracks";
import { LAB_WEEKS, pilotCallHref } from "@/lib/marketing/lab";
import { heroExample, sampleGreeks } from "@/lib/marketing/heroExample";
import TrackedLink, { TrackedAnchor } from "@/components/marketing/TrackedLink";

const TOTAL_LESSONS = TRACKS.reduce((n, t) => n + t.lessons.length, 0);

const FAQS = [
  { q: "Do I need to know finance or coding?", a: "No. Lesson 1 starts at what a stock is. Python comes in gradually, with the hard parts already written, and it runs in your browser." },
  { q: "What does it cost?", a: "Students never pay: every lesson, the playground and the sandbox are free. Clubs start with a free six-week pilot, then $199/year per club or $499/year per school instructor if they continue." },
  { q: "Do I need an account?", a: "Not to start. Progress saves on this device; a free account syncs it across devices and keeps your code." },
  { q: "I lead a club. How much prep is it?", a: "None beyond showing up. Each week comes with a goal, discussion prompts, common sticking points and a message to send. The lessons do the teaching." },
  { q: "Is it safe for students?", a: "It's built for ages 13–18: no ads, no public profiles or leaderboards with names, work is private unless the student shares it, and accounts can be deleted at any time." },
];

/**
 * One homepage for both audiences (decision log 2026-09-30): independent
 * students and club leaders each get a door in the hero and a section of
 * their own. Server-rendered end to end. Every number is computed from the
 * curriculum or the pricing model (src/lib/marketing/heroExample.ts), never
 * typed by hand.
 */
export default function HomeView() {
  const demo = buildDemoData();
  const [pricing, backtest] = EXAMPLE_CAPSTONES;
  const example = heroExample();
  const greeks = sampleGreeks();
  const needNudge = demo.metrics.students.filter((s) => s.needsHelp).length;

  return (
    <div className={styles.page}>
      {/* ── Hero: one promise, two doors ─────────────────── */}
      <section className={home.hero}>
        <div className={`${styles.wrap} ${home.heroGrid}`}>
          <div>
            <p className={styles.kicker}>Quant finance for high school</p>
            <h1 className={styles.h1}>Learn quant finance by building it.</h1>
            <p className={styles.lede}>
              Price options, code the Greeks and backtest strategies in real Python, right in the browser. Free for
              students, and ready to run as a six-week lab for your club or class.
            </p>
            <div className={home.doors}>
              <div className={home.door}>
                <span className={home.doorWho}>I&apos;m a student</span>
                <span className={home.doorWhat}>{TOTAL_LESSONS} lessons, from &ldquo;what is a stock?&rdquo; to Black-Scholes. No signup to start.</span>
                <div className={home.doorActions}>
                  <TrackedLink href="/learn/inv-1.1?src=home-hero" event="hero_cta" eventProps={{ target: "lesson" }} className={styles.primary}>Start lesson 1</TrackedLink>
                  <TrackedLink href="/lessons" event="hero_cta" eventProps={{ target: "path" }} className={home.doorLink}>See the path</TrackedLink>
                </div>
              </div>
              <div className={home.door}>
                <span className={home.doorWho}>I lead a club or teach</span>
                <span className={home.doorWhat}>A six-week lab with a plan for every meeting and a scorecard. Pilots are free.</span>
                <div className={home.doorActions}>
                  <TrackedLink href="/pilot?src=home-hero" event="hero_cta" eventProps={{ target: "pilot" }} className={styles.secondary}>Start a free pilot</TrackedLink>
                  <TrackedLink href="/demo" event="hero_cta" eventProps={{ target: "demo" }} className={home.doorLink}>See the teacher view</TrackedLink>
                </div>
              </div>
            </div>
          </div>
          <figure className={home.heroVisual}>
            <div className={home.code} aria-hidden="true">
              <div className={home.codeBar}>
                <span className={home.codeFile}>pricing_engine.py</span>
                <span className={home.codePass}>✓ Tests passed</span>
              </div>
              <pre className={home.codeBody}>
                <code>
                  <span className={home.kw}>def</span> <span className={home.fn}>black_scholes_call</span>(S, K, T, r, sigma):{"\n"}
                  {"    "}d1 = (log(S / K) + (r + sigma**<span className={home.num}>2</span> / <span className={home.num}>2</span>) * T){"\n"}
                  {"         "}/ (sigma * sqrt(T)){"\n"}
                  {"    "}d2 = d1 - sigma * sqrt(T){"\n"}
                  {"    "}<span className={home.kw}>return</span> S * N(d1) - K * exp(-r * T) * N(d2){"\n"}
                  {"\n"}
                  <span className={home.fn}>black_scholes_call</span>(S=<span className={home.num}>{example.S}</span>, K=<span className={home.num}>{example.K}</span>, T=<span className={home.num}>{example.T}</span>,{"\n"}
                  {"                   "}r=<span className={home.num}>{example.r}</span>, sigma=<span className={home.num}>{example.sigma}</span>)
                </code>
              </pre>
              <div className={home.codeOut}>
                <span className={home.codeOutLabel}>Out</span> {example.price}
              </div>
            </div>
            <figcaption className={home.caption}>From lesson 3: you write it, and tests check it as you go.</figcaption>
          </figure>
        </div>
      </section>

      {/* ── Facts (all true, all derived) ────────────────── */}
      <div className={home.facts}>
        <ul className={`${styles.wrap} ${home.factList}`}>
          <li><b>{TRACKS.length}</b> tracks</li>
          <li><b>{TOTAL_LESSONS}</b> lessons</li>
          <li><b>Python</b> in your browser</li>
          <li><b>$0</b> for students</li>
        </ul>
      </div>

      {/* ── The path ─────────────────────────────────────── */}
      <section className={styles.section} aria-labelledby="home-path">
        <div className={styles.wrap}>
          <p className={styles.kicker}>The curriculum</p>
          <h2 id="home-path" className={styles.h2}>Three tracks. Start anywhere.</h2>
          <div className={styles.grid3} style={{ marginTop: "1.75rem" }}>
            {TRACKS.map((t) => (
              <Link key={t.id} href="/lessons" className={home.track}>
                <span className={home.trackLevel}>{t.level} · {t.lessons.length} lessons</span>
                <span className={home.trackTitle}>{t.title}</span>
                <span className={home.trackSub}>{t.subtitle}</span>
                <span className={home.trackMore}>See the lessons →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Greeks ───────────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="home-greeks">
        <div className={`${styles.wrap} ${home.split}`}>
          <div>
            <p className={styles.kicker}>The Greeks</p>
            <h2 id="home-greeks" className={styles.h2}>Five numbers that run the trade</h2>
            <p className={styles.lede}>
              An option&apos;s price depends on the stock, the strike, time, volatility and interest rates. The Greeks
              measure how the price reacts to each one, and you&apos;ll code every one of them.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/lesson/4" className={styles.secondary}>Start with Delta</Link>
              <Link href="/playground" className={home.doorLink}>Open the playground</Link>
            </div>
          </div>
          <div className={home.ticket}>
            <div className={home.ticketHead}>
              <span>
                ${greeks.inputs.K} call · {greeks.inputs.days} days · stock at ${greeks.inputs.S}
              </span>
              <b>${greeks.price}</b>
            </div>
            <dl className={home.greekList}>
              {greeks.greeks.map((g) => (
                <div key={g.name} className={home.greek}>
                  <dt>
                    <span className={home.greekSym} aria-hidden="true">{g.sym}</span> {g.name}
                  </dt>
                  <dd>
                    <span className={home.greekVal}>{g.value}</span>
                    <span className={home.greekNote}>{g.note}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className={home.ticketFoot}>
              Black-Scholes with {Math.round(greeks.inputs.sigma * 100)}% volatility and a {greeks.inputs.r * 100}% rate. Computed, not made up.
            </p>
          </div>
        </div>
      </section>

      {/* ── Run it ───────────────────────────────────────── */}
      <section className={styles.section} aria-labelledby="home-run">
        <div className={styles.wrap}>
          <p className={styles.kicker}>How it works</p>
          <h2 id="home-run" className={styles.h2}>Don&apos;t just read it. Run it.</h2>
          <div className={styles.grid3} style={{ marginTop: "1.75rem" }}>
            <div className={styles.card}>
              <span className={styles.step} aria-hidden="true">1</span>
              <h3 className={styles.h3}>Short lessons</h3>
              <p className={styles.body}>One idea per screen with instant feedback. Questions you miss come back until they stick.</p>
            </div>
            <div className={styles.card}>
              <span className={styles.step} aria-hidden="true">2</span>
              <h3 className={styles.h3}>Real Python, checked</h3>
              <p className={styles.body}>Fill in the missing function, press Run, and tests tell you whether your model is right. Nothing to install.</p>
            </div>
            <div className={styles.card}>
              <span className={styles.step} aria-hidden="true">3</span>
              <h3 className={styles.h3}>See it move</h3>
              <p className={styles.body}>Drag sliders to reshape the Greek curves, then try ideas in a paper-trading sandbox with $100k of pretend cash.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What students build ──────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="home-build">
        <div className={styles.wrap}>
          <p className={styles.kicker}>What you build</p>
          <h2 id="home-build" className={styles.h2}>Work you can show, not a quiz score</h2>
          <p className={styles.lede}>
            A capstone is a real question, code that answers it, and an honest result: the kind of project that stands out on
            an application. These two examples were written by the StrikeLab team to show the bar.
          </p>
          <div className={styles.grid2} style={{ marginTop: "1.75rem" }}>
            {[pricing, backtest].map((c) => (
              <Link key={c.slug} href={`/demo/capstone/${c.slug}`} className={home.capstone}>
                <span className={home.exampleTag}>Example</span>
                <span className={home.capPrompt}>{getCapstonePrompt(c.promptId)?.title}</span>
                <span className={home.capTitle}>{c.title}</span>
                <span className={home.capExcerpt}>{c.resultSummary.split("\n")[0]}</span>
                <span className={home.capMore}>Read the example →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── For clubs and teachers ───────────────────────── */}
      <section className={styles.section} aria-labelledby="home-clubs">
        <div className={`${styles.wrap} ${home.split}`}>
          <div>
            <p className={styles.kicker}>For clubs and teachers</p>
            <h2 id="home-clubs" className={styles.h2}>Run it as a six-week lab. No prep.</h2>
            <p className={styles.lede}>
              Launch in minutes, share one invite link, and meet once a week. Students work one short step at a time; you
              see who&apos;s keeping up.
            </p>
            <ol className={home.weeks}>
              {LAB_WEEKS.map((w) => (
                <li key={w.week} className={home.week}>
                  <span className={home.weekNum} aria-hidden="true">{w.week}</span>
                  <div>
                    <h3 className={home.weekTitle}>
                      <span className="sl-visually-hidden">Week {w.week}: </span>
                      {w.title}
                    </h3>
                    <p className={home.weekBody}>{w.builds}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className={styles.ctaRow}>
              <Link href="/pilot?src=home-clubs" className={styles.primary}>Start a free pilot</Link>
              <Link href="/clubs?src=home-clubs" className={styles.secondary}>How a pilot works</Link>
            </div>
          </div>
          <figure className={home.clubVisual}>
            <div className={home.phone} inert aria-hidden="true">
              <CohortHomeView classId="demo" className={DEMO_CLASS_NAME} view={demo.studentView} capstone={null} embedded />
            </div>
            <div className={home.scorecard} aria-hidden="true">
              <span className={home.scorecardLabel}>Your scorecard</span>
              <span><b>{demo.metrics.activated.pct}%</b> activated</span>
              <span><b>{demo.metrics.activeThisWeek}</b> active this week</span>
              <span className={home.scorecardHelp}>{needNudge} student{needNudge === 1 ? "" : "s"} to nudge</span>
            </div>
            <figcaption className={home.caption}>
              A student&apos;s week and the leader&apos;s scorecard, from the <Link href="/demo" className={styles.textLink}>live demo</Link> (sample data).
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── Why code ─────────────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="home-compare">
        <div className={styles.wrap}>
          <p className={styles.kicker}>Why it&apos;s different</p>
          <h2 id="home-compare" className={styles.h2}>Build the model instead of playing the market</h2>
          <CompareTable />
        </div>
      </section>

      {/* ── Trust + founder ──────────────────────────────── */}
      <section className={styles.section} aria-labelledby="home-trust">
        <div className={`${styles.wrap} ${styles.grid2}`}>
          <div>
            <p className={styles.kicker}>Private by default</p>
            <h2 id="home-trust" className={styles.h2}>Safe for students and schools</h2>
            <ul className={styles.checks}>
              <li>Built for ages 13–18. No ads, and we never sell data.</li>
              <li>No public profiles, and no leaderboards with names.</li>
              <li>Student work is private to the student (and their leader, in a club) unless they share it.</li>
              <li>Students can delete their account and everything in it at any time.</li>
            </ul>
            <p className={styles.fine}>
              <Link href="/privacy" className={styles.textLink}>Read the privacy page</Link>
            </p>
          </div>
          <div className={home.founder}>
            <p className={styles.kicker}>Why this exists</p>
            <blockquote className={home.quote}>
              <p>
                I qualified for AIME in 8th grade and went looking for what came next. High-school finance stopped at
                &ldquo;pick a stock&rdquo;; the real math was behind doors I couldn&apos;t walk through. So I built the
                lab I wanted, and made it free for students. Quant finance shouldn&apos;t require the right zip code.
              </p>
              <footer>Isaac, founder (and a high-school student)</footer>
            </blockquote>
            <Link href="/about" className={styles.textLink}>More about StrikeLab</Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="home-faq">
        <div className={styles.narrow}>
          <h2 id="home-faq" className={styles.h2}>Questions</h2>
          <Faq items={FAQS} />
        </div>
      </section>

      {/* ── Final CTA: both doors again ──────────────────── */}
      <section className={`${styles.section} ${styles.center}`} aria-labelledby="home-cta">
        <div className={styles.wrap}>
          <h2 id="home-cta" className={styles.h2}>Start tonight. It&apos;s free.</h2>
          <p className={styles.lede}>One short lesson at a time, from what a stock is to Black-Scholes.</p>
          <div className={`${styles.ctaRow} ${home.centerRow}`}>
            <Link href="/learn/inv-1.1?src=home-cta" className={styles.primary}>Start lesson 1</Link>
            <Link href="/pilot?src=home-cta" className={styles.secondary}>Run it with your club</Link>
          </div>
          <p className={styles.fine}>
            Want to talk it through first?{" "}
            <TrackedAnchor href={pilotCallHref("home")} event="pilot_call_click" eventProps={{ page: "home" }} className={styles.textLink}>
              Book 15 minutes with the founder
            </TrackedAnchor>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
