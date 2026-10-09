import QRCode from "qrcode";
import BrandMark from "@/components/BrandMark";
import { LAB_WEEKS } from "@/lib/marketing/lab";
import { LEAVE_BEHIND_SHORT_URL, LEAVE_BEHIND_URL } from "@/lib/marketing/leaveBehind";
import { privatePageMetadata } from "@/lib/seo";
import PrintButton from "./PrintButton";
import styles from "./leaveBehind.module.css";

export const metadata = privatePageMetadata({
  title: "Pilot leave-behind",
  description: "A one-page handout for leaving with a club leader or teacher after asking about a pilot.",
});

export default async function LeaveBehindPage() {
  // Server-rendered SVG so the sheet prints with JavaScript off.
  const qrSvg = await QRCode.toString(LEAVE_BEHIND_URL, { type: "svg", margin: 0, errorCorrectionLevel: "M" });

  return (
    <div className={styles.screen}>
      <div className={styles.toolbar}>
        <PrintButton className={styles.print} />
        <p>Prints on one Letter page. In the print dialog, turn off &ldquo;Headers and footers&rdquo; so the page doesn&rsquo;t add a URL and date.</p>
      </div>

      <article className={styles.sheet} aria-label="StrikeLab pilot handout">
        <header className={styles.head}>
          <span className={styles.mark}><BrandMark size={28} /></span>
          <span className={styles.brand}>StrikeLab</span>
          <span className={styles.tag}>Quant Foundations Lab</span>
        </header>

        <h1 className={styles.title}>A six-week finance-and-code lab your club can run this term. Free.</h1>
        <p className={styles.lede}>
          One 45&ndash;60 minute meeting a week. Students write real Python in the browser (nothing to install) and finish
          with a capstone they can show: a question, code that answers it, and an honest result.
        </p>

        <div className={styles.cols}>
          <section aria-labelledby="lb-weeks">
            <h2 id="lb-weeks" className={styles.h2}>The six weeks</h2>
            <ol className={styles.weeks}>
              {LAB_WEEKS.map((w) => (
                <li key={w.week}>
                  <strong>{w.title}.</strong> {w.builds}
                </li>
              ))}
            </ol>
          </section>

          <aside className={styles.scan} aria-label="Start the pilot">
            <div className={styles.qr} role="img" aria-label={`QR code for ${LEAVE_BEHIND_SHORT_URL}`} dangerouslySetInnerHTML={{ __html: qrSvg }} />
            <p className={styles.scanText}>
              Scan, or go to
              <strong>{LEAVE_BEHIND_SHORT_URL}</strong>
            </p>
            <p className={styles.scanFine}>Setup takes a few minutes.</p>
          </aside>
        </div>

        <div className={styles.three}>
          <section aria-labelledby="lb-get">
            <h2 id="lb-get" className={styles.h2}>You get</h2>
            <ul>
              <li>A plan for every meeting, with a script, so you don&rsquo;t need a finance or coding background</li>
              <li>One join link; students enroll themselves</li>
              <li>A scorecard of who&rsquo;s active and who needs help</li>
              <li>Me, directly: a kickoff call and a check-in most weeks</li>
            </ul>
          </section>
          <section aria-labelledby="lb-need">
            <h2 id="lb-need" className={styles.h2}>I need</h2>
            <ul>
              <li>A weekly meeting time, in person or virtual</li>
              <li>10&ndash;25 students from your club</li>
              <li>School approval, if your school requires it for outside tools</li>
              <li>15 minutes at the end for honest feedback</li>
            </ul>
          </section>
          <section aria-labelledby="lb-cost">
            <h2 id="lb-cost" className={styles.h2}>It costs</h2>
            <ul>
              <li><strong>Nothing for the pilot.</strong> Students never pay.</li>
              <li>If you want to continue after: $199 a year for a club, or $499 a year per instructor for a school. That&rsquo;s a conversation for later, not a condition.</li>
              <li>We keep only what the program needs: an email, a display name and lesson progress. Nothing is public.</li>
            </ul>
          </section>
        </div>

        <footer className={styles.foot}>
          <p>
            <strong>Isaac</strong>, founder (and a high-school student) &middot; hello@strikelab.app
          </p>
          <p className={styles.footFine}>Want to see it first? {LEAVE_BEHIND_SHORT_URL.replace("/pilot", "/demo")} shows a club three weeks in, with sample data.</p>
        </footer>
      </article>
    </div>
  );
}
