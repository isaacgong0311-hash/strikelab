import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CredentialHeader, CredentialSection, PlacingBadge, RulesLink, credentialStyles as styles } from "@/components/seasons/Credential";
import { ActionLink } from "@/components/ui/Action";
import { getSharedRecord } from "@/lib/record/getSharedRecord";
import { linkedInAddUrl, linkedInCredential } from "@/lib/record/linkedin";
import { SEASON_TIME_ZONE } from "@/lib/seasons/seasonDate";
import { getTemplate } from "@/lib/seasons/templates";
import { SITE_URL } from "@/lib/site";
import { getSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Shared record",
  description: "Verified work from a StrikeLab student.",
  robots: { index: false, follow: false },
};

function date(value: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: SEASON_TIME_ZONE }).format(new Date(value));
}

/** Season titles and the concepts each one tested. Seasons and challenge slots are public rows (0024). */
async function seasonDetails(seasonIds: string[]) {
  const titles: Record<string, string> = {};
  const topics: Record<string, string[]> = {};
  if (seasonIds.length === 0) return { titles, topics };
  try {
    const supabase = await getSupabaseServer();
    if (!supabase) return { titles, topics };
    const [{ data: seasons }, { data: challenges }] = await Promise.all([
      supabase.from("seasons").select("id, title").in("id", seasonIds),
      supabase.from("season_challenges").select("season_id, week, template_slug").in("season_id", seasonIds).order("week"),
    ]);
    for (const season of (seasons ?? []) as { id: string; title: string }[]) {
      if (seasonIds.includes(season.id)) titles[season.id] = season.title;
    }
    for (const challenge of (challenges ?? []) as { season_id: string; week: number; template_slug: string }[]) {
      const concept = getTemplate(challenge.template_slug)?.concept;
      if (!concept || !seasonIds.includes(challenge.season_id)) continue;
      const list = (topics[challenge.season_id] ??= []);
      if (!list.includes(concept)) list.push(concept);
    }
  } catch {
    // Titles are a nicety: the verified items still render without them.
  }
  return { titles, topics };
}

/** True when the signed-in viewer owns this link. Their own record_shares row is readable only by them (0025). */
async function viewerOwns(token: string): Promise<boolean> {
  try {
    const supabase = await getSupabaseServer();
    if (!supabase) return false;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return false;
    const { data } = await supabase.from("record_shares").select("token, revoked_at").eq("user_id", auth.user.id).maybeSingle();
    return Boolean(data && !data.revoked_at && data.token === token);
  } catch {
    return false;
  }
}

export default async function SharedRecordPage({ params }: { params: Promise<{ token: string }> }) {
  await connection();
  const { token } = await params;
  const record = await getSharedRecord(token);
  if (!record) notFound();

  const seasonIds = [...new Set(record.placings.map((placing) => placing.seasonId))];
  const [{ titles, topics }, isOwner] = await Promise.all([seasonDetails(seasonIds), viewerOwns(token)]);
  const assessed = [...new Set(seasonIds.flatMap((id) => topics[id] ?? []))];
  const credential = isOwner ? linkedInCredential(record, titles) : null;
  const publicUrl = `${SITE_URL}/r/${token}`;

  return (
    <main className={styles.page}>
      {isOwner && (
        <div className={styles.ownerBar}>
          <p>This is your public record. Only verified items appear here.</p>
          <div className={styles.actions}>
            {credential && (
              <ActionLink href={linkedInAddUrl({ ...credential, certUrl: publicUrl })} variant="secondary" size="sm" target="_blank">
                Add to LinkedIn<span className="sl-visually-hidden"> (opens in a new tab)</span>
              </ActionLink>
            )}
            <ActionLink href="/record#record-share" variant="ghost" size="sm">Manage sharing</ActionLink>
          </div>
        </div>
      )}

      <CredentialHeader
        visibility="Shared record"
        title={`@${record.handle}`}
        lede="Season results and capstones confirmed by StrikeLab in a short live defense. The student shared this link and can revoke it at any time."
        facts={[
          { label: "Issued by", value: "StrikeLab" },
          { label: "Seasons", value: seasonIds.length ? seasonIds.map((id) => titles[id] ?? "Season").join(", ") : "None verified yet" },
          { label: "Last verified", value: record.lastVerifiedAt ? date(record.lastVerifiedAt) : "Not yet verified" },
          { label: "Assessed", value: assessed.length ? assessed.join(", ") : record.capstones.length ? "Capstone project" : "Nothing verified yet" },
          { label: "Rules", value: <RulesLink /> },
        ]}
      />

      <CredentialSection id="shared-placings" title="Season placings" meta={`${record.placings.length} verified`}>
        {record.placings.length === 0 ? <p className={styles.empty}>No verified season placings on this record yet.</p> : (
          <ol className={styles.rows}>{record.placings.map((placing, index) => (
            <li className={styles.row} key={`${placing.seasonId}-${placing.rank}-${index}`}>
              <div className={styles.rowHead}>
                <h3>{titles[placing.seasonId] ?? "Season"}</h3>
                <PlacingBadge state={{ kind: "verified", at: placing.verifiedAt }} date={date} />
              </div>
              <dl className={styles.stats}>
                <div><dt>Final placing</dt><dd className={styles.figure}>#{placing.rank}</dd></div>
              </dl>
              {(topics[placing.seasonId] ?? []).length > 0 && (
                <p className={styles.rowText}>Tested: {topics[placing.seasonId].join(", ")}</p>
              )}
            </li>
          ))}</ol>
        )}
      </CredentialSection>

      <CredentialSection id="shared-capstones" title="Capstones" meta={`${record.capstones.length} verified`}>
        {record.capstones.length === 0 ? <p className={styles.empty}>No verified capstones on this record yet.</p> : (
          <ul className={styles.rows}>{record.capstones.map((capstone, index) => (
            <li className={styles.row} key={`${capstone.verifiedAt}-${index}`}>
              <div className={styles.rowHead}>
                <h3>Capstone project</h3>
                <PlacingBadge state={{ kind: "verified", at: capstone.verifiedAt }} date={date} />
              </div>
              <p className={styles.rowText}>A project the student built, then explained in a live conversation.</p>
            </li>
          ))}</ul>
        )}
      </CredentialSection>

      <footer className={styles.footer}>
        <p>Verified items only. Scores that haven&apos;t been through a live defense, and the student&apos;s name, are never shown here.</p>
        <Link href="/" className={styles.inlineLink}>What is StrikeLab?</Link>
      </footer>
    </main>
  );
}
