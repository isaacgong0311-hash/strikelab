import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { privatePageMetadata } from "@/lib/seo";
import CapstoneView from "../CapstoneView";
import styles from "../capstoneView.module.css";

// Unlisted: reachable only by its link, never indexed.
export const metadata = privatePageMetadata({
  title: "Student capstone",
  description: "A technical-finance capstone built in the StrikeLab Quant Foundations Lab.",
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SharedCapstonePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!UUID.test(token)) notFound();
  const supabase = await getSupabaseServer();
  if (!supabase) notFound();

  // Returns the work only (no name or ids), and nothing once sharing is off.
  const { data } = await supabase.rpc("get_shared_capstone", { p_token: token });
  const row = Array.isArray(data) ? (data[0] as Record<string, unknown> | undefined) : undefined;
  if (!row) notFound();

  return (
    <>
      <CapstoneView
        byline="By a StrikeLab student"
        data={{
          promptId: row.prompt_id as string,
          title: row.title as string,
          thesis: row.thesis as string,
          code: row.code as string,
          resultSummary: row.result_summary as string,
          reflection: row.reflection as string,
          submittedAt: (row.submitted_at as string | null) ?? null,
        }}
      />
      <p className={styles.footer}>
        Built in the Quant Foundations Lab on <Link href="/">StrikeLab</Link>, where students learn by coding real
        market models.
      </p>
    </>
  );
}
