import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { privatePageMetadata } from "@/lib/seo";
import { QUANT_FOUNDATIONS_TEMPLATE } from "@/lib/cohorts/template";
import JoinButton from "./JoinButton";
import styles from "./join.module.css";

export const metadata = privatePageMetadata({
  title: "Join your class",
  description: "Join your club or class on StrikeLab.",
});

const CODE_PATTERN = /^[A-Z2-9]{6}$/;

/**
 * Invite link a teacher shares: /join/ABC234. Signed-out visitors are sent
 * through sign-up/sign-in and back here; signed-in visitors confirm with one
 * button (joining is a POST, never a side effect of opening a link).
 */
export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: raw } = await params;
  const code = decodeURIComponent(raw).trim().toUpperCase();
  const here = `/join/${code}`;

  const admin = getSupabaseAdmin();
  const klass = CODE_PATTERN.test(code) && admin
    ? (await admin.from("classes").select("id, name, template_id, starts_on").eq("join_code", code).maybeSingle()).data
    : null;

  if (!klass) {
    return (
      <div className={styles.shell}>
        <div className={styles.card}>
          <h1 className={styles.title}>That invite link doesn&apos;t match a class</h1>
          <p className={styles.muted}>
            Check the link with your teacher, or enter the six-character code in{" "}
            <Link href="/settings">Settings</Link>.
          </p>
        </div>
      </div>
    );
  }

  const isCohort = Boolean(klass.template_id && klass.starts_on);
  const destination = isCohort ? `/cohort/${klass.id}` : "/dashboard";

  const supabase = await getSupabaseServer();
  const { data: auth } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (auth.user && supabase) {
    const { data: membership } = await supabase
      .from("class_members")
      .select("class_id")
      .eq("class_id", klass.id)
      .eq("student_id", auth.user.id)
      .maybeSingle();
    if (membership) redirect(destination);
  }

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <p className={styles.kicker}>You&apos;re invited</p>
        <h1 className={styles.title}>Join {klass.name as string}</h1>
        <p className={styles.muted}>
          {isCohort
            ? `Your class is running the ${QUANT_FOUNDATIONS_TEMPLATE.name}: six weeks of short lessons and real code, one step at a time.`
            : "Join to learn alongside your class. Every lesson stays free."}
        </p>
        {auth.user ? (
          <JoinButton code={code} />
        ) : (
          <div className={styles.actions}>
            <Link href={`/sign-up?next=${encodeURIComponent(here)}`} className={styles.primary}>
              Create a free account
            </Link>
            <Link href={`/sign-in?next=${encodeURIComponent(here)}`} className={styles.secondary}>
              I already have an account
            </Link>
          </div>
        )}
        <p className={styles.fine}>
          Your teacher will see your name and your progress in this class. Nothing you make is public unless you choose to
          share it.
        </p>
      </div>
    </div>
  );
}
