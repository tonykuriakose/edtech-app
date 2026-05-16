# Session 10 — Student Dashboard & Progress

**Status:** ✅ Complete

---

## What we built

Three pages that give students a real picture of their learning: a home dashboard with stats and recent activity, a full enrolled-courses list with progress tracking, and a detailed progress page with quiz history and weak/strong topics.

---

## Files created or updated

| File | What it does |
|---|---|
| `src/components/course/ProgressRing.tsx` | Reusable SVG progress ring at any size |
| `src/app/(dashboard)/dashboard/page.tsx` | Student home — stats, courses, recent quizzes, weak topics |
| `src/app/(dashboard)/my-courses/page.tsx` | Full enrolled courses list with progress bars + continue buttons |
| `src/app/(dashboard)/progress/page.tsx` | Deep progress — streak, avg score, quiz history, weak/strong topics |

---

## How to test it

1. Log in as `student@cognify.dev / password123`
2. `/dashboard` — stat cards (courses, lessons done, avg score, streak), enrolled course with progress ring, "needs review" topics
3. `/my-courses` — enrolled courses with progress bar + ring + continue button
4. `/progress` — streak, weak/strong topics, full quiz history with pass/fail and time taken

> Note: Lena Park's seed data has `streakDays: 12`. Take a quiz to see weak topics appear.

---

## Key concepts explained

### Role-aware redirect in the dashboard

The `/dashboard` page is used by all roles but each role has a different home:

```ts
if (session.user.role === "TEACHER") redirect("/teach");
if (session.user.role === "ADMIN")   redirect("/admin");
// only STUDENTs reach the student dashboard code below
```

This is called a **role guard at the page level**. It's not in middleware (which handles auth) — middleware only checks "is this user logged in?" The page itself checks "what kind of logged-in user is this?"

### `Promise.all` — parallel database queries

```ts
const [enrollments, recentAttempts, profile] = await Promise.all([
  prisma.enrollment.findMany(...),     // query 1
  prisma.quizAttempt.findMany(...),    // query 2
  prisma.learningProfile.findUnique(), // query 3
]);
```

All three database queries run at the same time. If each takes 80ms, the total wait is ~80ms — not 240ms.

### The `ProgressRing` SVG component

The ring is a circle drawn twice: once as a grey track, once as a coloured fill. The fill uses `strokeDasharray` (total circumference as a single dash) and `strokeDashoffset` (how much of that dash to hide):

```tsx
const r = (size - stroke) / 2;
const circumference = 2 * Math.PI * r;            // full circle length
const offset = circumference - (progress / 100) * circumference; // how much to hide

<circle strokeDasharray={circumference} strokeDashoffset={offset} />
```

`offset = 0` → full ring. `offset = circumference` → empty ring. Values in between fill the ring proportionally.

`rotate(-90deg)` on the SVG starts the fill from the top (12 o'clock) instead of the right (3 o'clock).

### Finding the "next lesson" to continue

In `/my-courses`, the "Continue" button needs to link to the first lesson the student hasn't completed:

```ts
const completedIds = new Set(e.lessonProgress.map((p) => p.lessonId));
const nextLesson = allLessons.find((l) => !completedIds.has(l.id));
```

`allLessons` is the flat list of all lessons in order (from all modules). We walk through them until we find one not in `completedIds`. That's the one to continue from.

### Weak vs strong topics — how they're populated

These aren't set manually. The quiz grading API (`/api/quizzes/[id]/attempt`) updates them automatically:

```ts
// After each quiz submission:
if (score < 70)  → add quiz title to weakTopics[]
if (score >= 85) → remove from weakTopics[]
```

So the `/progress` page is a live view of the LearningProfile that the quiz engine maintains.

---

## Next session

**Session 11 — Teacher Dashboard & Course Editor**

Teachers can already see `/teach` with their courses and generate quizzes. Session 11 adds the ability to create new courses end-to-end: a multi-step form (course → modules → lessons), a rich lesson content editor, and per-course analytics.
