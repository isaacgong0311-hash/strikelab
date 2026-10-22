import { describe, expect, it } from "vitest";
import { createTestDb, type TestDb } from "../../../supabase/testing/db";

/** Records and defenses (0025) against the real schema with RLS on. */
interface StudentRecord {
  handle: string | null;
  seasons: Array<{ season_id: string; rank: number | null; top_ten: boolean; placing_verified: boolean; total_score: number; solved: number; players: number; challenges: Array<{ week: number; official_score: number }> }>;
  verified_capstone: { title: string | null; reviewer: string; share_token: string | null } | null;
  share_token?: string | null;
}

async function setup() {
  const t = await createTestDb();
  await t.db.query("insert into seasons (id, title, starts_on, ends_on) values ('s1', 'Season 1', current_date - 30, current_date - 9)");
  await t.db.query("insert into seasons (id, title, starts_on, ends_on, is_rehearsal) values ('r1', 'Rehearsal', current_date - 30, current_date - 9, true)");
  for (const [id, season, week] of [["s1-w1", "s1", 1], ["s1-w2", "s1", 2], ["r1-w1", "r1", 1]] as const) {
    await t.db.query(
      `insert into season_challenges (id, season_id, week, template_slug, opens_at, closes_at)
       values ($1, $2, $3, 'put-call-parity', now() - interval '20 days', now() - interval '19 days')`,
      [id, season, week]
    );
  }
  return t;
}

async function player(t: TestDb, handle: string | null, scores: Partial<Record<string, number>>) {
  const id = await t.user();
  if (handle) await t.db.query("update profiles set handle = $2 where id = $1", [id, handle]);
  for (const [challenge, score] of Object.entries(scores)) {
    await t.db.query(
      `insert into season_attempts (user_id, challenge_id, deadline, submitted_at, status, official_score)
       values ($1, $2, now() - interval '19 days', now() - interval '19 days', 'scored', $3)`,
      [id, challenge, score]
    );
  }
  return id;
}

const myRecord = (t: TestDb, uid: string) =>
  t.as(uid, async (tx) => (await tx.query<{ r: StudentRecord }>("select my_record() as r")).rows[0].r);
const share = (t: TestDb, uid: string, on: boolean) =>
  t.as(uid, async (tx) => (await tx.query<{ t: string | null }>("select set_record_sharing($1) as t", [on])).rows[0].t);
const shared = async (t: TestDb, token: string) => {
  return t.db.transaction(async (tx) => {
    await tx.exec("set local role anon");
    return (await tx.query<{ r: StudentRecord | null }>("select get_shared_record($1) as r", [token])).rows[0].r;
  });
};
const defend = (t: TestDb, uid: string, kind: "capstone" | "placing", outcome = "verified", season: string | null = null) =>
  t.db.query(
    `insert into defenses (user_id, kind, season_id, outcome, consent_confirmed, reviewer_label)
     values ($1, $2, $3, $4, true, 'Isaac G.')`,
    [uid, kind, season, outcome]
  );

describe("records and defenses (0025)", () => {
  it("builds a record from official scores and leaves rehearsal seasons out", async () => {
    const t = await setup();
    const me = await player(t, "alpha", { "s1-w1": 70, "s1-w2": 75.25, "r1-w1": 80 });
    const rec = await myRecord(t, me);
    expect(rec.handle).toBe("alpha");
    expect(rec.seasons).toHaveLength(1);
    expect(rec.seasons[0]).toMatchObject({ season_id: "s1", solved: 2, players: 1, rank: 1, top_ten: true, placing_verified: false });
    expect(Number(rec.seasons[0].total_score)).toBeCloseTo(145.3, 1);
    expect(rec.seasons[0].challenges.map((c) => c.week)).toEqual([1, 2]);
    expect(rec.verified_capstone).toBeNull();
  });

  it("holds an unverified top-10 rank out of the shared record, and shows it once defended", async () => {
    const t = await setup();
    const me = await player(t, "alpha", { "s1-w1": 90 });
    await player(t, "bravo", { "s1-w1": 50 });
    const token = await share(t, me, true);
    expect(token).toBeTruthy();

    const before = await shared(t, token!);
    expect(before!.seasons[0]).toMatchObject({ rank: null, top_ten: true, placing_verified: false });
    expect((await myRecord(t, me)).seasons[0].rank).toBe(1); // the owner still sees it, marked pending

    await defend(t, me, "placing", "not_verified", "s1");
    expect((await shared(t, token!))!.seasons[0].rank).toBeNull();
    await defend(t, me, "placing", "verified", "s1");
    expect((await shared(t, token!))!.seasons[0]).toMatchObject({ rank: 1, placing_verified: true });
  });

  it("shows ranks outside the top ten without a defense", async () => {
    const t = await setup();
    for (let i = 0; i < 11; i += 1) await player(t, `p${i}x`, { "s1-w1": 90 - i });
    const last = await player(t, "zulu", { "s1-w1": 1 });
    const token = await share(t, last, true);
    expect((await shared(t, token!))!.seasons[0]).toMatchObject({ rank: 12, top_ten: false, players: 12 });
  });

  it("only shows a verified capstone defense, and never the capstone's private share token publicly", async () => {
    const t = await setup();
    const me = await player(t, "alpha", {});
    await defend(t, me, "capstone", "not_verified");
    expect((await myRecord(t, me)).verified_capstone).toBeNull();
    await defend(t, me, "capstone", "verified");
    const rec = await myRecord(t, me);
    expect(rec.verified_capstone).toMatchObject({ reviewer: "Isaac G." });
    const token = await share(t, me, true);
    expect((await shared(t, token!))!.verified_capstone!.share_token).toBeNull();
  });

  it("needs a handle to share, and turning sharing off kills the old link", async () => {
    const t = await setup();
    const nameless = await player(t, null, {});
    await expect(share(t, nameless, true)).rejects.toThrow(/handle_required/);

    const me = await player(t, "alpha", {});
    const first = await share(t, me, true);
    const second = await share(t, me, true);
    expect(second).not.toBe(first);
    expect(await shared(t, first!)).toBeNull();
    expect(await share(t, me, false)).toBeNull();
    expect(await shared(t, second!)).toBeNull();
    expect((await myRecord(t, me)).share_token).toBeNull();
  });

  it("does not let students write defenses, read others' defenses, or call record_json directly", async () => {
    const t = await setup();
    const me = await player(t, "alpha", {});
    const other = await player(t, "bravo", {});
    await defend(t, other, "capstone");
    await expect(
      t.as(me, (tx) => tx.query(
        "insert into defenses (user_id, kind, outcome, consent_confirmed, reviewer_label) values ($1, 'capstone', 'verified', true, 'me')", [me]))
    ).rejects.toThrow();
    const visible = await t.as(me, async (tx) => (await tx.query("select * from defenses")).rows);
    expect(visible).toHaveLength(0);
    await expect(t.as(me, (tx) => tx.query("select record_json($1, false)", [other]))).rejects.toThrow(/permission denied/);
    const token = await share(t, me, true);
    await t.as(me, (tx) => tx.query("update student_records set share_token = gen_random_uuid()").catch(() => undefined));
    expect((await myRecord(t, me)).share_token).toBe(token); // writes go only through set_record_sharing
  });

  it("refuses a defense without recorded consent, or a placing without a season", async () => {
    const t = await setup();
    const me = await player(t, "alpha", {});
    await expect(t.db.query(
      "insert into defenses (user_id, kind, outcome, consent_confirmed, reviewer_label) values ($1, 'capstone', 'verified', false, 'Isaac G.')", [me]
    )).rejects.toThrow();
    await expect(defend(t, me, "placing", "verified", null)).rejects.toThrow();
  });
});
