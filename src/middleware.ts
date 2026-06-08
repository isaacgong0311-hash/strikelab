import { NextResponse } from "next/server";
// Clerk middleware is disabled until NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and
// CLERK_SECRET_KEY are set as environment variables in the Vercel project.
// Once added, swap this file back to the clerkMiddleware version.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
