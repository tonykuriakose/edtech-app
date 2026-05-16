# Session 08 — AI Quiz Generator

**Status:** ✅ Complete

---

## What we built

Teachers can now visit any course they own, see each lesson, and click **"Generate quiz with AI"** on lessons that don't have a quiz yet. Gemini creates 5 MCQ questions from the lesson content and saves them directly to the database.

---

## Files created

| File | What it does |
|---|---|
| `src/lib/ai.ts` | Vercel AI SDK setup — exports `geminiFlash` and `geminiPro` models |
| `src/app/api/ai/quiz-generate/route.ts` | POST endpoint — auth check, fetch lesson, call `generateObject`, save to DB |
| `src/components/quiz/GenerateQuizButton.tsx` | Client button — loading state, calls API, refreshes page on success |
| `src/app/(dashboard)/teach/page.tsx` | Teacher home — lists courses with enrollment + quiz stats |
| `src/app/(dashboard)/teach/courses/[id]/page.tsx` | Course manager — module/lesson list with generate buttons |

---

## How to test it

1. Log in as `teacher@cognify.dev / password123`
2. Go to `/teach` — see your courses and stat cards
3. Click on a course → go to `/teach/courses/[id]`
4. Find a lesson that shows "No quiz" — click **"Generate quiz with AI"**
5. Wait ~5s for Gemini to respond — button shows "Generating…"
6. On success: button replaced by green "Quiz generated" · page refreshes showing quiz title + question count
7. Check the database — `Quiz` row with `isAIGenerated: true` and 5 `Question` rows

> **Required:** Add `GOOGLE_AI_API_KEY=your-key` to `.env.local` before testing

---

## Key concepts explained

### `generateObject` — structured AI output with no parsing headaches

The standard way to call an AI is `generateText` — you get back a string. But for quiz generation we need structured data (a list of questions, each with options, one marked correct). Parsing a string for that is fragile.

`generateObject` is different. You pass a **Zod schema** and the AI SDK guarantees the AI returns JSON that exactly matches that shape:

```ts
const { object } = await generateObject({
  model: geminiFlash,
  schema: z.object({
    title: z.string(),
    questions: z.array(z.object({
      text: z.string(),
      explanation: z.string(),
      options: z.array(z.object({
        text: z.string(),
        isCorrect: z.boolean(),
      })).length(4),
    })).min(4).max(6),
  }),
  prompt: "...",
});
// object.questions is guaranteed to be an array of the right shape
```

Under the hood, the AI SDK uses tool-calling or JSON mode on the model to force structured output. You never write `JSON.parse(rawText)` and never handle malformed responses.

### The quiz generation flow

```
POST /api/ai/quiz-generate { lessonId }
  ↓ check: TEACHER or ADMIN only
  ↓ fetch lesson + module + course (to verify ownership)
  ↓ check: course.creatorId === session.user.id (teachers can't touch others' courses)
  ↓ check: lesson.quizzes.length === 0 (prevent duplicates, returns 409 if quiz exists)
  ↓ lesson.content.slice(0, 3500) → only the first 3500 chars (keeps prompt cost low)
  ↓ generateObject(geminiFlash, QuizSchema, prompt with lesson title + content)
  ↓ prisma.quiz.create({ data: { ...quiz, questions: { create: [...] } } })
  → 201 { quiz } with all generated questions
```

### Why `router.refresh()` in the button instead of `window.location.reload()`

The page (`/teach/courses/[id]`) is a **Server Component** — it fetches fresh data from the database on each render. After generating a quiz, we want the page to re-render with the new quiz data.

`router.refresh()` from `next/navigation` tells Next.js to re-run the Server Component and get fresh data — without doing a full browser reload:

```ts
import { useRouter } from "next/navigation";
const router = useRouter();

async function handleGenerate() {
  await fetch("/api/ai/quiz-generate", { method: "POST", ... });
  router.refresh(); // Server Component re-runs → lesson now shows quiz
}
```

`window.location.reload()` would also work but loses scroll position and does a full round-trip. `router.refresh()` is the idiomatic Next.js App Router approach.

### The AI badge on quiz cards

After generation, each quiz card shows an "AI" badge (`isAIGenerated: true` in the DB):

```tsx
{quiz.isAIGenerated && (
  <span className="px-1.5 rounded text-[10px] font-medium bg-violet-100 text-violet-700">
    AI
  </span>
)}
```

This is useful for teachers to distinguish AI-generated quizzes from ones they may have written manually in the future.

### Security: teachers can only generate for their own courses

```ts
if (
  session.user.role === "TEACHER" &&
  lesson.module.course.creatorId !== session.user.id
) {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}
```

A TEACHER can only generate quizzes for courses they created. If they somehow POST with a `lessonId` from another teacher's course, they get a 403. ADMINs bypass this check.

---

## Next session

**Session 09 — AI Tutor Chat**

Students will be able to open a chat panel from within any lesson and ask questions. The AI tutor receives the full lesson content as context, so its answers are grounded in what the student is actually reading. Streaming responses via `streamText` and the `useChat` hook.
