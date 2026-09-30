import Link from "next/link";
import Faq from "@/components/marketing/Faq";
import CompareTable from "@/components/marketing/CompareTable";
import styles from "@/components/marketing/marketing.module.css";
import home from "./home.module.css";
import CohortHomeView from "@/app/cohort/[classId]/CohortHomeView";
import { buildDemoData, DEMO_CLASS_NAME } from "@/lib/demo/fixtures";
import { EXAMPLE_CAPSTONES } from "@/lib/demo/exampleCapstones";
import { getCapstonePrompt } from "@/lib/capstone/prompts";
import { LAB_WEEKS, pilotCallHref } from "@/lib/marketing/lab";
import TrackedLink, { TrackedAnchor } from "@/components/marketing/TrackedLink";

const FAQS = [
  { q: "Who is StrikeLab for?", a: "High-school math, coding, investing, economics and DECA clubs, and teachers who want an applied project for AP Stats, Calc or CS. Students are 13–18." },
  { q: "How much prep does the leader need?", a: "None beyond showing up. Each week comes with a goal, prompts, common sticking points and a message to send. The lessons do the teaching." },
  { q: "What does it cost?", a: "Students never pay. Clubs start with a free six-week pilot, then $199/year per club or $499/year per school instructor if they continue." },
  { q: "Can a student use it without a club?", a: "Yes. Every lesson is free and the first one needs no account." },
];

/**
 * Clubs-first homepage (frontend plan FE-2, decision log 2026-09-23).
 * Server-rendered end to end; the hero visual is the real cohort home on
 * Demo Club sample data, marked inert and captioned as sample data.
 */
export default function HomeView() {
  const demo = buildDemoData();
  const [pricing, backtest] = EXAMPLE_CAPSTONES;

  return (
    <div className={styles.page}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className={home.hero}>
        <div className={`${styles.wrap} ${home.heroGrid}`}>
          <div>
            <p className={styles.kicker}>For high-school clubs and teachers</p>
            <h1 className={styles.h1}>A six-week quant lab your club can run tomorrow.</h1>
            <p className={styles.lede}>
              Students code real market models (option pricing, backtests, risk) right in the browser, and finish
              with a capstone they can show. You get a plan for every meeting and a scorecard of who&apos;s keeping up.
              Free for students.
            </p>
            <div className={styles.ctaRow}>
              <TrackedLink href="/pilot?src=home-hero" event="hero_cta" eventProps={{ target: "pilot" }} className={styles.primary}>Start a free pilot</TrackedLink>
              <TrackedLink href="/demo" event="hero_cta" eventProps={{ target: "demo" }} className={styles.secondary}>See the teacher view</TrackedLink>
            </div>
            <p className={styles.fine}>
              Student? <Link href="/learn/inv-1.1" className={styles.textLink}>Try the first lesson</Link>, no signup needed.
            </p>
          </div>
          <figure className={home.heroVisual}>
            <div className={home.phone} inert aria-hidden="true">
              <CohortHomeView
                classId="demo"
                className={DEMO_CLASS_NAME}
                view={demo.studentView}
                capstone={null}
                embedded
              />
            </div>
            <div className={home.peek} aria-hidden="true">
              <span className={home.peekLabel}>Teacher scorecard</span>
              <div className={home.peekRow}>
                <span><b>{demo.metrics.activated.pct}%</b> activated</span>
                <span><b>{demo.metrics.activeThisWeek}</b> active this week</span>
              </div>
              <span className={home.peekHelp}>
                {demo.metrics.students.filter((s) => s.needsHelp).length} student needs a nudge
              </span>
            </div>
            <figcaption className={home.caption}>
              What a student sees in week 3, from the <Link href="/demo" className={styles.textLink}>live demo</Link> (sample data).
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── How a pilot works ────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="home-how">
        <div className={styles.wrap}>
          <p className={styles.kicker}>How it works</p>
          <h2 id="home-how" className={styles.h2}>Set up in minutes. Meet once a week.</h2>
          <div className={styles.grid3} style={{ marginTop: "1.75rem" }}>
            <div className={styles.card}>
              <span className={styles.step} aria-hidden="true">1</span>
              <h3 className={styles.h3}>Launch the lab</h3>
              <p className={styles.body}>Pick your first meeting and any break weeks. Share one invite link; students join free.</p>
            </div>
            <div className={styles.card}>
              <span className={styles.step} aria-hidden="true">2</span>
              <h3 className={styles.h3}>Students build, one step at a time</h3>
              <p className={styles.body}>Short lessons with instant feedback and real Python that runs in the browser. Nothing to install.</p>
            </div>
            <div className={styles.card}>
              <span className={styles.step} aria-hidden="true">3</span>
              <h3 className={styles.h3}>You see it working</h3>
              <p className={styles.body}>Who started, who&apos;s active each week, who needs a nudge, and every capstone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Six weeks ────────────────────────────────────── */}
      <section className={styles.section} aria-labelledby="home-weeks">
        <div className={styles.wrap}>
          <p className={styles.kicker}>The Quant Foundations Lab</p>
          <h2 id="home-weeks" className={styles.h2}>Six weeks, from markets to a capstone</h2>
          <ol className={home.weeks}>
            {LAB_WEEKS.map((w) => (
              <li key={w.week} className={home.week}>
                <span className={home.weekNum} aria-hidden="true">{w.week}</span>
                <div>
                  <h3 className={styles.h3}>
                    <span className="sl-visually-hidden">Week {w.week}: </span>
                    {w.title}
                  </h3>
                  <p className={styles.body}>{w.builds}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── What students build ──────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="home-build">
        <div className={styles.wrap}>
          <p className={styles.kicker}>What students build</p>
          <h2 id="home-build" className={styles.h2}>Work they can show, not a quiz score</h2>
          <p className={styles.lede}>
            Every student finishes with a capstone: a real question, code that answers it, and an honest result.
            These two examples were written by the StrikeLab team to show the bar.
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

      {/* ── Zero prep ────────────────────────────────────── */}
      <section className={styles.section} aria-labelledby="home-leader">
        <div className={styles.wrap}>
          <p className={styles.kicker}>For the leader</p>
          <h2 id="home-leader" className={styles.h2}>No finance background needed. No prep either.</h2>
          <div className={styles.grid3} style={{ marginTop: "1.75rem" }}>
            <div className={styles.card}>
              <h3 className={styles.h3}>A plan for every meeting</h3>
              <p className={styles.body}>The week&apos;s goal, discussion prompts and where students usually get stuck.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.h3}>Messages ready to send</h3>
              <p className={styles.body}>A weekly note with lessons, due date and link, and a friendly nudge for anyone behind.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.h3}>A scorecard you can trust</h3>
              <p className={styles.body}>Activation, weekly activity and retention, computed the same way every time. Export to CSV.</p>
            </div>
          </div>
          <div className={styles.ctaRow}>
            <Link href="/demo" className={styles.secondary}>Click through the teacher view</Link>
          </div>
        </div>
      </section>

      {/* ── Why code ─────────────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="home-compare">
        <div className={styles.wrap}>
          <p className={styles.kicker}>Why it&apos;s different</p>
          <h2 id="home-compare" className={styles.h2}>Students build the model instead of playing the market</h2>
          <CompareTable />
        </div>
      </section>

      {/* ── Trust + founder ──────────────────────────────── */}
      <section className={styles.section} aria-labelledby="home-trust">
        <div className={`${styles.wrap} ${styles.grid2}`}>
          <div>
            <p className={styles.kicker}>Safe for school</p>
            <h2 id="home-trust" className={styles.h2}>Private by default</h2>
            <ul className={styles.checks}>
              <li>Built for ages 13–18. No ads and no selling data.</li>
              <li>No public profiles or leaderboards for students.</li>
              <li>Student work is private to the student and their leader unless the student shares it.</li>
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

      {/* ── FAQ + final CTA ──────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="home-faq">
        <div className={styles.narrow}>
          <h2 id="home-faq" className={styles.h2}>Questions</h2>
          <Faq items={FAQS} />
        </div>
      </section>

      <section className={`${styles.section} ${styles.center}`} aria-labelledby="home-cta">
        <div className={styles.wrap}>
          <h2 id="home-cta" className={styles.h2}>Run the lab with your club this term</h2>
          <p className={styles.lede}>The pilot is free, setup takes minutes, and you can talk to the founder first.</p>
          <div className={styles.ctaRow}>
            <Link href="/pilot?src=home-cta" className={styles.primary}>Start a free pilot</Link>
            <TrackedAnchor href={pilotCallHref("home")} event="pilot_call_click" eventProps={{ page: "home" }} className={styles.secondary}>Talk to the founder</TrackedAnchor>
          </div>
          <p className={styles.fine}>
            Student on your own? <Link href="/learn/inv-1.1" className={styles.textLink}>Start the first lesson</Link> or{" "}
            <Link href="/lessons" className={styles.textLink}>browse the curriculum</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
