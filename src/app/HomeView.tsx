import Link from "next/link";
import HomeLabPreview from "@/components/lab/HomeLabPreview";
import LearningNextStep from "@/components/LearningNextStep";
import Faq from "@/components/marketing/Faq";
import styles from "@/components/marketing/marketing.module.css";
import home from "./home.module.css";
import { EXAMPLE_CAPSTONES } from "@/lib/demo/exampleCapstones";
import { getCapstonePrompt } from "@/lib/capstone/prompts";
import { TRACKS } from "@/lib/tracks";
import { pilotCallHref } from "@/lib/marketing/lab";
import TrackedLink, { TrackedAnchor } from "@/components/marketing/TrackedLink";
import { PLANNED_SEASON, seasonPhase, shortSeasonDate } from "@/lib/seasons/planned";

const TOTAL_LESSONS = TRACKS.reduce((n, t) => n + t.lessons.length, 0);
const seasonStart = shortSeasonDate(PLANNED_SEASON.startsOn);
const seasonDates = `${seasonStart} to ${shortSeasonDate(PLANNED_SEASON.endsOn)}`;

const FAQS = [
  { q: "Do I need to know finance or coding?", a: "No. Lesson 1 starts at what a stock is. Python comes in gradually, with the hard parts already written, and it runs in your browser." },
  { q: "What is a season?", a: `${PLANNED_SEASON.title} runs ${seasonDates}. One challenge opens each week; when you start it, a timer starts and the AI tutor switches off until you submit. Your numbers are yours alone. StrikeLab computes the official score after you submit and usually posts it within a day. The leaderboard shows a handle, never your name.` },
  { q: "What does it cost?", a: "Students never pay: every lesson, the playground and every season are free, and clubs play free. The one paid option is the January Intensive for parents, and nothing is charged until a cohort fills." },
  { q: "Do I need an account?", a: "Not to start. Progress saves on this device; a free account syncs it across devices and keeps your code." },
  { q: "I lead a club. How much prep is it?", a: "Light. Each week comes with a goal, discussion prompts, common sticking points and a message to send, and the lessons do the teaching. Read the week's plan before you meet. We're timing the real prep in the first pilots and will tell you the number." },
  { q: "Is it safe for students?", a: "It's built for ages 13–18: no ads, no public profiles, leaderboards show a handle and never a real name, work is private unless the student shares it, and accounts can be deleted at any time." },
];

/**
 * One homepage for both audiences (decision log 2026-09-30), now led by the
 * loop the product is built around (remodel plan R2, 2026-11-16): train,
 * compete in a season, prove it. The Market Lab card stays as the interactive
 * hook. Independent students and club leaders each keep a door in the hero
 * and a section of their own. Server-rendered end to end; every number comes
 * from the curriculum or the season constants, never typed by hand.
 */
export default function HomeView() {
  const [pricing, backtest] = EXAMPLE_CAPSTONES;
  const phase = seasonPhase(new Date(), PLANNED_SEASON.startsOn, PLANNED_SEASON.endsOn);
  const seasonStatus =
    phase.kind === "upcoming" ? `${PLANNED_SEASON.title} opens in ${phase.days} ${phase.days === 1 ? "day" : "days"}`
    : phase.kind === "live" ? `${PLANNED_SEASON.title} is live`
    : `${PLANNED_SEASON.title} has ended`;

  return (
    <div className={styles.page}>
      <section className={home.hero} aria-labelledby="home-title">
        <div className={`${styles.wrap} ${home.heroGrid}`}>
          <div>
            <p className={home.eyebrow}><span /> {seasonStatus} · free for students</p>
            <h1 id="home-title" className={home.headline}>Learn quant finance.<br /><em>Then prove it.</em></h1>
            <p className={home.heroLede}>
              Short lessons and real Python in your browser. Then free timed
              challenges with numbers only you get, ranked under a handle, and
              a record you can show.
            </p>
            <div className={styles.ctaRow}>
              <TrackedLink href="/seasons/practice?src=home-hero" event="hero_cta" eventProps={{ target: "practice-round" }} className={home.heroPrimary}>Try a practice round <span aria-hidden="true">→</span></TrackedLink>
              <TrackedLink href="/seasons?src=home-hero" event="hero_cta" eventProps={{ target: "season" }} className={home.heroSecondary}>Join {PLANNED_SEASON.title} →</TrackedLink>
            </div>
            <p className={home.heroFine}>Free for students. No installs. No signup to start. New to finance? <Link href="/learn/inv-1.1?src=home-hero" className={styles.textLink}>Start with lesson 1</Link>.</p>
            <LearningNextStep />
          </div>
          <HomeLabPreview />
        </div>
        <div className={`${styles.wrap} ${home.proofStrip}`}>
          <span><strong>{TOTAL_LESSONS}</strong> hands-on lessons</span>
          <span><strong>3</strong> guided experiments</span>
          <span><strong>Python</strong> runs in your browser</span>
          <span><strong>$0</strong> for students</span>
        </div>
      </section>

      <section className={home.leaderBand} aria-label="For clubs and teachers">
        <div className={styles.wrap}><p><strong>Bring your whole club.</strong> Free seasons for your club, a private board, and a six-week meeting plan.</p><Link href="/clubs?src=home-leader-band">Bring your club ↗</Link></div>
      </section>

      {/* ── The loop: train, compete, prove ──────────────── */}
      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="home-loop">
        <div className={styles.wrap}>
          <p className={styles.kicker}>How it works</p>
          <h2 id="home-loop" className={styles.h2}>Train, compete, prove it.</h2>
          <div className={styles.grid3} style={{ marginTop: "1.75rem" }}>
            <div className={styles.card}>
              <span className={styles.step} aria-hidden="true">1</span>
              <h3 className={styles.h3}>Train</h3>
              <p className={styles.body}>Short lessons, then real Python: fill in the missing function, press Run, and tests tell you whether your model is right. Nothing to install.</p>
              <p className={styles.body}><Link href="/lessons?src=home-loop" className={styles.textLink}>See the {TOTAL_LESSONS} lessons →</Link></p>
            </div>
            <div className={styles.card}>
              <span className={styles.step} aria-hidden="true">2</span>
              <h3 className={styles.h3}>Compete in a season</h3>
              <p className={styles.body}>One timed challenge a week with numbers nobody else gets and the AI tutor off. StrikeLab computes your official score after you submit and usually posts it within a day. You&apos;re ranked under a handle.</p>
              <p className={styles.body}><Link href="/seasons?src=home-loop" className={styles.textLink}>See how seasons work →</Link></p>
            </div>
            <div className={styles.card}>
              <span className={styles.step} aria-hidden="true">3</span>
              <h3 className={styles.h3}>Prove it</h3>
              <p className={styles.body}>Explain why your code works. Top finishes and capstones are verified in a short live conversation before they count, so the result means something.</p>
              <p className={styles.body}><Link href={`/demo/capstone/${pricing.slug}`} className={styles.textLink}>Read an example capstone →</Link></p>
            </div>
          </div>
          <h3 className={`${styles.h3} ${home.startAnywhere}`}>Start anywhere</h3>
          <div className={styles.grid3} style={{ marginTop: "0.75rem" }}>
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

      {/* ── What students build ──────────────────────────── */}
      <section className={styles.section} aria-labelledby="home-build">
        <div className={styles.wrap}>
          <p className={styles.kicker}>What you build</p>
          <h2 id="home-build" className={styles.h2}>Work you can show, not a quiz score</h2>
          <p className={styles.lede}>
            A capstone is a real question, code that answers it, and an honest result: the kind of project a student can show a
            teacher or put in an application. These two examples were written by the StrikeLab team to show the bar.
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
      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="home-clubs">
        <div className={styles.wrap}>
          <p className={styles.kicker}>For clubs and teachers</p>
          <h2 id="home-clubs" className={styles.h2}>Bring your club. Play the season together.</h2>
          <p className={styles.lede}>
            Your club gets its own private leaderboard for the season, and a six-week plan if you want structure
            between challenges: one invite link, a plan for every meeting, and a view of who&apos;s keeping up. Free.
          </p>
          <div className={styles.ctaRow}>
            <Link href="/pilot?src=home-clubs" className={styles.primary}>Set up your club</Link>
            <Link href="/clubs?src=home-clubs" className={styles.secondary}>How it works for clubs</Link>
          </div>
          <p className={styles.fine}>
            Want to see it first? The <Link href="/demo" className={styles.textLink}>live demo</Link> shows a student&apos;s week and the leader&apos;s scorecard (sample data).
          </p>
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
              <li>No public profiles. Leaderboards show a handle the student picks, never a real name.</li>
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

      {/* ── Final CTA: train now, compete next ──────────────────── */}
      <section className={`${styles.section} ${styles.center}`} aria-labelledby="home-cta">
        <div className={styles.wrap}>
          <h2 id="home-cta" className={styles.h2}>Start tonight. It&apos;s free.</h2>
          <p className={styles.lede}>Train one short lesson at a time, then prove it in {PLANNED_SEASON.title}, starting {shortSeasonDate(PLANNED_SEASON.startsOn)}.</p>
          <div className={`${styles.ctaRow} ${home.centerRow}`}>
            <Link href="/learn/inv-1.1?src=home-cta" className={styles.primary}>Start lesson 1</Link>
            <Link href="/seasons?src=home-cta" className={styles.secondary}>Join {PLANNED_SEASON.title}</Link>
          </div>
          <p className={styles.fine}>
            Leading a club and want to talk it through first?{" "}
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
