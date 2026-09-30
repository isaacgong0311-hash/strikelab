import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { getSupabaseServer } from "@/lib/supabase/server";
import { privatePageMetadata } from "@/lib/seo";
import { requireTeacherOwnsClass } from "@/lib/classes";
import { requestOrigin } from "@/lib/requestOrigin";
import { FACILITATOR_WEEKS, inviteMessage } from "@/lib/cohorts/facilitator";
import { readableDate } from "@/lib/cohorts/launch";
import CopyButton from "@/components/cohort/CopyButton";
import Stepper from "../../Stepper";
import PrintButton from "./PrintButton";
import styles from "../../teach.module.css";

export const metadata = privatePageMetadata({
  title: "Invite your students",
  description: "The invite link, a first message and a printable join card for your class.",
});

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ setup?: string }>;
}) {
  const [{ id }, { setup }] = await Promise.all([params, searchParams]);
  const supabase = await getSupabaseServer();
  if (!supabase) notFound();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/sign-in?next=${encodeURIComponent(`/teach/${id}/invite`)}`);

  const owned = await requireTeacherOwnsClass(supabase, auth.user.id, id);
  if ("error" in owned) notFound();
  const klass = owned.class;

  const joinUrl = `${await requestOrigin()}/join/${klass.joinCode}`;
  // Server-rendered SVG so the card prints with JavaScript off.
  const qrSvg = await QRCode.toString(joinUrl, { type: "svg", margin: 0, errorCorrectionLevel: "M" });
  const message = inviteMessage({ className: klass.name, startsOn: klass.startsOn, joinUrl });
  const scheduled = Boolean(klass.templateId && klass.startsOn);

  return (
    <div className={`${styles.shell} ${styles.narrow}`}>
      <div className={styles.headerText}>
        <p className={styles.kicker}>{klass.name}</p>
        {setup && <Stepper step={3} />}
        <h1 className={styles.title}>{setup ? "You're set. Invite your students." : "Invite your students"}</h1>
        <p className={styles.muted}>
          {scheduled
            ? `The six weeks start ${readableDate(klass.startsOn!)}. Students can join any time before then.`
            : "Students can join now. Pick your first meeting date on the class page when you know it."}
        </p>
      </div>

      <section className={styles.panel} aria-labelledby="link-title">
        <h2 id="link-title" className={styles.sectionTitle}>Invite link</h2>
        <div className={styles.linkBox}>
          <code>{joinUrl}</code>
          <CopyButton text={joinUrl} label="Copy link" className={styles.secondary} event="invite_copied" eventProps={{ what: "link" }} />
        </div>
        <p className={styles.muted}>
          Students open it, sign up (13 or older), and land on this week&apos;s work. The join code is{" "}
          <strong>{klass.joinCode}</strong> if someone would rather type it.
        </p>
      </section>

      <section className={styles.panel} aria-labelledby="message-title">
        <h2 id="message-title" className={styles.sectionTitle}>A first message to send</h2>
        <textarea className={styles.message} readOnly defaultValue={message} aria-labelledby="message-title" />
        <div className={styles.actions}>
          <CopyButton text={message} label="Copy message" className={styles.secondary} event="invite_copied" eventProps={{ what: "message" }} />
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="card-title">
        <h2 id="card-title" className={styles.sectionTitle}>Join card for your first meeting</h2>
        <div className={styles.printCard}>
          <div className={styles.qr} role="img" aria-label={`QR code for ${joinUrl}`} dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <div className={styles.printText}>
            <p className={styles.printTitle}>Join {klass.name} on StrikeLab</p>
            <span>Scan the code, or open:</span>
            <span className={styles.printUrl}>{joinUrl}</span>
            <span>Join code <span className={styles.printCode}>{klass.joinCode}</span></span>
            <span>Free. Ages 13 and up.</span>
          </div>
        </div>
        <div className={styles.actions}>
          <PrintButton className={styles.secondary} />
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="kickoff-title">
        <h2 id="kickoff-title" className={styles.sectionTitle}>At your first meeting</h2>
        <ol className={styles.steps}>
          <li>Students scan the card or open the link and sign up. Have the link on the board for anyone without a phone.</li>
          <li>Everyone finishes the first short lesson together, in the room.</li>
          <li>Show them the cohort home: that&apos;s where each week&apos;s work appears.</li>
          <li>Close with week 1&apos;s goal: {FACILITATOR_WEEKS[0].objective}</li>
        </ol>
      </section>

      <div className={styles.actions}>
        <Link href={`/dashboard/class/${klass.id}`} className={styles.primary}>Go to the class page</Link>
        <Link href="/teach" className={styles.secondary}>All my classes</Link>
      </div>
    </div>
  );
}
