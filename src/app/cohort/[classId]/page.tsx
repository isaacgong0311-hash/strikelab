import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { privatePageMetadata } from "@/lib/seo";
import { QUANT_FOUNDATIONS_TEMPLATE } from "@/lib/cohorts/template";
import { loadStudentCohort } from "@/lib/cohorts/loadStudentCohort";
import CohortHomeView from "./CohortHomeView";
import styles from "./cohort.module.css";

export const metadata = privatePageMetadata({
  title: "Your cohort",
  description: "This week's lessons, due dates, and your next step in the Quant Foundations Lab.",
});

export default async function CohortHomePage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const supabase = await getSupabaseServer();
  if (!supabase) {
    return (
      <div className={styles.shell}>
        <h1 className={styles.title}>Cohorts aren&apos;t available here</h1>
        <p className={styles.muted}>This copy of StrikeLab isn&apos;t connected to a database.</p>
      </div>
    );
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/sign-in?next=${encodeURIComponent(`/cohort/${classId}`)}`);

  const result = await loadStudentCohort(supabase, auth.user.id, classId);
  if (result.kind === "not-found") notFound();

  if (result.kind === "not-launched") {
    return (
      <div className={styles.shell}>
        <p className={styles.kicker}>{result.className}</p>
        <h1 className={styles.title}>Your program hasn&apos;t started yet</h1>
        <p className={styles.muted}>
          Your teacher hasn&apos;t scheduled the {QUANT_FOUNDATIONS_TEMPLATE.name} for this class. Until then, the whole
          curriculum is open.
        </p>
        <Link href="/lessons" className={styles.primary}>Browse lessons</Link>
      </div>
    );
  }

  return <CohortHomeView className={result.className} view={result.view} />;
}
