# Session 11 — Teacher Dashboard & Course Editor

**Status:** ✅ Complete

---

## What we built

Teachers can now create courses end-to-end: fill in a form → course saved as DRAFT → add modules → add lessons → generate quizzes → publish. A per-course analytics page shows student completion rates and quiz scores.

---

## Files created or updated

| File | What it does |
|---|---|
| `src/app/(dashboard)/courses/new/page.tsx` | New course form → Server Action creates course → redirect to editor |
| `src/app/(dashboard)/teach/courses/[id]/edit/page.tsx` | Add modules + lessons, publish/unpublish toggle |
| `src/app/(dashboard)/teach/courses/[id]/analytics/page.tsx` | Lesson completion bars, student list, quiz averages |
| `src/app/(dashboard)/teach/courses/page.tsx` | Redirect to `/teach` (sidebar link target) |
| `src/app/(dashboard)/teach/courses/[id]/page.tsx` | Updated — added Edit + Analytics quick links |

---

## Complete teacher workflow

```
1. Click "New course" in sidebar
2. /courses/new → fill title, description, difficulty, category → submit
3. Server Action creates Course (status: DRAFT), redirects → /teach/courses/[id]/edit
4. Add modules (form at bottom)
5. Add lessons to each module (expandable form per module)
6. Generate quizzes with AI (button per lesson)
7. Click "Publish course" → status: PUBLISHED → appears in /courses catalog
8. View /teach/courses/[id]/analytics → see enrollment, completion %, quiz averages
```

---

## Key concepts explained

### Server Actions for mutations — no API routes needed

All three mutations (add module, add lesson, publish toggle) are Server Actions defined directly in the page file:

```ts
async function addModule(formData: FormData) {
  "use server";
  const s = await auth();
  // ... validate, create in DB
  revalidatePath(`/teach/courses/${id}/edit`);
}

// In JSX:
<form action={addModule}>
  <input name="moduleTitle" />
  <button type="submit">Add module</button>
</form>
```

The `"use server"` directive marks the function to run on the server. Next.js handles the POST request automatically. No `fetch()`, no API route file.

`revalidatePath()` tells Next.js to re-fetch and re-render the page with fresh data from the database — so the new module appears immediately after submit.

### Auto-incrementing order

When adding a module or lesson, we find the current highest `order` and add 1:

```ts
const lastModule = await prisma.module.findFirst({
  where: { courseId: id },
  orderBy: { order: "desc" },
  select: { order: true },
});
const nextOrder = (lastModule?.order ?? 0) + 1;
```

`?? 0` handles the case where there are no modules yet — the first module gets order 1.

### Slug with timestamp for uniqueness

Lesson and course slugs are generated from the title but need to be unique:

```ts
const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const slug = `${base}-${Date.now()}`;
// "Introduction to Hooks" → "introduction-to-hooks-1716123456789"
```

Appending `Date.now()` (milliseconds since epoch) makes collisions extremely unlikely. A production app would use a database-level unique constraint and retry on conflict.

### `<details>` / `<summary>` for show/hide without JavaScript

The "Add lesson" form per module uses the native HTML `<details>` element — no state, no `useState`:

```html
<details>
  <summary>+ Add lesson to this module</summary>
  <form>...</form>
</details>
```

Click summary → content expands. Click again → collapses. This is built into every browser with no JavaScript needed. The `list-none` class removes the default triangle from `<summary>`.

### Analytics: per-lesson completion rate

```ts
const completedCount = lesson.progress.length; // # of students who completed it
const pct = Math.round((completedCount / totalStudents) * 100);
```

`lesson.progress` is the `LessonProgress` records where `completed: true`. We filter by the current course's enrollments when querying, so we only count students enrolled in this course.

The bar width is `pct%` — a simple CSS width on a coloured div — same pattern used throughout the app.

---

## Next session

**Session 12 — Admin Panel**

Admins can manage users (view all, change roles), review courses, and see platform-wide stats. Built with server-side data tables and role-change Server Actions.
