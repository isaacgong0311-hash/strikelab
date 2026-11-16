/**
 * Season invite links. A student shares /seasons?src=friend-<handle>; the
 * friend's sign-up stores that tag as profiles.signup_source, so the inviter
 * can see a count (0026) and the founder can see which students recruit.
 * Handles are already public on leaderboards, so the link reveals nothing new.
 */
import { HANDLE_PATTERN } from "./handle";

const PREFIX = "friend-";

export function inviteSrc(handle: string): string {
  return `${PREFIX}${handle}`;
}

/** The inviter's handle from a ?src= value, or null if it isn't an invite. */
export function inviterFromSrc(src: string | null | undefined): string | null {
  if (!src || !src.startsWith(PREFIX)) return null;
  const handle = src.slice(PREFIX.length);
  return HANDLE_PATTERN.test(handle) ? handle : null;
}

export function inviteUrl(origin: string, handle: string): string {
  return `${origin}/seasons?src=${encodeURIComponent(inviteSrc(handle))}`;
}
