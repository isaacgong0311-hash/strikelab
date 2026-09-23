/**
 * GET /api/classes/joined — the class(es) the caller has joined as a
 * student. Powers the "You're in: <class name>" line in Settings.
 */
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from("class_members")
    .select("classes(id, name, template_id, starts_on)")
    .eq("student_id", auth.userId);

  if (error) {
    console.error("[classes/joined] GET", error.message);
    return NextResponse.json({ error: "Failed to load classes" }, { status: 500 });
  }

  type JoinedRow = { id: string; name: string; template_id: string | null; starts_on: string | null };
  const classes = (data ?? [])
    .map((row) => row.classes as unknown as JoinedRow | null)
    .filter((c): c is JoinedRow => Boolean(c))
    // isCohort: launched cohorts get a "Your cohort" link to /cohort/[id].
    .map((c) => ({ id: c.id, name: c.name, isCohort: Boolean(c.template_id && c.starts_on) }));

  return NextResponse.json({ classes });
}
