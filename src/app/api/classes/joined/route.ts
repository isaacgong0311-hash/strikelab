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
    .select("classes(id, name)")
    .eq("student_id", auth.userId);

  if (error) {
    console.error("[classes/joined] GET", error.message);
    return NextResponse.json({ error: "Failed to load classes" }, { status: 500 });
  }

  const classes = (data ?? [])
    .map((row) => row.classes as unknown as { id: string; name: string } | null)
    .filter((c): c is { id: string; name: string } => Boolean(c));

  return NextResponse.json({ classes });
}
