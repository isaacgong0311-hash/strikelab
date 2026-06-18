import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Refreshes the Supabase auth session cookie on every request.
// No-op (just passes through) when Supabase env vars aren't set.
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and files:
     * - _next/static, _next/image
     * - common static file extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)$).*)",
  ],
};
