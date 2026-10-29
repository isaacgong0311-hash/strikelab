import Link from "next/link";
import styles from "@/components/marketing/marketing.module.css";
import { pageMetadata } from "@/lib/seo";
import { EXAMPLE_CAPSTONES } from "@/lib/demo/exampleCapstones";
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
            A small group of 8 to 12 high schoolers. Each week they build a model, explain their choices, and get
            feedback. The six weeks end with a capstone they defend in a short live conversation.
          </p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="intensive-what">
        <div className={styles.wrap}>
          <h2 id="intensive-what" className={styles.h2}>What it is</h2>
          <ul className={styles.checks} style={{ maxWidth: "44rem" }}>
            <li><strong>$349</strong> for the six weeks. Nothing is charged now: we take payment only once a cohort has enough students.</li>
            <li>Starts in January 2027. Exact dates are set when the cohort fills.</li>
            <li>Led by StrikeLab&apos;s founder with a paid college mentor. The reviewer team and exact dates will be confirmed before enrollment.</li>
            <li>Built on StrikeLab&apos;s free lessons, so you can see the material first at <a className={styles.textLink} href="/lessons">strikelab.dev/lessons</a>.</li>
            <li>Students need a laptop or Chromebook and about 3 hours a week.</li>
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="intensive-week">
        <div className={styles.wrap}>
          <h2 id="intensive-week" className={styles.h2}>What a week looks like</h2>
          <p className={styles.lede}>Plan for about three hours across the week, using a laptop or Chromebook.</p>
          <div className={styles.grid3} style={{ marginTop: "1.5rem" }}>
            <div className={styles.card}>
              <h3 className={styles.h3}>Learn the idea</h3>
              <p className={styles.body}>Start with a short lesson on a market model, risk measure, or strategy.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.h3}>Build and explain</h3>
              <p className={styles.body}>Write Python in the browser, show what the numbers mean, and state what could make the result misleading.</p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.h3}>Get feedback and revise</h3>
              <p className={styles.body}>The founder and college mentor review the work. Students use that feedback to improve the code and explanation.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="intensive-defense">
        <div className={styles.wrap}>
          <h2 id="intensive-defense" className={styles.h2}>The capstone defense</h2>
          <p className={styles.lede}>At the end, each student gets 10 minutes to explain the question they chose, walk through their code and results, and answer questions about assumptions and limits.</p>
          <ul className={styles.checks} style={{ maxWidth: "44rem" }}>
            <li>The founder and college mentor review the capstone and the student&apos;s explanation.</li>
            <li>A parent or guardian consents before any live call with a minor.</li>
            <li>The call is never private one-on-one: two adults are present, or it is recorded with parent or guardian consent.</li>
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="intensive-examples">
        <div className={styles.wrap}>
          <h2 id="intensive-examples" className={styles.h2}>See a sample capstone</h2>
          <p className={styles.lede}>These examples were written by the StrikeLab team to show the expected kind of question, code, result, and reflection. They are not student submissions.</p>
          <div className={styles.grid2} style={{ marginTop: "1.5rem" }}>
            {EXAMPLE_CAPSTONES.map((example) => (
              <div key={example.slug} className={styles.card}>
                <p className={styles.kicker}>Example · StrikeLab team</p>
                <h3 className={styles.h3}>{example.title}</h3>
                <p className={styles.body}>{example.thesis}</p>
                <p className={styles.cardCta}><Link href={`/demo/capstone/${example.slug}`} className={styles.textLink}>Read the example capstone</Link></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="intensive-join">
        <div className={styles.wrap}>
          <h2 id="intensive-join" className={styles.h2}>Join the waitlist</h2>
          <p className={styles.body}>
            We only use this email to tell you about the January cohort. The form does not take payment. See what we store on the{" "}
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
