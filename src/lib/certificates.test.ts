import { describe, expect, it } from "vitest";
import { isTrackComplete } from "./certificates";
import { TRACKS } from "./tracks";

// isTrackComplete gates certificate issuance (see
// src/app/api/certificates/issue/route.ts) — the only check standing between
// a user and a "verified" completion certificate for a track they didn't
// actually finish. Zero coverage before this file.

describe("isTrackComplete", () => {
  it("returns true when every lesson id in the track is present in completed", () => {
    const track = TRACKS[0];
    const allIds = track.lessons.map((l) => l.id);
    expect(isTrackComplete(track.id, allIds)).toBe(true);
  });

  it("returns true when completed has extra ids beyond the track's own lessons", () => {
    const track = TRACKS[0];
    const allIds = track.lessons.map((l) => l.id);
    expect(isTrackComplete(track.id, [...allIds, "some-other-track-lesson"])).toBe(true);
  });

  it("returns false when even one lesson in the track is missing from completed", () => {
    const track = TRACKS[0];
    const allButLast = track.lessons.slice(0, -1).map((l) => l.id);
    expect(isTrackComplete(track.id, allButLast)).toBe(false);
  });

  it("returns false for an empty completed list", () => {
    expect(isTrackComplete(TRACKS[0].id, [])).toBe(false);
  });

  it("returns false for an unknown track id rather than throwing", () => {
    expect(isTrackComplete("not-a-real-track", ["1", "2", "3"])).toBe(false);
  });

  it("is true independently for every real track, given its own full lesson list", () => {
    for (const track of TRACKS) {
      const allIds = track.lessons.map((l) => l.id);
      expect(isTrackComplete(track.id, allIds)).toBe(true);
    }
  });
});
