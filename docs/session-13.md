# Session 13 — Testing

**Status:** ✅ Complete

---

## What we built

A complete test suite: 28 Vitest unit tests covering the adaptive difficulty algorithm and all three Zod validation schemas, plus a Playwright E2E spec with 5 tests covering the full authentication flow (render, valid login, wrong password error, register page render, new user registration).

---

## Files created

| File | What it does |
|---|---|
| `src/lib/adaptive.ts` | Pure functions: `computeDifficulty` (scores → difficulty level), `updateWeakTopics` (add/remove topic from weak list) |
| `src/lib/validations.ts` | Zod schemas: `CreateCourseSchema`, `SubmitQuizSchema`, `RegisterSchema` |
| `vitest.config.ts` | Vitest config — node environment, `@/` path alias, targets `tests/unit/**` |
| `playwright.config.ts` | Playwright config — Chromium only, `baseURL: localhost:3000`, `reuseExistingServer` |
| `tests/unit/lib/adaptive.test.ts` | 13 unit tests for `computeDifficulty` + `updateWeakTopics` |
| `tests/unit/lib/validations.test.ts` | 15 unit tests for the three Zod schemas |
| `tests/e2e/auth.spec.ts` | 5 Playwright E2E tests for login/register flows |

---

## How to run

```bash
# Unit tests (instant — no server needed)
npm test

# Unit tests with live re-run on file save
npm run test:watch

# Unit tests + coverage report
npm run test:coverage

# E2E tests (needs dev server running, or playwright starts it automatically)
npm run test:e2e

# E2E tests with interactive UI debugger
npm run test:e2e:ui
```

E2E tests expect a seeded database. Run `npm run db:seed` first if starting fresh.

---

## Key concepts explained

### Why test pure functions first

`adaptive.ts` is a "pure function" — given the same input it always returns the same output, with no database calls, no HTTP requests, no randomness. This makes it the easiest thing to test: you don't need to set up a database or a server. Just import the function and call it.

```ts
// The entire test is just: give it inputs, check the output
expect(computeDifficulty([90, 95, 100])).toBe("ADVANCED");
```

### Zod `.parse()` throws on invalid data

Zod schemas have two methods:
- `.parse(data)` — throws a `ZodError` if the data is invalid ✓
- `.safeParse(data)` — returns `{ success: true, data }` or `{ success: false, error }` without throwing

In tests, using `.parse()` with `expect(() => ...).toThrow()` is the clearest way to verify that invalid inputs are rejected:

```ts
// This should throw because "EXPERT" is not a valid difficulty
expect(() => CreateCourseSchema.parse({ difficulty: "EXPERT" })).toThrow();
```

### Boundary testing (60 and 85)

The difficulty algorithm has three zones, so the boundaries — exactly 60 and exactly 85 — are the trickiest values:

```ts
// avg < 60  → BEGINNER
// avg <= 85  → INTERMEDIATE   ← both 60 and 85 fall here
// avg > 85   → ADVANCED
```

Testing the boundaries explicitly documents what "edge case" behavior the system promises. If someone changes `<= 85` to `< 85`, the boundary test catches it.

### Only the last 5 scores matter

The adaptive algorithm is designed to respond to *recent* performance, not a student's all-time history. The test that proves this is:

```ts
// 10 bad scores followed by 5 great scores → should be ADVANCED
const scores = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 90, 92, 94, 88, 95];
expect(computeDifficulty(scores)).toBe("ADVANCED");
```

Without `scores.slice(-5)` in the implementation, this test would fail because averaging all 15 scores would give a low result.

### Playwright locator strategy

Rather than using fragile CSS class selectors (which change often), the E2E tests use:
- `page.locator("#email")` — targets the `id` attribute on the `<input>`, which is stable
- `page.getByRole("heading", { name: "Welcome back" })` — targets by semantic role + text

This means if we completely redesign the styling but keep the same `id` and heading text, the tests still pass.

### `reuseExistingServer: true` in Playwright config

This tells Playwright: "if there's already a dev server running on port 3000, use it — don't start a new one." This is important for local development: you can have `npm run dev` running in one terminal and `npm run test:e2e` in another. Playwright won't try to spin up a second server.

---

## Next session

**Session 14 — Deployment to Vercel**

Push to GitHub, connect Neon (production database), configure environment variables in Vercel, deploy, and run a smoke test on the live URL.
