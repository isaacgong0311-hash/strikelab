import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { STORED_DATA, SUBPROCESSORS } from "@/lib/trust/dataMap";
import styles from "./trust.module.css";

export const metadata = pageMetadata({
  path: "/trust",
  title: "Student data and security",
  description:
    "For club sponsors, principals and school IT: what StrikeLab stores about students, who can see it, where it goes, and how it's deleted.",
});

/** The date this page was last checked against the code and migrations. */
const LAST_CHECKED = "October 1, 2026";

export default function TrustPage() {
  return (
    <div className={styles.shell}>
      <JsonLd data={breadcrumbJsonLd([{ name: "Student data and security", path: "/trust" }])} />
      <Breadcrumbs trail={[{ name: "Student data and security", path: "/trust" }]} />

      <header className={styles.header}>
        <p className={styles.kicker}>For sponsors, principals and school IT</p>
        <h1 className={styles.title}>How StrikeLab handles student data</h1>
        <p className={styles.lede}>
          A plain description of how the product works today: what it stores, who can see it, where it goes and how it&apos;s
          deleted. It isn&apos;t a legal document; the <Link href="/privacy">privacy policy</Link> and{" "}
          <Link href="/terms">terms</Link> are. Last checked against the code on {LAST_CHECKED}.
        </p>
      </header>

      <section className={styles.section} aria-labelledby="principles">
        <h2 id="principles" className={styles.h2}>The short version</h2>
        <ul className={styles.points}>
          <li><strong>13 and up.</strong> StrikeLab is built for ages 13 to 18.</li>
          <li><strong>Minimal.</strong> An email address, a display name and learning activity. No birth date, address, phone number, school ID, photos, grades or location.</li>
          <li><strong>Private by default.</strong> Nothing about a student is public unless they create a share link for their own capstone, and even that shows no name.</li>
          <li><strong>No ads, no selling data, no cross-site tracking.</strong></li>
          <li><strong>Students can delete everything themselves</strong>, immediately, from Settings.</li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="stored">
        <h2 id="stored" className={styles.h2}>What&apos;s stored, and who can see it</h2>
        <p className={styles.body}>
          Each rule below is enforced in the database with row-level security, and automated tests check every rule on every change.
        </p>
        <ul className={styles.cards}>
          {STORED_DATA.map((d) => (
            <li key={d.what} className={styles.card}>
              <h3 className={styles.h3}>{d.what}</h3>
              <dl className={styles.who}>
                <div><dt>The student</dt><dd>{d.student}</dd></div>
                <div><dt>Their club leader</dt><dd>{d.leader}</dd></div>
                <div><dt>Anyone else</dt><dd>{d.others}</dd></div>
              </dl>
            </li>
          ))}
        </ul>
        <p className={styles.body}>
          <strong>StrikeLab staff</strong> (the founder) can read the database to run and support the service, and does so only for
          support, debugging and aggregate pilot numbers. Pilot reports use aggregate numbers only.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="vendors">
        <h2 id="vendors" className={styles.h2}>Where data goes</h2>
        <p className={styles.body}>The services StrikeLab uses to run, and exactly what each one receives.</p>
        <ul className={styles.cards}>
          {SUBPROCESSORS.map((v) => (
            <li key={v.vendor} className={styles.card}>
              <h3 className={styles.h3}>{v.vendor}</h3>
              <dl className={styles.who}>
                <div><dt>What for</dt><dd>{v.purpose}</dd></div>
                <div><dt>What it receives</dt><dd>{v.receives}</dd></div>
              </dl>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="cookies">
        <h2 id="cookies" className={styles.h2}>Cookies and browser storage</h2>
        <ul className={styles.points}>
          <li>Sign-in session cookies, plus two one-hour cookies that carry how someone found StrikeLab and whether they&apos;re a student or a leader through Google sign-in.</li>
          <li>Progress and code are also kept in the browser so lessons work offline and without an account.</li>
          <li>No advertising or cross-site tracking cookies.</li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="deletion">
        <h2 id="deletion" className={styles.h2}>Deletion and requests</h2>
        <ul className={styles.points}>
          <li><strong>Students delete their own account</strong> in Settings → Delete account. It takes effect immediately and removes every item listed above, including capstones, share links and class memberships.</li>
          <li><strong>Parents and schools</strong> can ask to see or delete a student&apos;s data by emailing <a href="mailto:hello@strikelab.app">hello@strikelab.app</a>.</li>
          <li><strong>How long pilot data is kept</strong> is agreed with each school or club in its pilot agreement.</li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="security">
        <h2 id="security" className={styles.h2}>Security basics</h2>
        <ul className={styles.points}>
          <li>Every table has row-level security turned on, and the rules are tested automatically on every change.</li>
          <li>Joining a class needs the class&apos;s invite code and an account. Joining, creating classes, saving and sharing capstones, and deleting accounts are rate-limited.</li>
          <li>Leaders see only students who joined <em>their</em> class, and only what&apos;s listed above. Opening a student&apos;s capstone is logged, and the student can see the log.</li>
          <li>All traffic uses HTTPS. Keys and passwords live in the hosting provider&apos;s settings, never in the code.</li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="incidents">
        <h2 id="incidents" className={styles.h2}>If something goes wrong</h2>
        <p className={styles.body}>
          If a problem could involve student data, the affected feature is taken offline first. The club leader hears within 24 hours
          what happened, which data was involved and what has been done. If the school has its own process, StrikeLab follows it.
        </p>
      </section>

      <section className={`${styles.section} ${styles.ask}`} aria-labelledby="review">
        <h2 id="review" className={styles.h2}>Reviewing StrikeLab for your school?</h2>
        <p className={styles.body}>
          If your school or district has its own student-data agreement or approval form, email it to{" "}
          <a href="mailto:hello@strikelab.app?subject=Student%20data%20review">hello@strikelab.app</a> and we&apos;ll go through it with
          you. This page is also in the pilot approval packet.
        </p>
      </section>
    </div>
  );
}
