import { describe, expect, it } from "vitest";
import { getLessonById } from "@/lib/lessons";
import { TEMPLATES } from "./templates";
import { isSeasonTraining, TRAIN_WITH, trainLinkFor } from "./train";

describe("train-first links", () => {
  it("point at real lessons whose titles match", () => {
    for (const link of Object.values(TRAIN_WITH)) {
      expect(getLessonById(link.lessonId)?.title, link.lessonId).toBe(link.label);
    }
  });

  it("cover every season challenge template", () => {
    for (const slug of Object.keys(TEMPLATES)) expect(trainLinkFor(slug), slug).not.toBeNull();
  });

  it("returns null for an unknown template", () => {
    expect(trainLinkFor("nope")).toBeNull();
    expect(trainLinkFor("constructor")).toBeNull();
  });

  it("knows which lessons are season training", () => {
    const during = new Date("2026-12-01T15:00:00Z");
    expect(isSeasonTraining("2", during)).toBe(true);
    expect(isSeasonTraining("1", during)).toBe(false);
    // Dec 20 in New York is still the season; Dec 21 is not.
    expect(isSeasonTraining("2", new Date("2026-12-21T03:00:00Z"))).toBe(true);
    expect(isSeasonTraining("2", new Date("2026-12-21T06:00:00Z"))).toBe(false);
  });
});
