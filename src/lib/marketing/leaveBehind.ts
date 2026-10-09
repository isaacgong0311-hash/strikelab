import { SITE_URL } from "@/lib/site";

/**
 * Where the printed leave-behind sends people. Always the production origin:
 * the sheet gets printed from wherever it's opened (a preview deploy, localhost)
 * and the QR must not encode that. `?src=leave_behind` is read by the first-touch
 * attribution on landing and stored with the sign-up, so a pilot that started from
 * paper shows up as such in the leader funnel.
 */
export const LEAVE_BEHIND_SRC = "leave_behind";
export const LEAVE_BEHIND_URL = `${SITE_URL}/pilot?src=${LEAVE_BEHIND_SRC}`;

/** The short form people read off the page and type. */
export const LEAVE_BEHIND_SHORT_URL = SITE_URL.replace(/^https?:\/\//, "") + "/pilot";
