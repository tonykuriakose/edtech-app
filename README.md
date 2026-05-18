# Edapt — AI-Powered Adaptive Learning Platform

> House of Edtech Fullstack Developer Assignment — Jan 2026

Edapt is a full-stack EdTech platform where students study structured lessons, take AI-generated adaptive quizzes, and get personalized tutoring. Teachers create and manage course content. The platform tracks progress, identifies weak areas, and adjusts quiz difficulty automatically.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL via Neon (serverless) + Prisma ORM |
| Auth | NextAuth.js v5 — Credentials + Google OAuth |
| AI | Vercel AI SDK + Google Gemini (primary) / OpenAI (fallback) |
| Server State | TanStack Query v5 |
| UI State | Redux Toolkit |
| Testing | Vitest (unit/integration) + Playwright (E2E) |
| Deployment | Vercel + GitHub Actions CI/CD |

---

## Features

### Student
- Browse and enroll in courses
- Study MDX lessons with optional video embeds
- Track lesson completion and overall course progress
- Take AI-generated, timed multiple-choice quizzes
- View score history, weak topics, and learning streaks
- Chat with a lesson-aware AI tutor (streaming)
- Get AI summaries of any lesson

### Teacher
- Create courses with a multi-step wizard (course → modules → lessons)
- Publish/unpublish courses
- Trigger AI quiz generation per lesson
- View per-course analytics (completion rates, student scores)

### Admin
- Approve or reject courses
- Manage users and roles
- View platform-wide statistics

---

## AI Integration

| Feature | SDK Method | Description |
|---|---|---|
| AI Tutor Chat | `streamText` | Lesson-context-aware streaming chat assistant |
| Quiz Generation | `generateObject` | Structured MCQ generation with Zod schema validation |
| Lesson Summarizer | `generateText` | One-shot lesson summary on demand |
| Adaptive Difficulty | Pure function | Adjusts quiz difficulty based on last 5 attempt scores — no LLM call |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # login, register
│   ├── (dashboard)/         # all protected routes
│   │   ├── dashboard/       # role-aware home
│   │   ├── courses/         # catalog, course detail, lesson viewer, quiz
│   │   ├── my-courses/      # student enrolled courses
│   │   ├── teach/           # teacher dashboard, course editor, analytics
│   │   ├── admin/           # user management, course approvals
│   │   ├── progress/        # student learning analytics
│   │   └── ai-tutor/        # standalone AI chat
│   └── api/                 # route handlers (courses, quizzes, ai, auth, users)
│
├── components/
│   ├── ui/                  # shadcn primitives
│   ├── course/              # CourseCard, EnrollButton, ProgressRing
│   ├── lesson/              # LessonViewer, LessonSidebar, LessonNav
│   ├── quiz/                # QuizContainer, QuizQuestion, QuizResults
│   ├── ai/                  # AIChatPanel, StreamingText
│   ├── analytics/           # ProgressChart, WeakTopicsCard, StreakCalendar
│   ├── editor/              # CourseEditor, LessonEditor, QuestionEditor
│   └── dashboard/           # StudentDashboard, TeacherDashboard, AdminDashboard
│
├── lib/
│   ├── prisma.ts            # singleton PrismaClient
│   ├── auth.ts              # NextAuth v5 config
│   ├── ai.ts                # Vercel AI SDK setup
│   ├── validations.ts       # Zod schemas
│   ├── adaptive.ts          # difficulty adjustment algorithm
│   └── api-helpers.ts       # requireRole(), error wrappers
│
├── hooks/                   # useCourse, useQuiz, useAIChat, ...
├── store/                   # quizSlice, uiSlice, chatSlice (Redux Toolkit)
├── types/                   # shared TypeScript types
└── middleware.ts             # edge route protection by role
```

---

## Database Schema (Key Models)

```
User            id, email, name, role (STUDENT | TEACHER | ADMIN)
Course          id, title, slug, status, difficulty, tags[], creatorId
Module          id, title, order, courseId
Lesson          id, title, slug, content (MDX), order, moduleId
Quiz            id, lessonId, difficulty, passingScore, isAIGenerated
Question        id, quizId, text, options (JSON), explanation
Enrollment      id, userId, courseId, progress (0-100)
LessonProgress  id, enrollmentId, lessonId, completed, timeSpent
QuizAttempt     id, userId, quizId, score, timeTaken
Answer          id, attemptId, questionId, selectedOption, isCorrect
LearningProfile id, userId (1:1), weakTopics[], streakDays
ChatSession     id, userId, lessonId
ChatMessage     id, sessionId, role (USER | ASSISTANT), content
```

---

## Getting Started

### Prerequisites
- Node.js 22+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)
- Google AI API key (Gemini) and/or OpenAI API key

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Run database migrations
npx prisma migrate dev

# 4. Seed the database
npx prisma db seed

# 5. Start development server
npm run dev
```

### Environment Variables

```bash
# Database (Neon)
DATABASE_URL=""
DIRECT_URL=""

# NextAuth
AUTH_SECRET=""
AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# AI
GOOGLE_AI_API_KEY=""
OPENAI_API_KEY=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Testing

```bash
# Unit + integration tests
npx vitest run --coverage

# E2E tests
npx playwright test

# All tests (CI mode)
npm run test:ci
```

**Coverage targets:**
- Unit/integration: 70%+ on `src/lib/` and `src/app/api/`
- E2E flows: auth, student learning flow, teacher course creation

---

## Deployment

The app is deployed on **Vercel** with **Neon** as the database.

CI/CD via GitHub Actions:
- `ci.yml` — runs on every push: migrations → Vitest → Playwright
- `deploy.yml` — runs on `main`: deploys to Vercel production

---

## Role-Based Access

| Route prefix | Allowed roles |
|---|---|
| `/teach/*` | TEACHER, ADMIN |
| `/admin/*` | ADMIN |
| All other dashboard routes | STUDENT, TEACHER, ADMIN |
| `/api` mutation routes | Validated per handler with `requireRole()` |

---

## Real-World Considerations

- **Connection pooling** — Neon pgbouncer pooled URL for runtime, direct URL for migrations
- **Prisma singleton** — `globalThis.__prisma` prevents pool exhaustion in serverless hot-reload
- **AI cost guardrails** — quiz generation rate-limited to 3 calls/lesson/teacher/day
- **Optimistic UI** — lesson progress updates immediately via React Query `onMutate`; rolls back on failure
- **Security** — quiz answers validated server-side; `isCorrect` stripped from student-facing responses
- **Error boundaries** — AI features isolated so failures don't break the lesson view

---

## Author

Built by **Tony Kuriakose**

- GitHub: [github.com/tonykuriakose](https://github.com/tonykuriakose)
- LinkedIn: [linkedin.com/in/tonykuriakose](https://linkedin.com/in/tonykuriakose)
