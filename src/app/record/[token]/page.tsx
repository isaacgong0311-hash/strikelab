import { redirect } from "next/navigation";

/**
 * Shared records live at /r/[token]. This path came from an earlier version
 * of the record feature (merged over in 31682c7); keep old links working.
 */
export default async function LegacySharedRecord({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  redirect(`/r/${encodeURIComponent(token)}`);
}
