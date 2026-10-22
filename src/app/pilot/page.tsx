import Link from "next/link";
import Faq from "@/components/marketing/Faq";
import styles from "@/components/marketing/marketing.module.css";
import { pageMetadata } from "@/lib/seo";
import { LAB_WEEKS, pilotCallHref } from "@/lib/marketing/lab";
import { TrackedAnchor } from "@/components/marketing/TrackedLink";
import TrackPageView from "@/components/marketing/TrackPageView";
import PilotPreview from "./PilotPreview";

export const metadata = pageMetadata({
  path: "/pilot",
  title: "Set up your club for Season 1",
  description:
    "Create your free StrikeLab club, share one invite link, and compete together in Season 1. Your club's board appears on Seasons; a six-week meeting plan is included.",
});

// Signed-out leaders are sent through sign-up and back to setup.
const SETUP_HREF = "/teach/new?src=pilot";

const FAQS = [
  { q: "Do I need a finance or coding background?", a: "No. The platform teaches; you run the meeting. Each week comes with a goal, discussion prompts, common sticking points and a message you can send your students." },
  { q: "What devices do students need?", a: "A laptop or Chromebook with a modern browser. Python runs in the browser, so there's nothing to install. Phones work for the short lessons; the coding exercises are easier on a laptop." },
  { q: "My school needs to approve outside tools. What do you collect?", a: "We collect account details and learning progress needed to run the club. Season boards show handles, not student names; student work stays private unless they choose to share it. There are no ads, and students can delete their account. If your school has a data agreement or form, email it to us and we'll go through it with you." },
  { q: "How many students?", a: "The lab is designed for a club-sized group, roughly 10 to 25 students. Smaller works too." },
  { q: "What does it cost?", a: "Club setup, Season 1 participation, and the six-week lab are free. Students never pay to participate. Other programs are listed on the pricing page." },
  { q: "What if our schedule has a break in the middle?", a: "Mark break weeks when you set it up (Thanksgiving, exams, spring break). Nothing is due on a break, and due dates shift for you." },
];

export default function PilotPage() {
  return (
    <div className={styles.page}>
      <TrackPageView event="pilot_page_view" />
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.kicker}>Clubs · Season 1</p>
          <h1 className={styles.h1}>Set up your club for Season 1.</h1>
          <p className={styles.lede}>
            Create your club, share one link, and let students join for free. They&apos;ll compete in timed quant
            challenges, and your club&apos;s own board will appear on <Link href="/seasons" className={styles.textLink}>Seasons</Link>.
            Want a plan for every meeting? The six-week lab is included.
          </p>
          <div className={styles.ctaRow}>
            <Link href={SETUP_HREF} className={styles.primary}>Create your club</Link>
            <TrackedAnchor href={pilotCallHref("pilot")} event="pilot_call_click" eventProps={{ page: "pilot" }} className={styles.secondary}>Talk to the founder first</TrackedAnchor>
          </div>
          <p className={styles.fine}>
            Setup takes a few minutes. Want to look around first? <Link href="/demo" className={styles.textLink}>See the demo</Link>.
          </p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="pilot-how">
        <div className={styles.wrap}>
          <h2 id="pilot-how" className={styles.h2}>How it works</h2>
          <div className={styles.stepsGrid} style={{ marginTop: "1.5rem" }}>
            <div className={styles.card}>
              <span className={styles.step} aria-hidden="true">1</span>
              <h3 className={styles.h3}>Create the club</h3>
              <p className={styles.body}>Set up your club in a few minutes. You can add a meeting plan and break weeks if you want them.</p>
            </div>
            <div className={styles.card}>
              <span className={styles.step} aria-hidden="true">2</span>
              <h3 className={styles.h3}>Share one link</h3>
              <p className={styles.body}>Copy the invite link from your club page and send it to students.</p>
            </div>
            <div className={styles.card}>
              <span className={styles.step} aria-hidden="true">3</span>
              <h3 className={styles.h3}>Students join</h3>
              <p className={styles.body}>They create a free account, join your club, and take on the season challenges.</p>
            </div>
            <div className={styles.card}>
              <span className={styles.step} aria-hidden="true">4</span>
              <h3 className={styles.h3}>Your board appears</h3>
              <p className={styles.body}>Once Season 1 is live, club members can see their handle-only board on <Link href="/seasons" className={styles.textLink}>Seasons</Link>.</p>
            </div>
          </div>
        </div>
      </section>

      <PilotPreview />

      <section className={styles.section} aria-labelledby="pilot-weeks">
        <div className={styles.wrap}>
          <h2 id="pilot-weeks" className={styles.h2}>Want a plan for every meeting? It&apos;s included.</h2>
          <p className={styles.lede}>The optional six-week lab gives you weekly goals, ready-to-send messages, a scorecard, and a capstone for students who want to go deeper.</p>
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
          <h2 id="pilot-deal" className={styles.h2}>What your club gets</h2>
          <div className={styles.grid2} style={{ marginTop: "1.5rem" }}>
            <div className={styles.card}>
              <h3 className={styles.h3}>You bring</h3>
              <ul className={styles.checks}>
                <li>A club leader to create the club and share its invite link</li>
                <li>Your students (the lab is designed for roughly 10–25)</li>
                <li>School approval, if your school requires it</li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.h3}>StrikeLab brings</h3>
              <ul className={styles.checks}>
                <li>Season 1 challenges and your club&apos;s handle-only board</li>
                <li>The optional six-week meeting plan, free for every student</li>
                <li>A scorecard and CSV of your club&apos;s progress</li>
                <li>A demo and a way to ask the founder for help</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="pilot-faq">
        <div className={styles.narrow}>
          <h2 id="pilot-faq" className={styles.h2}>Questions leaders ask</h2>
          <Faq items={FAQS} />
          <div className={`${styles.ctaRow}`}>
            <Link href={SETUP_HREF} className={styles.primary}>Create your club</Link>
            <TrackedAnchor href={pilotCallHref("pilot-faq")} event="pilot_call_click" eventProps={{ page: "pilot-faq" }} className={styles.secondary}>Talk to the founder</TrackedAnchor>
          </div>
        </div>
      </section>
    </div>
  );
}
