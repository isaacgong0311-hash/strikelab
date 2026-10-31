import { pageMetadata } from "@/lib/seo";
import StartingPoint from "./StartingPoint";
import styles from "@/components/marketing/marketing.module.css";

export const metadata = pageMetadata({ path: "/start", title: "Find your starting point", description: "Four quick questions, useful explanations, and a suggested first finance lesson. Free, with no signup." });

export default function StartPage() {
  return <div className={styles.page}><section className={styles.section}><div className={styles.narrow}>
    <p className={styles.kicker}>Your first step</p>
    <h1 className={styles.h1}>Find your starting point.</h1>
    <p className={styles.lede}>Try four quick questions about markets, risk, and research. Get an explanation after each one and a lesson to try next. No account needed.</p>
    <p className={styles.fine}>This is a starting suggestion, not a placement exam. It does not award credit or change your progress. Answers reset when you leave; only your suggested next lesson is saved on this device.</p>
    <StartingPoint />
    <noscript><p>Enable JavaScript for the check, or <a href="/learn/inv-1.1">start the first lesson</a>.</p></noscript>
  </div></section></div>;
}
