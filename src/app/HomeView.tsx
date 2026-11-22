import { getImageProps } from "next/image";
import Link from "next/link";
import HomeLabPreview from "@/components/lab/HomeLabPreview";
import LearningNextStep from "@/components/LearningNextStep";
import { ActionLink, buttonClassName } from "@/components/ui/Action";
import TrackedLink from "@/components/marketing/TrackedLink";
import styles from "@/components/marketing/marketing.module.css";
import home from "./home.module.css";
import { EXAMPLE_CAPSTONES } from "@/lib/demo/exampleCapstones";
import { TRACKS } from "@/lib/tracks";
import { PRACTICE_MINUTES } from "@/lib/seasons/practice";
import { PLANNED_SEASON, seasonPhase, shortSeasonDate } from "@/lib/seasons/planned";

const TOTAL_LESSONS = TRACKS.reduce((n, t) => n + t.lessons.length, 0);
const seasonDates = `${shortSeasonDate(PLANNED_SEASON.startsOn)} to ${shortSeasonDate(PLANNED_SEASON.endsOn)}`;

/* The practice-round screenshot, captured locally from /seasons/practice with
   a fixed seed (sample numbers only, no account, no personal data). Desktop
   shows the whole workspace; phones get the editor crop so the code stays
   readable at 343px. */
const SHOT_ALT =
  "The practice round workspace with sample numbers S = 51, r = 0.04 and T = 1: forward_price written in Python and the result All 4 checks passed.";
const { props: shotDesktop } = getImageProps({
  src: "/home/practice-round.png", width: 2560, height: 1180, alt: SHOT_ALT, sizes: "(max-width: 860px) 100vw, 720px",
});
const { props: shotMobile } = getImageProps({
  src: "/home/practice-round-mobile.png", width: 684, height: 524, alt: SHOT_ALT, sizes: "100vw",
});

/**
 * The homepage, remodel v2 (2026-11-22). One screen of hero, then the three
 * things a student does here (train, compete, prove) with the real practice
 * workspace as the picture, then one short door for clubs and one line on
 * student data. Everything else lives on its own page. Server-rendered, no
 * reveal animation, and every number comes from the curriculum or the season
 * constants, never typed by hand.
 */
export default function HomeView() {
  const [capstone] = EXAMPLE_CAPSTONES;
  const phase = seasonPhase(new Date(), PLANNED_SEASON.startsOn, PLANNED_SEASON.endsOn);
  const seasonStatus =
    phase.kind === "upcoming" ? `${PLANNED_SEASON.title} opens in ${phase.days} ${phase.days === 1 ? "day" : "days"}`
    : phase.kind === "live" ? `${PLANNED_SEASON.title} is live, through ${shortSeasonDate(PLANNED_SEASON.endsOn)}`
    : `${PLANNED_SEASON.title} ran ${seasonDates}`;
  const seasonRuns = phase.kind === "ended" ? "ran" : "runs";

  return (
    <div className={styles.page}>
      <section className={home.hero} aria-labelledby="home-title">
        <div className={`${styles.wrap} ${home.heroGrid}`}>
          <div className={home.heroCopy}>
            <p className={home.status}><span className={home.dot} aria-hidden="true" />{seasonStatus} · free for students</p>
            <h1 id="home-title" className={home.headline}>Learn quant finance.<br /><em>Then prove it.</em></h1>
            <p className={home.heroLede}>
              Short lessons and real Python in your browser. Then free timed
              challenges with numbers only you get, ranked under a handle, and
              a record you can show.
            </p>
            <div className={home.ctaRow}>
              <TrackedLink href="/seasons/practice?src=home-hero" event="hero_cta" eventProps={{ target: "practice-round" }} className={buttonClassName({ className: home.cta })}>
                Try a practice round
              </TrackedLink>
              <TrackedLink href="/seasons?src=home-hero" event="hero_cta" eventProps={{ target: "season" }} className={buttonClassName({ variant: "secondary", className: home.cta })}>
                Join {PLANNED_SEASON.title}
              </TrackedLink>
            </div>
            <p className={home.heroFine}>
              No installs, no signup to start. New to finance? <Link href="/learn/inv-1.1?src=home-hero" className={styles.textLink}>Start with lesson 1</Link>.
            </p>
            <LearningNextStep />
          </div>
          <HomeLabPreview />
        </div>
      </section>

      {/* ── What a student does: train, compete, prove ─────────── */}
      <section className={home.section} aria-labelledby="home-loop">
        <div className={styles.wrap}>
          <h2 id="home-loop" className={home.h2}>Train, compete, prove it.</h2>
          <ol className={home.loop}>
            <li className={home.step}>
              <span className={home.stepNum} aria-hidden="true">01</span>
              <h3 className={home.h3}>Train</h3>
              <p className={home.body}>
                {TOTAL_LESSONS} short lessons. Fill in the missing function, press Run, and tests tell you whether your model is right.
              </p>
              <ul className={home.tracks} aria-label="Tracks">
                {TRACKS.map((t) => (
                  <li key={t.id}><span>{t.title}</span><span className={home.trackCount}>{t.lessons.length}</span></li>
                ))}
              </ul>
              <Link href="/lessons?src=home-loop" className={home.more}>Browse the lessons</Link>
            </li>
            <li className={home.step}>
              <span className={home.stepNum} aria-hidden="true">02</span>
              <h3 className={home.h3}>Compete</h3>
              <p className={home.body}>
                {PLANNED_SEASON.title} {seasonRuns} {seasonDates}: one timed challenge a week, with numbers nobody else gets and
                the AI tutor off. StrikeLab scores it after you submit, and you&apos;re ranked under a handle.
              </p>
              <Link href="/seasons?src=home-loop" className={home.more}>How seasons work</Link>
            </li>
            <li className={home.step}>
              <span className={home.stepNum} aria-hidden="true">03</span>
              <h3 className={home.h3}>Prove</h3>
              <p className={home.body}>
                Explain why your code works. Top finishes and capstones are checked in a short live conversation before they
                count, so your record means something.
              </p>
              <Link href={`/demo/capstone/${capstone.slug}`} className={home.more}>Read an example capstone</Link>
            </li>
          </ol>

          <div className={home.practice}>
            <div className={home.practiceCopy}>
              <h3 className={home.h3}>Try the practice round first</h3>
              <p className={home.body}>
                The same workspace as a season challenge: your own numbers, a {PRACTICE_MINUTES}-minute clock that
                doesn&apos;t pause, and checks you run yourself. Nothing is scored, and no account is needed.
              </p>
              <TrackedLink href="/seasons/practice?src=home-practice" event="hero_cta" eventProps={{ target: "practice-round-shot" }} className={buttonClassName({ variant: "secondary", className: home.ctaInline })}>
                Start the practice round
              </TrackedLink>
            </div>
            <figure className={home.shot}>
              <picture>
                <source media="(max-width: 860px)" srcSet={shotMobile.srcSet} sizes={shotMobile.sizes} width={684} height={524} />
                {/* getImageProps gives next/image's optimized srcSet and the alt; <picture> picks the crop. */}
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <img {...shotDesktop} />
              </picture>
              <figcaption>The practice round, with sample numbers.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ── Clubs, and how student data is handled ────────────── */}
      <section className={`${home.section} ${home.band}`} aria-labelledby="home-clubs">
        <div className={`${styles.wrap} ${home.clubs}`}>
          <div>
            <h2 id="home-clubs" className={home.h2Small}>For clubs and teachers</h2>
            <p className={home.body}>
              Bring your club into the season for free: one invite link, a private handle-only board, and a six-week meeting
              plan if you want one.
            </p>
          </div>
          <div className={home.clubActions}>
            <ActionLink href="/pilot?src=home-clubs" className={home.cta}>Set up your club</ActionLink>
            <Link href="/clubs?src=home-clubs" className={home.more}>Bring your club: how it works</Link>
          </div>
        </div>
        <div className={styles.wrap}>
          <p className={home.trust}>
            Built with student privacy in mind: for ages 13 to 18, no ads, no data sales, and boards show a handle, never a
            name. <Link href="/trust" className={styles.textLink}>How StrikeLab handles student data</Link>
          </p>
        </div>
      </section>

      {/* ── Close ─────────────────────────────────────────────── */}
      <section className={`${home.section} ${home.close}`} aria-labelledby="home-cta">
        <div className={`${styles.wrap} ${home.closeRow}`}>
          <h2 id="home-cta" className={home.h2}>Start tonight. It&apos;s free.</h2>
          <div className={home.closeActions}>
            <ActionLink href="/learn/inv-1.1?src=home-cta" className={home.cta}>Start lesson 1</ActionLink>
            <ActionLink href="/seasons?src=home-cta" variant="secondary" className={home.cta}>Join {PLANNED_SEASON.title}</ActionLink>
          </div>
        </div>
      </section>
    </div>
  );
}
