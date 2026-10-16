import styles from "@/components/marketing/marketing.module.css";
import { pageMetadata } from "@/lib/seo";
import WaitlistForm from "./WaitlistForm";

export const metadata = pageMetadata({
  path: "/intensive",
  title: "The StrikeLab Intensive: six weeks of real quant work",
  description:
    "A small six-week cohort for motivated high schoolers: code real market models, get reviewed, and defend a capstone live. $349. Join the waitlist; nothing is charged until a cohort fills.",
});

export default function IntensivePage() {
  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.kicker}>For parents and guardians</p>
          <h1 className={styles.h1}>Six weeks of real quant work, with a capstone your student defends.</h1>
          <p className={styles.lede}>
            A small group of 8 to 12 high schoolers. Each week they write code that prices options, measures risk or
            tests a strategy honestly, and get it reviewed. It ends with a capstone they explain, live, to a reviewer:
            something real to show for it.
          </p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="intensive-what">
        <div className={styles.wrap}>
          <h2 id="intensive-what" className={styles.h2}>What it is</h2>
          <ul className={styles.checks} style={{ maxWidth: "44rem" }}>
            <li><strong>$349</strong> for the six weeks. Nothing is charged now: we take payment only once a cohort has enough students.</li>
            <li>Starts in January 2027. Exact dates are set when the cohort fills.</li>
            <li>Run by StrikeLab&apos;s founder with a college mentor. Reviews and the capstone defense are done live, never one-on-one in private: two adults are present, or the call is recorded with your consent.</li>
            <li>Built on StrikeLab&apos;s free lessons, so you can see the material first at <a className={styles.textLink} href="/lessons">strikelab.dev/lessons</a>.</li>
            <li>Students need a laptop or Chromebook and about 3 hours a week.</li>
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="intensive-join">
        <div className={styles.wrap}>
          <h2 id="intensive-join" className={styles.h2}>Join the waitlist</h2>
          <p className={styles.body}>
            We only use this email to tell you about the January cohort. See what we store on the{" "}
            <a className={styles.textLink} href="/trust">student data page</a>.
          </p>
          <div style={{ marginTop: "1rem" }}>
            <WaitlistForm source="intensive-page" />
          </div>
        </div>
      </section>
    </div>
  );
}
