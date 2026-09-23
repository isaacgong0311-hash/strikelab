import Link from "next/link";
import Faq from "@/components/marketing/Faq";
import styles from "@/components/marketing/marketing.module.css";
import { pageMetadata } from "@/lib/seo";
import { LAB_WEEKS, pilotCallHref } from "@/lib/marketing/lab";

export const metadata = pageMetadata({
  path: "/pilot",
  title: "Run a free pilot with your club",
  description:
    "Run StrikeLab's six-week quant lab with your club this term, free. One 45–60 minute meeting a week; students code real market models and finish with a capstone.",
});

const SETUP_HREF = `/sign-up?next=${encodeURIComponent("/settings#classroom")}`;

const FAQS = [
  { q: "Do I need a finance or coding background?", a: "No. The platform teaches; you run the meeting. Each week comes with a goal, discussion prompts, common sticking points and a message you can send your students." },
  { q: "What devices do students need?", a: "Any laptop or Chromebook with a modern browser. Python runs in the browser, so there's nothing to install. Phones work for the short lessons; the coding exercises are easier on a laptop." },
  { q: "My school needs to approve outside tools. What do you collect?", a: "Only what's needed to run the program: an email, a display name, and progress in the lessons you assign. Nothing is public, there are no ads, and students can delete their account at any time. We'll help with your district's data agreement." },
  { q: "How many students?", a: "10 to 25 is the sweet spot for a club. Smaller works too." },
  { q: "What does it cost after the pilot?", a: "$199/year for a club or $499/year for a school instructor, if you want to continue. Nothing bills automatically, and students never pay." },
  { q: "What if our schedule has a break in the middle?", a: "Mark break weeks when you set it up (Thanksgiving, exams, spring break). Nothing is due on a break, and due dates shift for you." },
];

export default function PilotPage() {
  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.kicker}>Free pilot · this term</p>
          <h1 className={styles.h1}>Run the six-week quant lab with your club, free.</h1>
          <p className={styles.lede}>
            One 45–60 minute meeting a week. Students code real market models in the browser and finish with a
            capstone they can show. You get a weekly plan, ready-to-send messages, and a scorecard of who&apos;s active
            and who needs help.
          </p>
          <div className={styles.ctaRow}>
            <Link href={SETUP_HREF} className={styles.primary}>Set it up now</Link>
            <a href={pilotCallHref("pilot")} className={styles.secondary}>Talk to the founder first</a>
          </div>
          <p className={styles.fine}>
            Setup takes a few minutes. Want to look around first? <Link href="/demo" className={styles.textLink}>See the demo</Link>.
          </p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="pilot-how">
        <div className={styles.wrap}>
          <h2 id="pilot-how" className={styles.h2}>How it works</h2>
          <div className={styles.grid3} style={{ marginTop: "1.5rem" }}>
            <div className={styles.card}>
              <span className={styles.step} aria-hidden="true">1</span>
              <h3 className={styles.h3}>Set up in minutes</h3>
              <p className={styles.body}>Create your class, pick your first meeting date and any break weeks, and share one invite link.</p>
            </div>
            <div className={styles.card}>
              <span className={styles.step} aria-hidden="true">2</span>
              <h3 className={styles.h3}>Meet once a week</h3>
              <p className={styles.body}>Students work through short steps and real code; you run a 45–60 minute session with the week&apos;s plan.</p>
            </div>
            <div className={styles.card}>
              <span className={styles.step} aria-hidden="true">3</span>
              <h3 className={styles.h3}>See it working</h3>
              <p className={styles.body}>Your scorecard shows who started, who&apos;s active each week and who needs a nudge. Week 6 ends in capstones.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="pilot-weeks">
        <div className={styles.wrap}>
          <h2 id="pilot-weeks" className={styles.h2}>What your students build</h2>
          <div className={styles.grid3} style={{ marginTop: "1.5rem" }}>
            {LAB_WEEKS.map((w) => (
              <div key={w.week} className={styles.card}>
                <p className={styles.kicker} style={{ margin: 0 }}>Week {w.week}</p>
                <h3 className={styles.h3}>{w.title}</h3>
                <p className={styles.body}>{w.builds}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="pilot-deal">
        <div className={styles.wrap}>
          <h2 id="pilot-deal" className={styles.h2}>The deal</h2>
          <div className={styles.grid2} style={{ marginTop: "1.5rem" }}>
            <div className={styles.card}>
              <h3 className={styles.h3}>You bring</h3>
              <ul className={styles.checks}>
                <li>A weekly meeting time, in person or online</li>
                <li>Your students (10–25 is ideal)</li>
                <li>School approval, if your school requires it</li>
                <li>A 15-minute conversation at the end about what worked</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.h3}>StrikeLab brings</h3>
              <ul className={styles.checks}>
                <li>The platform, free for every student</li>
                <li>A plan for each week, so no finance or coding background is needed</li>
                <li>A scorecard and CSV of your club&apos;s progress</li>
                <li>Direct help from the founder: a kickoff call and quick weekly check-ins</li>
              </ul>
            </div>
          </div>
          <p className={styles.note} style={{ marginTop: "1rem" }}>
            <strong>After the pilot:</strong> keep going for $199/year per club or $499/year per school instructor, or
            stop. That&apos;s a conversation for later, not a condition of the pilot.
          </p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="pilot-faq">
        <div className={styles.narrow}>
          <h2 id="pilot-faq" className={styles.h2}>Questions leaders ask</h2>
          <Faq items={FAQS} />
          <div className={`${styles.ctaRow}`}>
            <Link href={SETUP_HREF} className={styles.primary}>Set it up now</Link>
            <a href={pilotCallHref("pilot-faq")} className={styles.secondary}>Talk to the founder</a>
          </div>
        </div>
      </section>
    </div>
  );
}
