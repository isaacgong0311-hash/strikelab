import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { privatePageMetadata } from "@/lib/seo";
import CapstoneView from "@/app/capstone/CapstoneView";

export const metadata = privatePageMetadata({
  title: "Student capstone",
  description: "Review a student's capstone.",
});

/**
 * Teacher view of one student's capstone. Opening it goes through
 * open_capstone_as_teacher(), which checks the caller teaches the class and
 * logs the view; the student sees that log on their capstone page.
 */
export default async function TeacherCapstonePage({
  params,
}: {
  params: Promise<{ id: string; capstoneId: string }>;
}) {
  const { id: classId, capstoneId } = await params;
  const supabase = await getSupabaseServer();
  if (!supabase) notFound();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/sign-in?next=${encodeURIComponent(`/dashboard/class/${classId}/capstone/${capstoneId}`)}`);

  const { data, error } = await supabase.rpc("open_capstone_as_teacher", { p_capstone_id: capstoneId });
  const row = !error && Array.isArray(data) ? (data[0] as Record<string, unknown> | undefined) : undefined;
  if (!row || row.class_id !== classId) notFound();

  // Ownership is verified by the RPC above; the name lookup needs the admin client.
  const admin = getSupabaseAdmin();
  const profile = admin
    ? (await admin.from("profiles").select("display_name").eq("id", row.user_id as string).maybeSingle()).data
    : null;

  return (
    <>
      <p style={{ width: "min(100%, 46rem)", margin: "1.5rem auto 0", padding: "0 16px", fontWeight: 700 }}>
        <Link href={`/dashboard/class/${classId}`}>← Back to class</Link>
      </p>
      <CapstoneView
        byline={(profile?.display_name as string | undefined) || "StrikeLab student"}
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
    </>
  );
}
