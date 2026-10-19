import Link from "next/link";
import { privatePageMetadata } from "@/lib/seo";
import styles from "./recordStub.module.css";

export const metadata = privatePageMetadata({
  title: "Your record",
  description: "Your season work, verified capstones, and certificates in one place.",
});

/** Placeholder until T2.2 can read verified records from its new tables. */
export default function RecordPage() {
  return (
    <div className={styles.page}>
      <p className={styles.kicker}>Prove → Record</p>
      <h1>Your record is taking shape.</h1>
      <p>Season results, verified capstones, and certificates will appear here when the record is ready. Keep building your work in the meantime.</p>
      <div className={styles.actions}>
        <Link href="/seasons">Explore seasons</Link>
        <Link href="/dashboard">Back to your home</Link>
      </div>
    </div>
  );
}
