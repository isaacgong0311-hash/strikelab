/**
 * A student's record (proving-ground spec §3): seasons and placings, the
 * challenges they solved with official scores, and a verified capstone.
 * Built in the database by record_json() (migration 0025); this module only
 * parses that JSON defensively and phrases it for the page.
 */
import { getTemplate } from "@/lib/seasons/templates";

export interface RecordChallenge {
  week: number;
  title: string;
  officialScore: number;
}

export interface RecordSeason {
  seasonId: string;
  title: string;
  totalScore: number;
  solved: number;
  players: number;
  /** Null when a top-10 rank is held back pending a defense. */
  rank: number | null;
  topTen: boolean;
  placingVerified: boolean;
  challenges: RecordChallenge[];
}

export interface VerifiedCapstone {
  title: string | null;
  defendedOn: string;
  reviewer: string;
  /** The capstone's own share token (owner view only). */
  shareToken: string | null;
}

export interface StudentRecord {
  handle: string | null;
  seasons: RecordSeason[];
  verifiedCapstone: VerifiedCapstone | null;
  /** The record's share token (owner view only). */
  shareToken: string | null;
}

const num = (v: unknown): number => (typeof v === "number" ? v : Number(v ?? 0)) || 0;
const str = (v: unknown): string | null => (typeof v === "string" && v.length > 0 ? v : null);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

export function parseRecord(raw: unknown): StudentRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const r = obj(raw);
  const seasons = Array.isArray(r.seasons) ? r.seasons : [];
  const cap = r.verified_capstone ? obj(r.verified_capstone) : null;
  return {
    handle: str(r.handle),
    shareToken: str(r.share_token),
    seasons: seasons.map((s) => {
      const o = obj(s);
      const challenges = Array.isArray(o.challenges) ? o.challenges : [];
      return {
        seasonId: str(o.season_id) ?? "",
        title: str(o.title) ?? "Season",
        totalScore: num(o.total_score),
        solved: num(o.solved),
        players: num(o.players),
        rank: o.rank === null || o.rank === undefined ? null : num(o.rank),
        topTen: o.top_ten === true,
        placingVerified: o.placing_verified === true,
        challenges: challenges.map((c) => {
          const co = obj(c);
          const slug = str(co.template_slug) ?? "";
          return { week: num(co.week), title: getTemplate(slug)?.title ?? "Challenge", officialScore: num(co.official_score) };
        }),
      };
    }),
    verifiedCapstone: cap
      ? { title: str(cap.title), defendedOn: str(cap.defended_on) ?? "", reviewer: str(cap.reviewer) ?? "a reviewer", shareToken: str(cap.share_token) }
      : null,
  };
}

/** How a season's placing reads on the record. */
export function placingLabel(s: RecordSeason, viewer: "owner" | "public"): string {
  if (s.topTen && !s.placingVerified) {
    return viewer === "owner"
      ? `Top 10 (#${s.rank ?? "?"} of ${s.players}): shows on your shared record after a short live defense`
      : `Finished the season (${s.players} players)`;
  }
  if (s.rank === null) return `Finished the season (${s.players} players)`;
  return `#${s.rank} of ${s.players}${s.topTen ? ", verified in a live defense" : ""}`;
}

export function readableDate(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}/.test(isoDate)) return isoDate;
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${isoDate.slice(0, 10)}T00:00:00Z`));
}

export function isEmptyRecord(r: StudentRecord): boolean {
  return r.seasons.length === 0 && !r.verifiedCapstone;
}
