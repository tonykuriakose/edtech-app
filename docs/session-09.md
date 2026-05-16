# Session 09 — AI Tutor Chat

**Status:** ✅ Complete

---

## What we built

A live streaming chat panel in the lesson viewer. The AI knows which lesson the student is reading and streams its answers word by word. Suggested questions appear when the chat is empty; clicking one sends it immediately.

---

## Files created or updated

| File | What it does |
|---|---|
| `src/app/api/ai/chat/route.ts` | POST endpoint — `streamText` with lesson-aware system prompt, returns `toTextStreamResponse()` |
| `src/components/ai/AIChatPanel.tsx` | Client component — manual streaming fetch, message state, input bar |
| `src/app/(dashboard)/courses/[slug]/[lessonSlug]/page.tsx` | Updated — right aside replaced with `<AIChatPanel>` |

---

## How to test it

1. Log in as `student@cognify.dev / password123`
2. Enroll in a course → open any lesson
3. Right panel shows "Lesson AI" with 3 suggested questions
4. Click a suggestion or type a question → send with Enter or the button
5. Watch the response stream in word by word
6. Ask a follow-up — the full conversation history is sent each time

---

## Key concepts explained

### Why `streamText` + `toTextStreamResponse()` instead of `generateText`

`generateText` waits for the **entire** response before returning it. If Gemini takes 5 seconds to write a 3-paragraph answer, the user sees nothing for 5 seconds then all the text at once.

`streamText` starts returning chunks immediately as the model generates them:

```
generateText:  ░░░░░░░░░░░░░░░░░░ 5s → "Here is the answer..."
streamText:    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 5s (words appear one by one from t=0)
```

`toTextStreamResponse()` wraps the stream in a standard HTTP `Response` with `Content-Type: text/plain` and `Transfer-Encoding: chunked` — the browser keeps the connection open and receives chunks as they arrive.

### How the client reads the stream

```ts
const res = await fetch("/api/ai/chat", { method: "POST", body: JSON.stringify({...}) });
const reader = res.body.getReader();  // ReadableStream reader
const decoder = new TextDecoder();    // converts Uint8Array → string

while (true) {
  const { done, value } = await reader.read();  // get next chunk
  if (done) break;
  const chunk = decoder.decode(value, { stream: true });
  // append chunk to the last assistant message in state
}
```

`res.body` is a `ReadableStream`. `.getReader()` gives a reader that yields chunks as they arrive from the server. Each `chunk` is a small piece of the AI's response — sometimes a word, sometimes a few words, depending on model output speed.

The `{ stream: true }` flag in `TextDecoder.decode()` handles multi-byte characters (like emoji or accented letters) that might be split across two chunks.

### Why we don't use `useChat` from the AI SDK

The AI SDK v6 (`ai@6.x`) moved the React hooks to a separate package (`@ai-sdk/react`) that isn't installed. Instead of adding a dependency, we built the streaming logic ourselves using `fetch` + `ReadableStream` — which is exactly what `useChat` does under the hood anyway.

This version is more transparent: you can see the stream reading loop directly instead of it being hidden inside a hook.

### The lesson-aware system prompt

The server receives `lessonTitle` and `lessonContent` (first 2000 chars) in the request body and injects them into the system prompt:

```ts
const result = streamText({
  model: geminiFlash,
  system: `You are a helpful AI tutor...
The student is studying: "${lessonTitle}"
Lesson content: ${lessonContent}`,
  messages,  // full conversation history
});
```

The full message history is sent on every request so the AI can refer back to earlier parts of the conversation. This is called **stateless streaming** — the server doesn't store any session; the client sends everything the AI needs on each call.

### The "thinking" indicator

When the assistant message exists but has no content yet (waiting for first chunk), we show a spinner:

```tsx
{m.content || (
  <span className="flex items-center gap-1.5 text-muted-foreground">
    <Loader2 size={12} className="animate-spin" />
    Thinking…
  </span>
)}
```

This works because we add the empty assistant message to state immediately when the user sends, before any chunks arrive. So the first render of that bubble shows "Thinking…" until content starts streaming in.

---

## Next session

**Session 10 — Student Dashboard & Progress**

The `/dashboard` page is currently a placeholder. We'll build a real student dashboard showing: enrolled courses with progress rings, recent quiz scores, weak topics from the LearningProfile, and study streak.
