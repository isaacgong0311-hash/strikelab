import { headers } from "next/headers";
import { SITE_URL } from "@/lib/site";

/**
 * The origin this request was served from (e.g. https://strikelab.dev or a
 * preview URL), for links a teacher shares or prints. Falls back to the
 * production domain when the host header is missing.
 */
export async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return SITE_URL;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}
