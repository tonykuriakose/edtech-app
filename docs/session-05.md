# Session 05 — Course Catalog & Course Detail Page

**Status:** ✅ Complete

---

## What we built

The full dashboard shell (sidebar + header) plus two new pages:
- `/courses` — browse all published courses in a grid
- `/courses/[slug]` — course detail with curriculum and an Enroll button

---

## Files created or updated

| File | What changed |
|---|---|
| `src/components/layout/Sidebar.tsx` | Client component — role-aware sidebar with active link highlighting |
| `src/components/layout/Header.tsx` | Client component — search bar + sign out button |
| `src/app/(dashboard)/layout.tsx` | Updated — now fetches session and renders the full app shell |
| `src/app/(dashboard)/courses/page.tsx` | New — course catalog page (Server Component) |
| `src/app/(dashboard)/courses/[slug]/page.tsx` | New — course detail page with Server Action enroll |

---

## Key concepts explained

### Why is Sidebar a Client Component but Layout is a Server Component?

```
DashboardLayout (Server)  ← fetches session, passes user as props
  └── Sidebar (Client)    ← needs usePathname() to highlight active link
```

`usePathname()` is a React hook that reads the current URL. Hooks can only run in Client Components. But fetching the session should happen on the server for security and performance.

**Solution:** the layout fetches the session on the server, then passes `user` as a prop to the sidebar. The sidebar is a thin client component that only does UI work (highlight active link).

This pattern — **Server Component parent, Client Component child** — is very common in Next.js App Router.

### What is a Server Action?

In the course detail page, the Enroll button uses a **Server Action**:

```tsx
async function enroll() {
  "use server";             // this function runs on the server, not the browser
  const s = await auth();   // safe to access session here
  await prisma.enrollment.create({...});
  revalidatePath(`/courses/${slug}`);  // tell Next.js to refetch this page
}

// In JSX:
<form action={enroll}>
  <button type="submit">Enroll for free</button>
</form>
```

When the user clicks "Enroll for free":
1. Browser submits the form
2. Next.js sends the request to the server
3. The `enroll()` function runs with full access to Prisma and the session
4. `revalidatePath` tells Next.js to re-render the page with fresh data
5. The page re-renders showing "Enrolled" + "Continue learning"

**Why this is great:** No API route needed. No `fetch()` call. The server mutation and UI update happen together.

### What is `notFound()`?

```tsx
const course = await prisma.course.findUnique({ where: { slug } });
if (!course) notFound();
```

`notFound()` from `next/navigation` renders Next.js's built-in 404 page. If someone visits `/courses/fake-slug`, they get a proper not-found page instead of a crash.

### Dynamic route: `[slug]`

The folder `courses/[slug]` creates a dynamic route. The `[slug]` is a placeholder that matches any value:
- `/courses/intro-to-react` → `params.slug = "intro-to-react"`
- `/courses/data-science-101` → `params.slug = "data-science-101"`

In Next.js 15+, `params` is now a Promise, so we must `await` it:
```tsx
type Props = { params: Promise<{ slug: string }> };

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;   // ← must await in Next.js 15
  ...
}
```

### `generateMetadata` — SEO

```tsx
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  return { title: `${course.title} — Edapt` };
}
```

This runs on the server before the page renders and sets the `<title>` tag in the HTML. Search engines and link previews (Slack, Twitter) will show the actual course name instead of a generic title.

### `_count` in Prisma

```ts
prisma.course.findMany({
  include: {
    _count: { select: { enrollments: true } }
  }
})
// Result: course._count.enrollments = 42
```

`_count` is a Prisma shorthand for counting related records. Instead of fetching all 42 enrollments just to call `.length`, Prisma runs `COUNT(*)` in the SQL query — much faster.

### `Promise.all` — parallel queries

```ts
const [courses, enrollments] = await Promise.all([
  prisma.course.findMany(...),
  prisma.enrollment.findMany(...),
]);
```

`Promise.all` runs both database queries **at the same time** instead of waiting for the first to finish before starting the second. If each query takes 100ms, `Promise.all` takes ~100ms total — without it, it would be 200ms.

---

## How enrollment works (step by step)

1. User opens `/courses/intro-to-react`
2. Page renders "Enroll for free" button (because no enrollment record found in DB)
3. User clicks the button — browser submits a form
4. `enroll()` server action runs on the server:
   - Reads the session to get `userId`
   - Calls `prisma.enrollment.upsert()` — creates or skips if already exists
5. `revalidatePath()` tells Next.js the page data is stale
6. Page re-renders: now shows "Enrolled ✓" + "Continue learning" button

---

## Next session

**Session 06 — Lesson Viewer**

We'll build the lesson page at `/courses/[slug]/[lessonSlug]` where students read lesson content (rendered from Markdown), see a sidebar with module navigation, and mark lessons as complete.
