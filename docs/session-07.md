# Session 07 — Quiz Engine

**Status:** ✅ Complete

---

## What we built

The full quiz experience — start screen → timed MCQ → graded results with explanations.

---

## Files created

| File | What it does |
|---|---|
| `src/app/api/quizzes/[id]/attempt/route.ts` | POST endpoint — server-side grading, saves attempt to DB |
| `src/components/quiz/QuizContainer.tsx` | Client component — all quiz UI phases (ready, active, results) |
| `src/app/(dashboard)/courses/[slug]/[lessonSlug]/quiz/page.tsx` | Server component — loads and sanitizes quiz data |

---

## How to test it

1. Log in as `student@cognify.dev / password123`
2. Go to `/courses/intro-to-react/what-is-react/quiz`
3. Click "Start quiz" — see the 3 questions (300s timer)
4. Select answers and navigate with the progress dots or Next button
5. Click "Submit quiz" — see your score ring + question review
6. Expand any question to see which option was correct + the explanation
7. Check the database — a `QuizAttempt` row was created with your score

---

## Key concepts explained

### Why the server strips `isCorrect` before sending to the client

```
Server (quiz page.tsx)
  Fetches questions with isCorrect: [{text: "Facebook", isCorrect: true}...]
  ↓
  Strips isCorrect: [{text: "Facebook"}...]
  ↓
Client (browser)
  Receives questions WITHOUT isCorrect
  User selects answers
  ↓
POST /api/quizzes/[id]/attempt
  Server re-fetches questions WITH isCorrect (from database)
  Grades answers server-side
  Returns results
```

If we didn't strip `isCorrect`, a user could open DevTools, inspect the JavaScript bundle, and see all the correct answers before submitting. This is called **client-side answer exposure** — it would make every quiz trivial.

The answer validation always happens on the server. The client is never trusted.

### Redux for quiz state — why not local `useState`?

We use Redux for the active quiz state because:

| State | Type |
|---|---|
| `currentQuestion` | Which question index is shown |
| `answers` | `Record<questionId, optionIndex>` — all selected answers |
| `timeRemaining` | Countdown in seconds |
| `isSubmitting` | Prevents double-submit |

If we used local `useState`, these would all live inside one component. That's fine here, but Redux keeps the quiz state separate from the UI — if another component (like an AI tutor) ever needs to know what question you're on, it can just `useSelector` instead of needing a prop drilled through 5 levels.

The timer uses `dispatch(tick())` every second, which decrements `timeRemaining` by 1. The UI reads `timeRemaining` from the store to display the clock.

### The three quiz phases

```
phase 1: "ready"      → StartScreen (quiz info + Start button)
         ↓ click Start
phase 2: "active"     → QuizQuestion (question + options + timer)
         ↓ Submit / time runs out
phase 3: "results"    → QuizResults (score ring + question review)
```

Local state: `started: boolean` + `result: QuizResult | null`

```ts
if (result) return <QuizResults />;    // phase 3
if (!started) return <QuizReady />;    // phase 1
return <QuizActive />;                 // phase 2
```

### Auto-submit when timer runs out

```ts
useEffect(() => {
  if (started && !result && quiz.timeLimit !== null && timeRemaining <= 0) {
    handleSubmit();  // called automatically when timer hits 0
  }
}, [timeRemaining]);
```

The effect watches `timeRemaining`. When it reaches 0, `handleSubmit()` runs. A `submitLockRef` (a `useRef`) prevents double-submission if the user also clicks "Submit" at the same moment.

### Why `useRef` instead of `useState` for the lock?

```ts
const submitLockRef = useRef(false);

function handleSubmit() {
  if (submitLockRef.current) return;  // already submitted
  submitLockRef.current = true;        // lock immediately (no re-render)
  ...
}
```

`useState` triggers a re-render before the next line runs — there's a brief window where a second call could slip through. `useRef` sets the value synchronously with no re-render, making the lock immediate and reliable.

### Score calculation

```ts
// Server-side (route.ts)
const correctIndex = options.findIndex((o) => o.isCorrect);
const yourAnswer = answers[questionId] ?? -1;
const isCorrect = yourAnswer === correctIndex;
```

`-1` = unanswered (auto-wrong). The score is:

```ts
const score = Math.round((correctCount / total) * 100);
const passed = score >= quiz.passingScore;
```

The `LearningProfile` is updated:
- Score < 70% → quiz title added to `weakTopics[]`
- Score ≥ 85% → quiz title removed from `weakTopics[]`

### SVG score ring

No chart library needed. The ring is drawn with SVG:

```tsx
const circumference = 2 * Math.PI * r;
const offset = circumference - (score / 100) * circumference;
// offset = 0 means full ring; offset = circumference means empty ring
```

`strokeDasharray` sets the dashed pattern (full circumference = one full dash).
`strokeDashoffset` shifts where the dash starts — shifting it by `offset` hides the percentage we haven't scored.

---

## Next session

**Session 08 — AI Quiz Generator**

Teachers will be able to click "Generate quiz with AI" on any lesson that doesn't have a quiz. The Vercel AI SDK will call Google Gemini, use `generateObject` with a Zod schema, and produce structured MCQ questions that are saved directly to the database.
