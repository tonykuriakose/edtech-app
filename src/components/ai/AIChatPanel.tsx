"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

type Props = {
  lessonId: string;
  lessonTitle: string;
  lessonContent: string;
  courseTitle: string;
};

const SUGGESTED = [
  "Summarize this lesson in 3 bullet points.",
  "What's the most important concept here?",
  "Give me a real-world example of this.",
];

export default function AIChatPanel({
  lessonTitle,
  lessonContent,
  courseTitle,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);

    // Add an empty assistant message that we'll stream into
    setMessages([...next, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          lessonTitle,
          lessonContent,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Append each chunk to the last (assistant) message
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            content: copy[copy.length - 1].content + chunk,
          };
          return copy;
        });
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          ...copy[copy.length - 1],
          content: "Sorry, something went wrong. Please try again.",
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ──────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-5 py-4 border-b border-border flex-none"
        style={{ background: "var(--surface)" }}
      >
        <Sparkles size={15} style={{ color: "var(--terracotta-deep)" }} />
        <span
          className="text-[16px] font-normal"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
        >
          Lesson AI
        </span>
        <span
          className="ml-auto text-[10.5px] px-2 py-0.5 rounded-full font-medium"
          style={{
            background: "var(--terracotta-tint)",
            color: "var(--terracotta-deep)",
          }}
        >
          lesson-aware
        </span>
      </div>

      {/* ── Messages ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 ? (
          /* Empty state — context card + suggested questions */
          <>
            <div
              className="rounded-xl p-4 border border-border mb-1"
              style={{ background: "var(--card)" }}
            >
              <div
                className="text-[10px] font-medium tracking-widest uppercase mb-1.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--muted-foreground)",
                }}
              >
                Discussing
              </div>
              <div className="text-[13px] font-medium leading-snug">
                {lessonTitle}
              </div>
              <div className="text-[11.5px] text-muted-foreground mt-0.5">
                {courseTitle}
              </div>
            </div>

            <div
              className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground mb-1"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Try asking
            </div>

            {SUGGESTED.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-left px-3 py-2.5 rounded-lg border border-border text-[12.5px] text-muted-foreground hover:bg-black/3 hover:text-foreground transition-colors"
                style={{ background: "var(--card)" }}
              >
                {q}
              </button>
            ))}
          </>
        ) : (
          /* Message bubbles */
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "rounded-br-sm text-white"
                    : "border border-border rounded-bl-sm"
                }`}
                style={
                  m.role === "user"
                    ? { background: "var(--terracotta)" }
                    : { background: "var(--card)", color: "var(--ink-2)" }
                }
              >
                {m.content || (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Loader2 size={12} className="animate-spin" />
                    Thinking…
                  </span>
                )}
              </div>
            </div>
          ))
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ───────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 px-4 py-4 border-t border-border flex-none"
        style={{ background: "var(--surface)" }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          placeholder="Ask about this lesson…"
          rows={1}
          disabled={streaming}
          className="flex-1 resize-none rounded-xl border border-border px-3.5 py-2.5 text-[13px] bg-transparent outline-none focus:ring-1 placeholder:text-muted-foreground disabled:opacity-60"
          style={{ maxHeight: 120 }}
        />
        <button
          type="submit"
          disabled={!input.trim() || streaming}
          className="flex-none w-9 h-9 rounded-xl flex items-center justify-center text-white transition-opacity disabled:opacity-40"
          style={{ background: "var(--terracotta)" }}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
