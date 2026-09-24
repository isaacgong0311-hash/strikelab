import Link from "next/link";
import Faq from "@/components/marketing/Faq";
import CompareTable from "@/components/marketing/CompareTable";
import styles from "@/components/marketing/marketing.module.css";
import { pageMetadata } from "@/lib/seo";
import { LAB_WEEKS, pilotCallHref } from "@/lib/marketing/lab";
import { TrackedAnchor } from "@/components/marketing/TrackedLink";

export const metadata = pageMetadata({
  path: "/clubs",
  title: "For clubs and teachers",
  description:
    "The technical-finance lab for high-school clubs: a ready-to-run six-week program where students code real market models, with a weekly plan and a scorecard for the leader.",
});

const FOR = ["Math clubs", "Coding and CS clubs", "Investing clubs", "Economics and DECA/FBLA", "Competition teams", "AP Stats, Calc and CS classes"];


const FAQS = [
  { q: "Does the leader need finance or coding experience?", a: "No. The lessons teach the material; the weekly plan tells you how to run the meeting, what to ask, and where students usually get stuck." },
  { q: "Can students use it outside the meeting?", a: "Yes. Lessons are short, run on any laptop or Chromebook, and pick up where each student left off. Most of the work can happen in the meeting if you prefer." },
  { q: "What do I see as the leader?", a: "Who has started, who's active each week, week-4 retention, who needs a nudge (and why), and each student's capstone, with a CSV export for your records." },
  { q: "Is anything public?", a: "No. Student work is private to the student and their leader. A student can create a share link for their capstone, which hides their name and stops working when they turn it off." },
  { q: "Google Classroom or SSO?", a: "Not yet. Students join with one invite link and a free account." },
  { q: "What does it cost?", a: "The pilot is free. After it, $199/year for a club or $499/year for a school instructor. Students never pay." },
];

export default function ClubsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.kicker}>For clubs and teachers</p>
          <h1 className={styles.h1}>The technical-finance lab for high-school clubs.</h1>
          <p className={styles.lede}>
            A ready-to-run six-week program. Students learn by coding real market models in the browser and finish
            with a capstone they can show. You get a plan for every meeting and a clear view of who&apos;s keeping up.
          </p>
          <div className={styles.ctaRow}>
            <Link href="/pilot?src=clubs" className={styles.primary}>Start a free pilot</Link>
            <Link href="/demo" className={styles.secondary}>See the teacher view</Link>
          </div>
          <ul className={styles.list} aria-label="Built for" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1.25rem", listStyle: "none", paddingLeft: 0, marginTop: "1.75rem" }}>
            {FOR.map((f) => (
              <li key={f} style={{ margin: 0 }}>✓ {f}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="clubs-weeks">
        <div className={styles.wrap}>
          <h2 id="clubs-weeks" className={styles.h2}>Six weeks, one meeting each</h2>
          <p className={styles.lede}>From how markets work to a capstone, in order, with nothing to prepare.</p>
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

      <section className={styles.section} aria-labelledby="clubs-leader">
        <div className={styles.wrap}>
          <h2 id="clubs-leader" className={styles.h2}>Zero prep for the leader</h2>
          <div className={styles.grid3} style={{ marginTop: "1.5rem" }}>
            <div className={styles.card}>
              <h3 className={styles.h3}>A plan for every meeting</h3>
              <p className={styles.body}>This week&apos;s goal, discussion prompts and common sticking points, right on your class page.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.h3}>Messages ready to send</h3>
              <p className={styles.body}>A weekly note with the lessons, due date and link, plus a friendly nudge for anyone behind.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.h3}>A scorecard, not a spreadsheet</h3>
              <p className={styles.body}>Who started, who&apos;s active each week, who needs help and why, and every capstone. Export it anytime.</p>
            </div>
          </div>
          <div className={styles.ctaRow}>
            <Link href="/demo" className={styles.secondary}>Try the teacher view with sample data</Link>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="clubs-compare">
        <div className={styles.wrap}>
          <h2 id="clubs-compare" className={styles.h2}>Why code, not a stock game</h2>
          <CompareTable />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="clubs-trust">
        <div className={styles.wrap}>
          <h2 id="clubs-trust" className={styles.h2}>Safe to bring to your school</h2>
          <ul className={styles.checks} style={{ maxWidth: "44rem" }}>
            <li>Built for ages 13–18. No ads, no selling data, no public profiles or leaderboards for students.</li>
            <li>Student work is private to the student and their leader unless the student shares it.</li>
            <li>Students can delete their account and everything in it at any time.</li>
            <li>We&apos;ll help with your district&apos;s student-data agreement. <Link href="/privacy" className={styles.textLink}>Read the privacy page</Link>.</li>
          </ul>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="clubs-faq">
        <div className={styles.narrow}>
          <h2 id="clubs-faq" className={styles.h2}>Questions</h2>
          <Faq items={FAQS} />
          <div className={styles.ctaRow}>
            <Link href="/pilot?src=clubs-cta" className={styles.primary}>Start a free pilot</Link>
            <TrackedAnchor href={pilotCallHref("clubs")} event="pilot_call_click" eventProps={{ page: "clubs" }} className={styles.secondary}>Talk to the founder</TrackedAnchor>
          </div>
          <p className={styles.fine}>
            Teaching AP Stats or AP Calc? See <Link href="/for-teachers" className={styles.textLink}>how the lessons line up</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
