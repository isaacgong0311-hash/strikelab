import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import ProofStrip from "@/components/marketing/ProofStrip";
import { ActionLink } from "@/components/ui/Action";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { PLANNED_SEASON, seasonPhase, shortSeasonDate } from "@/lib/seasons/planned";
import styles from "./about.module.css";

export const metadata = pageMetadata({
  path: "/about",
  title: "About",
  description:
    "Why a high school freshman and AIME qualifier built a quant finance platform for high schoolers — and how StrikeLab has grown since the first commit.",
});

// The Season 1 row's state follows the calendar instead of going stale.
export const revalidate = 3600;

// sameAs is deliberately just the GitHub repo owner profile — the one
// externally-verifiable identity link that actually exists in the codebase.
// Not padding this out with AoPS/social URLs that aren't confirmed; a wrong
// sameAs is worse than a short one, since it misattributes the entity.
const FOUNDER_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Isaac Gong",
  jobTitle: "Founder",
  description: "High school freshman and AIME qualifier; founder and sole developer of StrikeLab.",
  url: "https://strikelab.dev/about",
  sameAs: ["https://github.com/isaacgong0311-hash"],
  worksFor: { "@id": "https://strikelab.dev/#organization" },
};

type State = "done" | "current" | "planned";

const SEASON_DATES = `${shortSeasonDate(PLANNED_SEASON.startsOn)} to ${shortSeasonDate(PLANNED_SEASON.endsOn)}`;

function timeline(seasonState: State): { date: string; event: string; state: State }[] {
  return [
    { date: "Nov 2025", event: "First commit. Black-Scholes engine in Python.", state: "done" },
    { date: "Dec 2025", event: "First lesson written. Pyodide playground prototype.", state: "done" },
    { date: "Jan 2026", event: "Lessons 1–5 published. Soft launch on AoPS forums.", state: "done" },
    { date: "Feb 2026", event: "Lessons 6 (Gamma) and 7 (Vega) added. Greek visualizer ships.", state: "done" },
    { date: "Mar 2026", event: "Public launch. Shared on AoPS and math competition forums.", state: "done" },
    { date: "May 2026", event: "Lessons 8–10: Implied Vol, Option Strategies, Binomial Trees. 10-lesson curriculum complete.", state: "done" },
    { date: "Jun 2026", event: "Weekly coding challenges ship.", state: "done" },
    { date: "Jul 2026", event: "Real per-student leaderboard tracking ships.", state: "done" },
    { date: "Aug 2026", event: "Paper-trading sandbox ships — $100,000 in simulated cash, options priced live with the same Black-Scholes engine from the lessons.", state: "done" },
    { date: "Aug 2026", event: "Rho lesson ships — the fifth Greek. Options Pricing is now an 11-lesson track, 22 lessons total across the curriculum.", state: "done" },
    { date: "Aug 2026", event: "Curriculum rebalanced toward investing: 3 new Investing Fundamentals lessons (bonds, retirement accounts, common mistakes), Quant Investing trimmed to its 3 clearest lessons, and every lesson now opens with a \"before this lesson\" prereq box. 23 lessons total.", state: "done" },
    { date: "Aug 2026", event: "Interactive payoff diagrams and a clickable binomial tree lattice ship in the Option Strategies and Binomial Trees lessons.", state: "done" },
    { date: "Aug 2026", event: "Certificates of completion and Discord integration ship.", state: "done" },
    { date: "Aug 2026", event: "Classroom rosters ship — teachers create a class in Settings, students join with a code.", state: "done" },
    { date: "Sep 2026", event: "Six-week club lab ships: cohort launch, invite links, a student home, a leader scorecard and private capstones.", state: "done" },
    { date: "Oct 2026", event: "The paper-trading sandbox and the old challenges are retired. Seasons replace them: timed challenges with per-student numbers, official scores computed by StrikeLab and handle-only leaderboards.", state: "done" },
    { date: "Nov 30, 2026", event: `${PLANNED_SEASON.title}: three weekly challenges, ${SEASON_DATES}.`, state: seasonState },
    { date: "Jan 2027", event: "First Intensive cohort: six weeks, ending in a capstone defended live.", state: "planned" },
  ];
}

const STATE_LABEL: Record<State, string> = { done: "Shipped", current: "Happening now", planned: "Planned" };

const VALUES = [
  {
    title: "Build to learn",
    body: "We don't teach passively. Every concept ends with a function you implement, a test you pass, a curve you can move.",
  },
  {
    title: "Open by default",
    body: "The pricing engine is on GitHub. The curriculum is free for students. Gatekeeping is what we're fighting.",
  },
  {
    title: "Math is the floor",
    body: "Built for students who already love AMC / AIME math. We trust you to handle the rigor — and we reward you for it.",
  },
];

// Not third-party press — StrikeLab hasn't been covered anywhere yet. These
// are our own milestones, labeled as such rather than dressed up as "Press &
// Recognition," which implied outside coverage that doesn't exist.
const MILESTONES = [
  "AoPS forum launch thread (March 2026)",
  "10-lesson curriculum shipped (May 2026)",
  "Club pilot program and cohort tools built (Sep 2026)",
];

export default function AboutPage() {
  const phase = seasonPhase(new Date(), PLANNED_SEASON.startsOn, PLANNED_SEASON.endsOn);
  const seasonState: State = phase.kind === "upcoming" ? "planned" : phase.kind === "live" ? "current" : "done";
  const entries = timeline(seasonState);

  return (
    <div className={styles.page}>
      <JsonLd data={breadcrumbJsonLd([{ name: "About", path: "/about" }])} />
      <JsonLd data={FOUNDER_JSON_LD} />
      <Breadcrumbs trail={[{ name: "About", path: "/about" }]} />

      <header className={styles.header}>
        <h1 className={styles.title}>Built by a high schooler<br />for high schoolers.</h1>
        <p className={styles.lede}>
          StrikeLab started as a personal pricing engine — a way to actually understand
          what Black-Scholes does, not just stare at it on a textbook page. The platform
          you&rsquo;re looking at is the version I wish I&rsquo;d had a year ago.
        </p>
      </header>

      {/* Sourced pilot outcomes; renders nothing until real, consented numbers exist (src/lib/proof/data.ts). */}
      <ProofStrip />

      <section className={styles.founder} aria-labelledby="about-founder">
        <div className={styles.nameplate}>
          <p className={styles.role}>Founder</p>
          <h2 id="about-founder" className={styles.name}>Isaac<br />Gong</h2>
          <dl className={styles.facts}>
            <div><dt>School</dt><dd>High-school freshman</dd></div>
            <div><dt>Math</dt><dd>AIME qualifier</dd></div>
            <div><dt>Writes</dt><dd>C++, Python, R, SQL</dd></div>
          </dl>
        </div>
        <div className={styles.story}>
          <p>
            I qualified for AIME in 8th grade and immediately started looking for what came after.
            The honest answer was: a wall. Adult MOOCs assumed grad-level math.
            High school finance comps stopped at &ldquo;pick a stock.&rdquo; The good stuff
            was on Bloomberg terminals at hedge funds I couldn&rsquo;t walk into.
          </p>
          <p>
            So I built the resource I needed. StrikeLab is a multi-year project — the pricing
            engine, the curriculum, and a six-week lab that clubs can run. If you&rsquo;re a student staring at the same wall, this is for you.
          </p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="about-mission">
        <h2 id="about-mission" className={styles.h2}>Quant finance shouldn&rsquo;t require the right zip code.</h2>
        <p className={styles.body}>
          Whether a high-school student meets Black-Scholes before college shouldn&rsquo;t depend on which school they
          go to or who they know. That gap isn&rsquo;t about talent. It&rsquo;s about access, and StrikeLab is free
          for students so that access doesn&rsquo;t decide it.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="about-values">
        <h2 id="about-values" className={styles.h2}>How we build</h2>
        <ul className={styles.values}>
          {VALUES.map((v) => (
            <li key={v.title}>
              <h3 className={styles.h3}>{v.title}</h3>
              <p>{v.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="about-timeline">
        <h2 id="about-timeline" className={styles.h2}>What we&rsquo;ve shipped (and what&rsquo;s next)</h2>
        <ol className={styles.timeline}>
          {entries.map((t) => (
            <li key={`${t.date}-${t.event}`} className={styles[t.state]}>
              <span className={styles.marker} aria-hidden="true" />
              <span className={styles.date}>{t.date}</span>
              <span className={styles.event}>
                {t.event}
                {t.state !== "done" && <span className={styles.stateLabel}> · {STATE_LABEL[t.state]}</span>}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="about-milestones">
        <h2 id="about-milestones" className={styles.h2}>Milestones</h2>
        <ul className={styles.milestones}>
          {MILESTONES.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </section>

      <section className={styles.contact} aria-labelledby="about-contact">
        <h2 id="about-contact" className={styles.h2}>Want to talk?</h2>
        <p className={styles.body}>Press inquiries, school partnerships, or just want to say hi about the project.</p>
        <div className={styles.actions}>
          <ActionLink href="mailto:hello@strikelab.app" variant="secondary">hello@strikelab.app</ActionLink>
          <ActionLink href="https://github.com/isaacgong0311-hash/strikelab" variant="ghost" target="_blank">GitHub →</ActionLink>
        </div>
      </section>
    </div>
  );
}
