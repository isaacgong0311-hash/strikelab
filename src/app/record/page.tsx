import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import RecordView from "@/components/record/RecordView";
import styles from "@/components/record/record.module.css";
import { parseRecord } from "@/lib/records/record";
import { privatePageMetadata } from "@/lib/seo";
import { getSupabaseServer } from "@/lib/supabase/server";
import ShareRecord from "./ShareRecord";

export const metadata = privatePageMetadata({
  title: "Your record",
  description: "Your StrikeLab seasons, official scores and verified work. Private until you share it.",
});

/** The signed-in student's own record (proving-ground spec §3). Private by default. */
export default async function MyRecordPage() {
  await connection();
  const supabase = await getSupabaseServer();
  if (!supabase) {
    return (
      <p className={styles.footer} style={{ paddingTop: "3rem" }}>
        Records need the database, which isn&apos;t connected here.
      </p>
    );
  }
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/sign-in?next=${encodeURIComponent("/record")}`);

  const { data, error } = await supabase.rpc("my_record");
  const record = error ? null : parseRecord(data);
  if (!record) {
    return (
      <p className={styles.footer} style={{ paddingTop: "3rem" }}>
        We couldn&apos;t load your record right now. Please try again in a minute.
      </p>
    );
  }

  return (
    <>
      <RecordView record={record} viewer="owner" />
      <section className={styles.share} aria-labelledby="share-title">
        <h2 id="share-title">Share your record</h2>
        {record.handle ? (
          <ShareRecord initialToken={record.shareToken} />
        ) : (
          <p>
            Choose a handle on the <Link href="/seasons">seasons page</Link> first. A shared record shows your handle,
            never your name.
          </p>
        )}
      </section>
    </>
  );
}
