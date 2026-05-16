# Session 01 — Project Setup & Folder Structure

**Status:** ✅ Complete

---

## What we did

Set up the entire project foundation — the base everything else will be built on top of.

---

## Steps covered

### 1. Initialized Next.js 16
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```
- `--typescript` → type safety
- `--tailwind` → CSS utility classes
- `--app` → App Router (the modern Next.js way)
- `--src-dir` → all our code lives inside `src/`
- `--import-alias "@/*"` → lets us write `@/components/Button` instead of `../../components/Button`

### 2. Installed packages
```bash
npm install @prisma/client prisma next-auth@beta @auth/prisma-adapter bcryptjs zod \
  @tanstack/react-query @reduxjs/toolkit react-redux \
  ai @ai-sdk/google @ai-sdk/openai \
  next-mdx-remote recharts \
  clsx tailwind-merge class-variance-authority lucide-react
```

| Package | What it does |
|---|---|
| `prisma` | Database ORM — talks to PostgreSQL |
| `next-auth@beta` | Authentication (login/logout/sessions) |
| `bcryptjs` | Hashes passwords securely |
| `zod` | Validates form data and API inputs |
| `@tanstack/react-query` | Fetches and caches server data |
| `@reduxjs/toolkit` + `react-redux` | Manages UI state (quiz state, chat panel, etc.) |
| `ai` + `@ai-sdk/google` | Vercel AI SDK — powers the AI tutor and quiz generator |
| `recharts` | Charts for analytics dashboards |
| `lucide-react` | Icons |
| `clsx` + `tailwind-merge` | Utility for combining Tailwind class names cleanly |

### 3. Set up shadcn/ui
```bash
npx shadcn@latest init --yes --defaults
npx shadcn@latest add card input label badge avatar dialog dropdown-menu progress separator tabs select textarea sonner
```
shadcn/ui gives us pre-built, accessible components that match our Tailwind theme.

### 4. Design tokens wired into globals.css
Pulled the exact colors from the design file (`design-preview/tokens.css`):

| CSS Variable | Value | Use |
|---|---|---|
| `--background` | `#f7f4ec` | Page background (warm cream) |
| `--primary` | `#c96442` | Terracotta — buttons, active states |
| `--card` | `#ffffff` | Card surfaces |
| `--foreground` | `#1f1d1a` | Body text |
| `--border` | `#e6dfce` | Lines and outlines |
| `--font-sans` | Geist | All UI text |
| `--font-serif` | Source Serif 4 | Page titles and display text |

### 5. Folder structure created
```
src/
├── app/
│   ├── (auth)/login/          ← login page (Session 3)
│   ├── (auth)/register/       ← register page (Session 3)
│   ├── (dashboard)/           ← all protected app pages
│   │   ├── dashboard/         ← home (Session 10)
│   │   ├── courses/           ← course catalog + lesson viewer (Sessions 5,6)
│   │   ├── my-courses/        ← student's enrolled courses
│   │   ├── progress/          ← analytics (Session 10)
│   │   ├── ai-tutor/          ← AI chat (Session 9)
│   │   ├── teach/             ← teacher pages (Session 11)
│   │   └── admin/             ← admin panel (Session 12)
│   └── api/                   ← all backend endpoints
├── components/
│   ├── ui/                    ← shadcn auto-generated
│   ├── layout/                ← Sidebar, Header (Session 3)
│   ├── course/                ← CourseCard, EnrollButton (Session 5)
│   ├── lesson/                ← LessonViewer (Session 6)
│   ├── quiz/                  ← QuizContainer (Session 7)
│   ├── ai/                    ← AIChatPanel (Session 9)
│   ├── analytics/             ← Charts (Session 10)
│   ├── editor/                ← Teacher course editor (Session 11)
│   └── dashboard/             ← Dashboard widgets (Session 10)
├── lib/                       ← prisma, auth, ai, validations, utils
├── hooks/                     ← custom React hooks
├── store/                     ← Redux slices
└── types/                     ← TypeScript type definitions
```

### 6. Created .env.example
Template for all environment variables needed. Copy to `.env.local` and fill in values.

---

## Key concept: Why App Router?

In Next.js 16, the `app/` folder is the new way to build pages.
- Folders with `()` like `(auth)` and `(dashboard)` are called **route groups** — they let us share layouts without affecting the URL
- Every `page.tsx` inside a folder becomes a URL
- Files named `layout.tsx` wrap all pages inside that folder

---

## Next session

**Session 02 — Database Schema with Prisma**
We'll define all our data tables (users, courses, lessons, quizzes, etc.) and run our first migration.
