import { describe, expect, it } from "vitest";
import { getLessonById } from "@/lib/lessons";
import { TEMPLATES } from "./templates";
import { TRAIN_WITH, trainLinkFor } from "./train";

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
});
