import { describe, expect, it } from "vitest";
import { inviteSrc, inviteUrl, inviterFromSrc } from "./invite";

describe("season invites", () => {
  it("round-trips a handle through the ?src= tag", () => {
    expect(inviterFromSrc(inviteSrc("quant_kid7"))).toBe("quant_kid7");
  });

  it("builds a link to /seasons that fits the 64-character attribution cap", () => {
    const url = inviteUrl("https://strikelab.dev", "a_twenty_char_handle");
    expect(url).toBe("https://strikelab.dev/seasons?src=friend-a_twenty_char_handle");
    expect(new URL(url).searchParams.get("src")!.length).toBeLessThanOrEqual(64);
  });

  it("ignores tags that aren't invites or don't hold a valid handle", () => {
    expect(inviterFromSrc(null)).toBeNull();
    expect(inviterFromSrc("email-chapter")).toBeNull();
    expect(inviterFromSrc("friend-")).toBeNull();
    expect(inviterFromSrc("friend-Has Spaces")).toBeNull();
    expect(inviterFromSrc("friend-<script>")).toBeNull();
  });
});
