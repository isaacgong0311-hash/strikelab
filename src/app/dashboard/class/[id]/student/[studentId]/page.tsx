import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import StudentWorkView from "@/components/teach/StudentWorkView";
import { privatePageMetadata } from "@/lib/seo";
import { getSupabaseServer } from "@/lib/supabase/server";
import { loadStudentWork } from "@/lib/teach/loadStudentWork";

export const metadata = privatePageMetadata({
  title: "Student work",
  description: "One student's assigned lessons, saved code and progress.",
});

/** The class workspace's student page: teacher-only, read-only. */
export default async function StudentWorkPage({ params }: { params: Promise<{ id: string; studentId: string }> }) {
  const { id: classId, studentId } = await params;
  const supabase = await getSupabaseServer();
  if (!supabase) notFound();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/sign-in?next=${encodeURIComponent(`/dashboard/class/${classId}/student/${studentId}`)}`);

  const result = await loadStudentWork(supabase, auth.user.id, classId, studentId);
  if (!result.ok && result.status === 404) notFound();
  if (!result.ok) {
    return (
      <div style={{ width: "min(100%, 32rem)", margin: "0 auto", padding: "6rem 16px", textAlign: "center" }}>
        <h1 style={{ font: "800 1.5rem/1.3 var(--sl-font-display)", margin: "0 0 0.75rem" }}>This student&rsquo;s work didn&rsquo;t load</h1>
        <p style={{ color: "var(--sl-text-muted)", margin: "0 0 1.5rem" }}>Nothing is lost. Try again in a minute.</p>
        <Link href={`/dashboard/class/${classId}?tab=students`} className="v2-btn ghost">Back to students</Link>
      </div>
    );
  }

  const { page } = result;
  return (
    <StudentWorkView
      name={page.student.name}
      className={page.klass.name}
      backHref={`/dashboard/class/${classId}?tab=students`}
      joinedOn={page.student.joinedOn}
      lastActiveOn={page.student.lastActiveOn}
      work={page.work}
      metrics={page.metrics}
      timezone={page.klass.timezone ?? "UTC"}
      capstoneHref={page.metrics?.capstone ? `/dashboard/class/${classId}/capstone/${page.metrics.capstone.id}` : null}
      codeUnavailable={page.codeUnavailable}
    />
  );
}
