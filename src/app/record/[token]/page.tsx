import Link from "next/link";
import { notFound } from "next/navigation";
import RecordView from "@/components/record/RecordView";
import styles from "@/components/record/record.module.css";
import { parseRecord } from "@/lib/records/record";
import { privatePageMetadata } from "@/lib/seo";
import { getSupabaseServer } from "@/lib/supabase/server";

// Unlisted: reachable only by its link, never indexed.
export const metadata = privatePageMetadata({
  title: "Student record",
  description: "A StrikeLab student's seasons, official scores and verified work.",
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SharedRecordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!UUID.test(token)) notFound();
  const supabase = await getSupabaseServer();
  if (!supabase) notFound();

  // Handle only, no name or ids; null once the student turns sharing off.
  const { data } = await supabase.rpc("get_shared_record", { p_token: token });
  const record = parseRecord(data);
  if (!record) notFound();

  return (
    <>
      <RecordView record={record} viewer="public" />
      <p className={styles.footer}>
        Earned on <Link href="/seasons">StrikeLab</Link>, where high schoolers prove they can do real quant work in
        timed seasons and live defenses.
      </p>
    </>
  );
}
