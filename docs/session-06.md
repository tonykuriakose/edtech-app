# Session 06 — Lesson Viewer

**Status:** ✅ Complete

---

## What we built

The lesson reader at `/courses/[slug]/[lessonSlug]` — the core of the learning experience.

---

## Files created or updated

| File | What changed |
|---|---|
| `src/app/globals.css` | Added `.prose` styles — headings, paragraphs, code blocks, lists |
| `src/app/(dashboard)/courses/[slug]/[lessonSlug]/page.tsx` | New — full lesson viewer |

---

## What the page does

1. **Reads the URL params** — `slug` (the course) and `lessonSlug` (the lesson)
2. **Checks enrollment** — if the user isn't enrolled, redirects them to the course detail page
3. **Renders 3 columns:**
   - **Left panel** — all modules and lessons with completion dots and active highlight
   - **Center** — lesson content rendered from Markdown; with Prev/Next buttons at the bottom
   - **Right** — AI Tutor panel placeholder (will be wired up in Session 9)
4. **"Mark complete & next →"** button — runs a Server Action that saves progress and advances to the next lesson

---

## Key concepts explained

### Nested dynamic routes

```
src/app/(dashboard)/courses/
  [slug]/                      ← matches /courses/intro-to-react
    page.tsx                   ← course detail
    [lessonSlug]/              ← matches /courses/intro-to-react/what-is-react
      page.tsx                 ← lesson viewer
```

Both `[slug]` and `[lessonSlug]` are dynamic segments. Next.js passes them as `params`:

```tsx
type Props = { params: Promise<{ slug: string; lessonSlug: string }> };

const { slug, lessonSlug } = await params;
```

### `next-mdx-remote/rsc` — rendering Markdown

The lesson content is stored as plain Markdown text in the database:

```
# What is React?
React is a JavaScript library...

## Why React?
- **Component-based** — you break your UI into small pieces
```

`MDXRemote` converts that text into HTML on the server:

```tsx
import { MDXRemote } from "next-mdx-remote/rsc";

<MDXRemote source={lesson.content} />
```

The output is plain `<h1>`, `<p>`, `<ul>`, `<code>` tags. We added a `.prose` CSS class in `globals.css` to style those tags with our warm aesthetic (Source Serif 4 headings, dark code blocks, etc.).

### Flat lesson list for prev/next navigation

The lessons are stored per module. To find the previous and next lesson, we flatten all modules' lessons into one array:

```ts
const allLessons = course.modules.flatMap((m) => m.lessons);
// [lesson1.1, lesson1.2, lesson2.1, lesson2.2, ...]

const lessonIndex = allLessons.findIndex((l) => l.slug === lessonSlug);
const prevLesson = allLessons[lessonIndex - 1] ?? null;
const nextLesson = allLessons[lessonIndex + 1] ?? null;
```

`flatMap` is like `map` followed by `flat(1)` — it unpacks the inner arrays.

### The mark-complete flow (Server Action)

```tsx
async function markComplete() {
  "use server";
  // 1. Save a LessonProgress record (upsert = create or update, never duplicate)
  await prisma.lessonProgress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId: ..., lessonId: ... } },
    create: { completed: true, completedAt: new Date(), ... },
    update: { completed: true, completedAt: new Date() },
  });

  // 2. Recount completed lessons and update enrollment.progress (0–100)
  const done = await prisma.lessonProgress.count({ where: { completed: true, ... } });
  await prisma.enrollment.update({ data: { progress: (done / total) * 100 } });

  // 3. Redirect to next lesson (or back to course if last)
  redirect(`/courses/${slug}/${nextLesson.slug}`);
}
```

Step 2 is called **denormalized progress** — we store the `progress` number directly on the `Enrollment` row so the dashboard can show "72% complete" without counting every lesson every time.

### `h-[calc(100vh-56px)]` — the full-height layout trick

The dashboard has:
- App sidebar: 232px wide, full height
- Header: 56px tall
- Main area: the rest of the height

The lesson viewer needs each column to scroll independently. Setting `height: calc(100vh - 56px)` on the 3-column grid makes it fill exactly the remaining height below the header.

```tsx
<div
  className="grid overflow-hidden"
  style={{ gridTemplateColumns: "260px 1fr 280px", height: "calc(100vh - 56px)" }}
>
  <aside className="overflow-y-auto ...">  {/* scrolls independently */}
  <div className="overflow-y-auto ...">    {/* scrolls independently */}
  <aside className="overflow-y-auto ...">  {/* scrolls independently */}
</div>
```

---

## How to test it

1. Log in as `student@cognify.dev / password123`
2. Go to `/courses` → click "Introduction to React"
3. Click "Enroll for free" (if not already enrolled)
4. Click "Continue learning" (or a lesson in the curriculum)
5. Read the lesson content (rendered from Markdown with code blocks)
6. Click "Mark complete & next →" → progress updates and you advance to the next lesson
7. Check `/courses/intro-to-react` — the progress bar updates

---

## Next session

**Session 07 — Quiz Engine**

We'll build the quiz page at `/courses/[slug]/[lessonSlug]/quiz` — timed MCQ with question navigation, score calculation, and quiz results. Uses Redux for quiz UI state (current question, selected answers, timer).
