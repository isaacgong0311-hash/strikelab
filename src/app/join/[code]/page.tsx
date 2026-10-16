import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { lookupInvite } from "@/lib/classInvite";
import { privatePageMetadata } from "@/lib/seo";
import { QUANT_FOUNDATIONS_TEMPLATE } from "@/lib/cohorts/template";
import JoinButton from "./JoinButton";
import styles from "./join.module.css";

export const metadata = privatePageMetadata({
  title: "Join your class",
  description: "Join your club or class on StrikeLab.",
});

/**
 * Invite link a teacher shares: /join/ABC234. Signed-out visitors are sent
 * through sign-up/sign-in and back here; signed-in visitors confirm with one
 * button (joining is a POST, never a side effect of opening a link).
 */
export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: raw } = await params;
  const code = decodeURIComponent(raw).trim().toUpperCase();
  const here = `/join/${code}`;

  const lookup = await lookupInvite(getSupabaseAdmin(), code);

  if (lookup.kind === "unavailable") {
    return (
      <div className={styles.shell}>
        <div className={styles.card}>
          <h1 className={styles.title}>We can&apos;t reach StrikeLab&apos;s database right now</h1>
          <p className={styles.muted}>
            Your invite link is fine. This is on our side. Wait a minute and refresh this page. If it still doesn&apos;t load,
            tell your teacher so they can start with the offline agenda and send the link again later.
          </p>
        </div>
      </div>
    );
  }

  if (lookup.kind === "not-found") {
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

  const klass = lookup.klass;
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
        <h1 className={styles.title}>Join {klass.name}</h1>
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
