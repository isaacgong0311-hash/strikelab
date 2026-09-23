/**
 * DELETE /api/account { confirm: "DELETE" }: permanently delete the
 * signed-in account. Every table cascades from auth.users (verified in
 * src/lib/account/deletion.db.test.ts), so deleting the auth user removes
 * progress, completions, code, capstones and class memberships.
 *
 * Two cases are refused with an explanation instead:
 *  - an active paid subscription (cancel it first, so billing stops too);
 *  - a teacher whose classes still have students (deleting the teacher
 *    would delete the class and its students' capstones with it).
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { rateLimit } from "@/lib/rateLimit";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function DELETE(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const limited = await rateLimit(auth.supabase, "account-delete");
  if (limited) return limited;

  const body = (await req.json().catch(() => ({}))) as { confirm?: unknown };
  if (body.confirm !== "DELETE") {
    return NextResponse.json({ error: 'Type DELETE to confirm' }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Account deletion isn't available right now" }, { status: 503 });

  const { data: sub } = await admin.from("subscriptions").select("status").eq("user_id", auth.userId).maybeSingle();
  if (sub && ["active", "trialing", "past_due"].includes(sub.status as string)) {
    return NextResponse.json(
      { error: "Cancel your subscription first (Settings → Manage billing), then delete your account." },
      { status: 409 }
    );
  }

  const { data: classes } = await admin.from("classes").select("id, class_members(count)").eq("teacher_id", auth.userId);
  const withStudents = (classes ?? []).filter((c) => {
    const members = c.class_members as unknown as { count: number }[] | undefined;
    return (members?.[0]?.count ?? 0) > 0;
  });
  if (withStudents.length > 0) {
    return NextResponse.json(
      {
        error:
          "You teach a class with students in it. Deleting your account would delete their class work too, so email hello@strikelab.app and we'll help move or close the class first.",
      },
      { status: 409 }
    );
  }

  const { error } = await admin.auth.admin.deleteUser(auth.userId);
  if (error) {
    console.error("[account] delete failed:", error.message);
    return NextResponse.json({ error: "Couldn't delete your account. Email hello@strikelab.app and we'll do it." }, { status: 500 });
  }
  return NextResponse.json({ deleted: true });
}
