import { describe, it, expect } from "vitest";
import { computeDifficulty, updateWeakTopics } from "@/lib/adaptive";

describe("computeDifficulty", () => {
  it("returns BEGINNER when no scores", () => {
    expect(computeDifficulty([])).toBe("BEGINNER");
  });

  it("returns BEGINNER when average is below 60", () => {
    expect(computeDifficulty([40, 50, 55])).toBe("BEGINNER");
  });

  it("returns INTERMEDIATE when average is between 60 and 85", () => {
    expect(computeDifficulty([70, 75, 80])).toBe("INTERMEDIATE");
  });

  it("returns ADVANCED when average is above 85", () => {
    expect(computeDifficulty([90, 95, 100])).toBe("ADVANCED");
  });

  it("only uses the last 5 scores, ignoring older ones", () => {
    // First 10 scores are terrible (10), last 5 are excellent (90+)
    const scores = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 90, 92, 94, 88, 95];
    expect(computeDifficulty(scores)).toBe("ADVANCED");
  });

  it("treats exactly 60 as INTERMEDIATE (boundary)", () => {
    expect(computeDifficulty([60])).toBe("INTERMEDIATE");
  });

  it("treats exactly 85 as INTERMEDIATE (boundary)", () => {
    expect(computeDifficulty([85])).toBe("INTERMEDIATE");
  });

  it("treats 85.1 (anything above 85) as ADVANCED", () => {
    // six scores averaging 86
    expect(computeDifficulty([86, 86, 86, 86, 86])).toBe("ADVANCED");
  });
});

describe("updateWeakTopics", () => {
  it("adds a new topic when the student fails", () => {
    const result = updateWeakTopics(["Math"], "Physics", false);
    expect(result).toContain("Physics");
    expect(result).toHaveLength(2);
  });

  it("does not duplicate a topic already in the weak list", () => {
    const result = updateWeakTopics(["Math", "Physics"], "Physics", false);
    expect(result).toHaveLength(2);
  });

  it("removes a topic when the student passes", () => {
    const result = updateWeakTopics(["Math", "Physics"], "Physics", true);
    expect(result).not.toContain("Physics");
    expect(result).toContain("Math");
  });

  it("leaves the list unchanged when passing a topic not in it", () => {
    const result = updateWeakTopics(["Math"], "Physics", true);
    expect(result).toEqual(["Math"]);
  });

  it("returns an empty list when the only weak topic is cleared", () => {
    const result = updateWeakTopics(["Physics"], "Physics", true);
    expect(result).toEqual([]);
  });
});
