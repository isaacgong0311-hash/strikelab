import Faq from "@/components/marketing/Faq";
import { FAQ_GROUPS } from "@/lib/faq";
import styles from "@/components/marketing/marketing.module.css";
import faq from "./faq.module.css";

/**
 * The FAQ. Native <details> disclosures (via the shared marketing Faq), so
 * every answer is in the server-rendered HTML, works without JavaScript and
 * is findable with the browser's find-in-page. Kept under its old name so the
 * route file stays unchanged.
 */
export default function FAQClient() {
  return (
    <div className={`${styles.page} ${styles.narrow} ${faq.shell}`}>
      <h1 className={faq.title}>Frequently asked questions</h1>
      <p className={styles.lede}>
        Can&rsquo;t find what you&rsquo;re looking for?{" "}
        <a href="mailto:hello@strikelab.app" className={styles.textLink}>Email us</a>.
      </p>

      {FAQ_GROUPS.map((group) => {
        const id = `faq-${group.section.toLowerCase().replace(/[^a-z]+/g, "-")}`;
        return (
          <section key={group.section} className={faq.group} aria-labelledby={id}>
            <h2 id={id} className={faq.groupTitle}>{group.section}</h2>
            <Faq items={group.items} />
          </section>
        );
      })}
    </div>
  );
}
