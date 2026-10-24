import Link from "next/link";
import { getTemplate } from "@/lib/seasons/templates";
import { pageMetadata } from "@/lib/seo";
import PracticeChallenge from "./PracticeChallenge";
import styles from "@/components/marketing/marketing.module.css";
import practice from "./practice.module.css";

export const metadata = pageMetadata({
  path: "/seasons/practice",
  title: "Try a quant challenge",
  description: "Try a real StrikeLab coding challenge in browser Python. No account, timer, or official score.",
});

const exampleNumbers = { C: 10, S: 100, K: 100, T: 1, r: 0.05 };

export default function SeasonPracticePage() {
  const challenge = getTemplate("put-call-parity");
  if (!challenge) throw new Error("Practice challenge template is missing");

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.narrow}>
          <p className={styles.kicker}>Try the work · no account needed</p>
          <h1 className={styles.h1}>Can you price a put from a call?</h1>
          <p className={styles.lede}>
            Write one Python function, run real checks in your browser, then explain why the answer must hold.
            This is a practice version of a season challenge with the same example numbers for everyone.
          </p>
          <p className={practice.disclosure}>
            Practice has no timer, official score, leaderboard rank, or saved submission. The actual season gives
            each student different numbers and scores code on the server.
          </p>
          <PracticeChallenge
            title={challenge.title}
            prompt={challenge.prompt(exampleNumbers)}
            starterCode={challenge.starterCode}
            previewTest={challenge.previewTest}
          />
          <div className={practice.next}>
            <div>
              <h2>Want to understand the rule?</h2>
              <p>Learn put-call parity and see why a price gap creates an arbitrage opportunity.</p>
            </div>
            <Link href="/lesson/2">Open the lesson →</Link>
          </div>
          <p className={practice.back}><Link href="/seasons">← Back to seasons</Link></p>
        </div>
      </section>
    </div>
  );
}
