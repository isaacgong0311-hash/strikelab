import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { getAllLessons } from "@/lib/tracks";
import { QUANT_FOUNDATIONS_TEMPLATE } from "@/lib/cohorts/template";
import styles from "./page.module.css";

const PATH = "/guides/start-a-high-school-investing-club";
// The visible trail and the JSON-LD trail share one array so they cannot disagree.
const TRAIL = [
  { name: "For clubs", path: "/clubs" },
  { name: "How to Start a High School Investing Club", path: PATH },
];
const TITLE = "How to Start a High School Investing Club";
const DESCRIPTION =
  "A step-by-step guide for students and teachers: find a sponsor, plan the first meeting, run six weeks, and keep it safe. Free, no installs, works on school Chromebooks.";
export const GUIDE_PUBLISHED = "2026-10-15";

export const metadata = pageMetadata({ path: PATH, title: TITLE, description: DESCRIPTION, type: "article" });

export default function StartAnInvestingClubGuide() {
  // Week titles and lessons come from the same template a real cohort uses,
  // so this page cannot drift from the product.
  const lessonTitle = new Map(getAllLessons().map((l) => [l.id, l.title]));

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: GUIDE_PUBLISHED,
    dateModified: GUIDE_PUBLISHED,
    mainEntityOfPage: `${SITE_URL}${PATH}`,
    author: { "@type": "Person", name: "Isaac Gong" },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <main className={styles.page}>
      <JsonLd data={article} />
      <JsonLd data={breadcrumbJsonLd(TRAIL)} />
      <Breadcrumbs trail={TRAIL} />

      <h1 className={styles.title}>{TITLE}</h1>
      <p className={styles.lede}>
        You do not need to be a finance expert, and you do not need real money. A good investing club is a
        teacher who agrees to sponsor it, a room with a few devices, and a plan for the first six weeks. This
        guide is that plan.
      </p>
      <p className={styles.meta}>Updated {GUIDE_PUBLISHED}. About a 6-minute read.</p>

      <section className={styles.section} aria-labelledby="what-you-need">
        <h2 id="what-you-need">What you need</h2>
        <ul>
          <li>
            <strong>A sponsor.</strong> Most schools require a staff member to sponsor any club. A math, economics,
            business, CS or personal finance teacher is the usual fit. Ask for 10 minutes and bring this page.
          </li>
          <li>
            <strong>A room and a time.</strong> One weekly meeting of 45 to 60 minutes, before school, at lunch, or after.
          </li>
          <li>
            <strong>Devices.</strong> A school Chromebook or a laptop is enough. StrikeLab runs in the browser with
            nothing to install. Check whether your school network allows it before the first meeting.
          </li>
          <li>
            <strong>Four to eight students.</strong> Enough for a conversation, small enough for one adult to help
            everyone.
          </li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="first-meeting">
        <h2 id="first-meeting">Plan the first meeting (45 minutes)</h2>
        <ol>
          <li>5 min: introductions and why everyone came.</li>
          <li>10 min: ask the room what they already know about stocks and what confuses them. Write the questions down.</li>
          <li>20 min: everyone opens the first lesson and tries the first exercise. Help anyone who is stuck.</li>
          <li>10 min: pick the meeting day and time, and agree on the rules below.</li>
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="six-weeks">
        <h2 id="six-weeks">The six weeks</h2>
        <p>
          This is the same schedule the StrikeLab cohort uses. Each week has a short set of lessons to finish
          before the next meeting; the meeting itself is for discussion and getting unstuck.
        </p>
        <ol className={styles.weeks}>
          {QUANT_FOUNDATIONS_TEMPLATE.weeks.map((w) => (
            <li key={w.week} className={styles.week}>
              <p className={styles.weekTitle}>
                Week {w.week}: {w.title}
              </p>
              <p className={styles.weekLessons}>
                {w.lessonIds.map((id) => lessonTitle.get(id) ?? id).join(" · ")}
              </p>
            </li>
          ))}
        </ol>
        <p>
          Plan a break week around holidays. The cohort scheduler lets a leader skip up to three weeks and shifts the
          due dates for you.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="ground-rules">
        <h2 id="ground-rules">Ground rules that keep it safe</h2>
        <div className={styles.note}>
          <p>
            <strong>This is education, not advice.</strong> Nobody in the club tells anyone what to buy. Practice with
            examples and simulated money only. Do not trade real money, collect money from members, or pick stocks for
            other people.
          </p>
          <p>
            Keep personal information private. Students should never share account numbers, passwords, or family finances
            in a meeting or a chat.
          </p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="checklist">
        <h2 id="checklist">One-page checklist</h2>
        <ul>
          <li>Sponsor teacher agreed</li>
          <li>Room, day and time booked</li>
          <li>Network allows strikelab.dev (test one Chromebook)</li>
          <li>Announcement made, with a sign-up link or QR code</li>
          <li>First-meeting plan printed</li>
          <li>Ground rules read aloud at meeting one</li>
          <li>Break weeks marked on the calendar</li>
        </ul>
        <p>Use your browser&rsquo;s print command to save this page as a PDF.</p>
      </section>

      <section className={styles.section} aria-labelledby="next">
        <h2 id="next">Run it with StrikeLab</h2>
        <p>
          The lessons are free for students. A club leader can launch the six-week cohort in a few minutes, share an
          invite link, and see who has started and who needs help. You can try the leader view with sample data first.
        </p>
        <div className={styles.actions}>
          <Link href="/pilot?src=guide-investing-club" className={styles.primary}>
            Start a free pilot
          </Link>
          <Link href="/demo?src=guide-investing-club" className={styles.secondary}>
            See the leader view
          </Link>
        </div>
      </section>
    </main>
  );
}
