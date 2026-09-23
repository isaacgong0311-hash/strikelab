import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { privatePageMetadata } from "@/lib/seo";
import { CAPSTONE_PROMPTS } from "@/lib/capstone/prompts";
import { CAPSTONE_COLUMNS, rowToCapstone } from "@/lib/capstone/rows";
import CapstoneEditor from "./CapstoneEditor";
import styles from "./capstone.module.css";

export const metadata = privatePageMetadata({
  title: "Your capstone",
  description: "Build and submit your Quant Foundations capstone.",
});

export default async function CapstonePage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const supabase = await getSupabaseServer();
  if (!supabase) notFound();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/sign-in?next=${encodeURIComponent(`/cohort/${classId}/capstone`)}`);

  // RLS: only members (or the teacher) can read the class.
  const { data: klass } = await supabase.from("classes").select("id, name").eq("id", classId).maybeSingle();
  if (!klass) notFound();

  const [capstoneRes] = await Promise.all([
    supabase.from("capstone_submissions").select(CAPSTONE_COLUMNS).eq("class_id", classId).eq("user_id", auth.user.id).maybeSingle(),
  ]);
  const unavailable = Boolean(capstoneRes.error);
  const capstone = capstoneRes.data ? rowToCapstone(capstoneRes.data) : null;
  const { data: log } = capstone
    ? await supabase.from("capstone_access_log").select("viewed_at").eq("capstone_id", capstone.id).order("viewed_at", { ascending: false }).limit(3)
    : { data: [] };

  return (
    <div className={styles.shell}>
      <p className={styles.back}>
        <Link href={`/cohort/${classId}`}>← {klass.name as string}</Link>
      </p>
      <h1 className={styles.title}>Your capstone</h1>
      <p className={styles.lede}>
        One piece of work that shows what you can do: a question, code that answers it, and what you learned. It stays
        private to you and your teacher unless you choose to share it.
      </p>
      {unavailable ? (
        <p className={styles.notice} role="status">Capstones aren&apos;t switched on for this site yet. Check back soon.</p>
      ) : (
        <CapstoneEditor
          classId={classId}
          prompts={CAPSTONE_PROMPTS}
          initial={capstone}
          openedByTeacher={(log ?? []).map((r) => r.viewed_at as string)}
        />
      )}
    </div>
  );
}
