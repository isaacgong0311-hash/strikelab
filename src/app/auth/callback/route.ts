import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/nextPath";

/**
 * Exchanges the OAuth / email-confirmation `code` for a session, then
 * redirects to the requested `next` path (default /dashboard).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Sanitized: a raw value like "@evil.com" would turn `${origin}${next}`
  // into https://strikelab.dev@evil.com, an open redirect.
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await getSupabaseServer();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        // Backfill signup_source for OAuth signups (email/password sets it
        // directly at signup; Google auth has no equivalent hook, so we
        // recover it from the cookie the sign-up page stashed pre-redirect).
        const cookieStore = await cookies();
        const pendingSource = cookieStore.get("sl_src")?.value;
        if (pendingSource) {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            await supabase
              .from("profiles")
              .update({ signup_source: pendingSource })
              .eq("id", userData.user.id)
              .is("signup_source", null);
          }
          cookieStore.delete("sl_src");
        }
        // Same for the student/leader choice (drives nav and landing).
        const pendingRole = cookieStore.get("sl_role")?.value;
        if (pendingRole === "leader" || pendingRole === "student") {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user && !userData.user.user_metadata?.signup_role) {
            await supabase.auth.updateUser({ data: { signup_role: pendingRole } });
          }
          cookieStore.delete("sl_role");
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth`);
}
