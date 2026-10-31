import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { isFounder } from "@/lib/admin/founder";
import { privatePageMetadata } from "@/lib/seo";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";
import styles from "../../../seasonsAdmin.module.css";

export const metadata = privatePageMetadata({
  title: "Review season attempt",
  description: "Founder-only season attempt review.",
});

export default async function ReviewAttemptPage({ params }: { params: Promise<{ challengeId: string; userId: string }> }) {
  await connection();
  const supabase = await getSupabaseServer();
  const { data: auth } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!isFounder(auth.user?.id)) notFound();

  const admin = getSupabaseAdmin();
  if (!admin) return <main className={styles.shell}><h1>Review season attempt</h1><p>Service-role access is not configured on this server.</p></main>;
  const { challengeId, userId } = await params;
  const { data: attempt } = await admin.from("season_attempts")
    .select("challenge_id, user_id, status, code, explanation, submitted_at")
    .eq("challenge_id", challengeId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!attempt) notFound();
  const { data: profile } = await admin.from("profiles").select("handle").eq("id", userId).maybeSingle();

  return (
    <main className={styles.shell}>
      <p className={styles.kicker}>Founder only</p>
      <h1>Review season attempt</h1>
      <p>{profile?.handle ?? "No handle"} · {challengeId} · {attempt.status}</p>
      <p><Link href="/admin/seasons">Back to season operations</Link></p>
      <section className={styles.section} aria-labelledby="attempt-code">
        <h2 id="attempt-code">Submitted code</h2>
        <pre className={styles.code}><code>{attempt.code ?? "No code submitted"}</code></pre>
      </section>
      <section className={styles.section} aria-labelledby="attempt-explanation">
        <h2 id="attempt-explanation">Explanation</h2>
        <p className={styles.explanation}>{attempt.explanation ?? "No explanation submitted"}</p>
      </section>
    </main>
  );
}
