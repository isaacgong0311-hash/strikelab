"use client";

import { useState, useSyncExternalStore } from "react";
import { trackMarketing } from "@/lib/analytics";
import { inviteUrl } from "@/lib/seasons/invite";
import { SITE_URL } from "@/lib/site";
import styles from "./invite.module.css";

const noopSubscribe = () => () => {};

/**
 * A signed-in player's personal invite link. Friends who sign up through it
 * are counted (0026) — the count only, never who they are.
 */
export default function InviteCard({ handle, invited, seasonTitle }: { handle: string; invited: number | null; seasonTitle: string }) {
  const url = inviteUrl(SITE_URL, handle);
  const [copied, setCopied] = useState(false);
  // False on the server and during hydration, then the browser's real answer.
  const canShare = useSyncExternalStore(
    noopSubscribe,
    () => typeof navigator.share === "function",
    () => false,
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackMarketing("invite_copied", { kind: "season" });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked: the field is selectable, so the student can copy by hand.
    }
  }

  async function share() {
    try {
      await navigator.share({
        title: `StrikeLab ${seasonTitle}`,
        text: `I'm playing StrikeLab ${seasonTitle}: free timed quant challenges in Python. Play with me:`,
        url,
      });
      trackMarketing("invite_copied", { kind: "season-share" });
    } catch {
      // Dismissed the share sheet.
    }
  }

  return (
    <section className={styles.card} aria-labelledby="invite-title">
      <h3 id="invite-title" className={styles.title}>Bring your friends</h3>
      <p className={styles.help}>
        Seasons are more fun against people you know. Share your link; anyone who joins through it counts toward your invites.
      </p>
      <div className={styles.linkRow}>
        <input
          className={styles.link}
          value={url}
          readOnly
          aria-label="Your invite link"
          onFocus={(e) => e.currentTarget.select()}
        />
        {canShare && (
          <button type="button" className={styles.button} data-primary="true" onClick={share}>Share</button>
        )}
        <button type="button" className={styles.button} data-primary={!canShare} onClick={copy}>
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
      <span role="status" className="sr-only">{copied ? "Invite link copied" : ""}</span>
      <div className={styles.meta}>
        <p className={styles.count}>Playing as @{handle}</p>
        {invited !== null && (
          <p className={styles.count}>
            {invited === 0 ? "No one has joined through your link yet." : `${invited} ${invited === 1 ? "friend has" : "friends have"} joined through your link.`}
          </p>
        )}
        <a className={styles.calendar} href="/seasons/calendar.ics" download>Add challenge dates to your calendar</a>
      </div>
    </section>
  );
}
