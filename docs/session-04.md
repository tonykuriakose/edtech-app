# Session 04 — Landing Page UI

**Status:** ✅ Complete

---

## What we built

The public-facing marketing page at `/` — what every visitor sees before they log in. It makes the first impression on evaluators and real users alike.

---

## Sections on the page

| Section | What it shows |
|---|---|
| **Navbar** | Brand logo, nav links (Features, How it works, Courses), Sign in + Get started buttons |
| **Hero** | Big serif headline "Learn smarter. Not harder.", subtitle, two CTA buttons |
| **Stats bar** | 3 numbers: active learners, courses published, completion rate |
| **Features** | 3 cards — AI Quiz Generation, AI Tutor, Adaptive Difficulty |
| **How it works** | 4 steps — Enroll → Study → Quiz → Adapt |
| **Role callouts** | 3 cards — Students, Teachers, Admins |
| **CTA** | Terracotta-tinted card: "Create free account" |
| **Footer** | Brand + your name, GitHub, LinkedIn |

---

## File changed

| File | What changed |
|---|---|
| `src/app/page.tsx` | Replaced the default Next.js placeholder with the full landing page |

---

## Key concepts explained

### Why is this a Server Component?

The landing page has **no interactivity** — it's all static content and links. Server Components render on the server and send plain HTML to the browser. This means:
- ✅ Faster initial load
- ✅ Better SEO (search engines see the real content)
- ✅ No JavaScript bundle needed for the page itself

You only add `"use client"` when you need things like `useState`, `useEffect`, or browser events.

### What are the `<Link>` components?

```tsx
import Link from "next/link";

<Link href="/register">Get started</Link>
```

`<Link>` is Next.js's smart version of `<a>`. When you hover over it, Next.js **prefetches** that page in the background so the click feels instant. Always use `<Link>` for internal navigation.

### The `asChild` pattern

```tsx
<Button asChild>
  <Link href="/register">Get started</Link>
</Button>
```

`asChild` is a shadcn/ui pattern. It tells the Button to **give its styles to its child** instead of rendering its own `<button>` element. The result: you get the Button's styling + Next.js's Link behavior — best of both.

### Why `sticky top-0` on the navbar?

```tsx
<header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
```

- `sticky top-0` — navbar stays at the top as you scroll
- `z-50` — sits above everything else on the page
- `bg-background/90 backdrop-blur-sm` — slightly transparent with a blur effect, so you can see content scroll behind it (a modern glass-morphism effect)

### Canonical Tailwind classes vs CSS variables

Our `globals.css` registers custom colors in the `@theme inline` block:

```css
@theme inline {
  --color-terracotta-deep: var(--terracotta-deep);
}
```

This means Tailwind knows `terracotta-deep` as a color name. So instead of writing:

```tsx
// ❌ verbose
className="hover:bg-[var(--terracotta-deep)]"

// ✅ clean
className="hover:bg-terracotta-deep"
```

Both work the same, but the canonical form is cleaner and gets IDE autocompletion.

---

## Design decisions

- **Warm cream background** (`#f7f4ec`) — matches the app interior, so the transition from landing → login feels seamless
- **Source Serif 4** for all headings — the editorial serif makes the platform feel thoughtful and premium
- **Terracotta accents** only on the primary CTA and the first feature card — keeps the accent rare and meaningful
- **Stats bar** — concrete numbers build trust even if fictional for now; easy to replace with real data later
- **No images** — used SVG icons instead; zero dependency on image assets, no layout shift

---

## Next session

**Session 05 — Course Catalog & Course Detail Page**

We'll build the `/courses` page where students browse and filter courses, and the `/courses/[slug]` detail page where they can read about a course and click "Enroll".
