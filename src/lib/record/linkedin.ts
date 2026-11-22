import { SEASON_TIME_ZONE } from "@/lib/seasons/seasonDate";

/**
 * LinkedIn's "Add licence or certification" prefill link
 * (https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME). The
 * student still reviews and saves it on LinkedIn; nothing is posted for them.
 * The issue month is read in New York, where season days are counted.
 */
export function linkedInAddUrl({ name, issuedAt, certUrl }: { name: string; issuedAt: string; certUrl: string }): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: SEASON_TIME_ZONE, year: "numeric", month: "numeric" })
      .formatToParts(new Date(issuedAt)).map((part) => [part.type, part.value]),
  );
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name,
    organizationName: "StrikeLab",
    issueYear: parts.year,
    issueMonth: parts.month,
    certUrl,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

/** What a shared record can honestly be called on LinkedIn: its best verified item, or nothing. */
export function linkedInCredential(
  record: { placings: { seasonId: string; rank: number; verifiedAt: string }[]; capstones: { verifiedAt: string }[] },
  seasonTitles: Record<string, string>,
): { name: string; issuedAt: string } | null {
  const placing = record.placings[0];
  if (placing) {
    const season = seasonTitles[placing.seasonId] ?? "Season";
    return { name: `StrikeLab ${season}: verified #${placing.rank} placing`, issuedAt: placing.verifiedAt };
  }
  const capstone = record.capstones[0];
  return capstone ? { name: "StrikeLab verified capstone", issuedAt: capstone.verifiedAt } : null;
}
