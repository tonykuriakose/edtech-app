# Session 12 — Admin Panel

**Status:** ✅ Complete

---

## What we built

Four admin pages that give platform operators full visibility and control: an overview dashboard, a user management table with role changes, a course approval queue, and a platform-wide stats breakdown.

---

## Files created

| File | What it does |
|---|---|
| `src/app/(dashboard)/admin/page.tsx` | Overview — stat cards + quick-action links with pending-review count |
| `src/app/(dashboard)/admin/users/page.tsx` | User table — role badges + promote/demote Server Actions |
| `src/app/(dashboard)/admin/approvals/page.tsx` | Course queue — approve, archive, unpublish per course |
| `src/app/(dashboard)/admin/stats/page.tsx` | Platform stats — users by role, courses by status, quiz aggregates, top courses |

---

## How to test it

1. Log in as `admin@cognify.dev / password123`
2. `/admin` — see stat cards (users, courses, enrollments, attempts) + pending draft count
3. `/admin/users` — see all 3 seed users; click "→ Teacher" to promote the student
4. `/admin/approvals` — see any DRAFT courses; click "✓ Approve & publish" to make them live
5. `/admin/stats` — see breakdown by role, course status, top enrolled courses, quiz pass rate

---

## Key concepts explained

### `groupBy` in Prisma — counting without fetching all rows

```ts
const usersByRole = await prisma.user.groupBy({
  by: ["role"],
  _count: { id: true },
});
// → [{ role: "STUDENT", _count: { id: 42 } }, { role: "TEACHER", _count: { id: 8 } }, ...]
```

`groupBy` runs a single `GROUP BY` SQL query. Without it, you'd fetch all users just to count them by role — wasteful at scale. The result is an array of `{ role, _count }` objects; the helper function `roleCount(role)` looks up the right one.

### `aggregate` — computing averages in the database

```ts
const result = await prisma.quizAttempt.aggregate({
  where: { status: "COMPLETED" },
  _avg: { score: true },
});
// result._avg.score → 73.4 (the SQL AVG())
```

Instead of fetching all attempt scores and summing them in JavaScript, Prisma delegates the `AVG()` to Postgres. Correct, efficient, and works regardless of how many rows exist.

### Server Action security: double-checking role

Every Server Action re-fetches the session from the database rather than trusting the session cookie alone:

```ts
async function changeRole(formData: FormData) {
  "use server";
  const s = await auth();                      // fresh session check
  if (!s || s.user.role !== "ADMIN") return;   // bail if not admin

  // Also prevent admins from demoting themselves:
  if (userId === s.user.id) return;
  ...
}
```

A malicious user could forge a POST to the Server Action endpoint. The double-check (role in DB, not role from cookie) prevents privilege escalation.

### Course status machine

```
DRAFT → (admin approves) → PUBLISHED → (admin unpublishes) → DRAFT
DRAFT → (admin archives) → ARCHIVED → (admin restores) → DRAFT
PUBLISHED → (admin archives) → ARCHIVED
```

The approvals page implements all these transitions with a single `setCourseStatus` Server Action that takes the target status as a form value. Each button submits a hidden `status` input pointing to the next state.

### `orderBy: { enrollments: { _count: "desc" } }` — sort by relation count

```ts
prisma.course.findMany({
  orderBy: { enrollments: { _count: "desc" } },
  take: 5,
})
```

Prisma translates this to a SQL subquery counting enrollments per course and sorting by it — all in one query. This gives us the top 5 most-enrolled courses without fetching every course.

---

## Next session

**Session 13 — Testing**

Unit tests with Vitest for the pure functions (`lib/adaptive.ts`, Zod validation), integration tests for the quiz attempt API route, and three Playwright E2E flows: auth, student learning, teacher creation.
