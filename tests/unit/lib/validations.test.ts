import { describe, it, expect } from "vitest";
import { CreateCourseSchema, SubmitQuizSchema, RegisterSchema } from "@/lib/validations";

// ── CreateCourseSchema ─────────────────────────────────────────────────────

describe("CreateCourseSchema", () => {
  const valid = {
    title: "Intro to TypeScript",
    description: "Learn TypeScript from scratch in this comprehensive course.",
    difficulty: "BEGINNER" as const,
    category: "Programming",
  };

  it("accepts a fully valid course", () => {
    expect(() => CreateCourseSchema.parse(valid)).not.toThrow();
  });

  it("rejects a title shorter than 3 characters", () => {
    expect(() => CreateCourseSchema.parse({ ...valid, title: "Hi" })).toThrow();
  });

  it("rejects a description shorter than 10 characters", () => {
    expect(() =>
      CreateCourseSchema.parse({ ...valid, description: "Too short" })
    ).toThrow();
  });

  it("rejects an invalid difficulty value", () => {
    expect(() =>
      CreateCourseSchema.parse({ ...valid, difficulty: "EXPERT" })
    ).toThrow();
  });

  it("accepts all three valid difficulty values", () => {
    for (const d of ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const) {
      expect(() =>
        CreateCourseSchema.parse({ ...valid, difficulty: d })
      ).not.toThrow();
    }
  });

  it("rejects an empty category", () => {
    expect(() =>
      CreateCourseSchema.parse({ ...valid, category: "" })
    ).toThrow();
  });
});

// ── SubmitQuizSchema ───────────────────────────────────────────────────────

describe("SubmitQuizSchema", () => {
  const valid = {
    answers: [
      { questionId: "q1abc", selectedOption: 0 },
      { questionId: "q2abc", selectedOption: 2 },
    ],
  };

  it("accepts valid answers", () => {
    expect(() => SubmitQuizSchema.parse(valid)).not.toThrow();
  });

  it("rejects an empty answers array", () => {
    expect(() => SubmitQuizSchema.parse({ answers: [] })).toThrow();
  });

  it("rejects selectedOption greater than 3 (only 4 options: 0-3)", () => {
    expect(() =>
      SubmitQuizSchema.parse({
        answers: [{ questionId: "q1abc", selectedOption: 4 }],
      })
    ).toThrow();
  });

  it("rejects a negative selectedOption", () => {
    expect(() =>
      SubmitQuizSchema.parse({
        answers: [{ questionId: "q1abc", selectedOption: -1 }],
      })
    ).toThrow();
  });

  it("rejects a non-integer selectedOption", () => {
    expect(() =>
      SubmitQuizSchema.parse({
        answers: [{ questionId: "q1abc", selectedOption: 1.5 }],
      })
    ).toThrow();
  });
});

// ── RegisterSchema ─────────────────────────────────────────────────────────

describe("RegisterSchema", () => {
  const valid = {
    name: "Tony Kuriakose",
    email: "tony@example.com",
    password: "secure123",
  };

  it("accepts valid registration data", () => {
    expect(() => RegisterSchema.parse(valid)).not.toThrow();
  });

  it("rejects an invalid email address", () => {
    expect(() =>
      RegisterSchema.parse({ ...valid, email: "not-an-email" })
    ).toThrow();
  });

  it("rejects a password shorter than 6 characters", () => {
    expect(() =>
      RegisterSchema.parse({ ...valid, password: "12345" })
    ).toThrow();
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(() =>
      RegisterSchema.parse({ ...valid, name: "T" })
    ).toThrow();
  });
});
