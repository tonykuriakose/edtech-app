"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTED = [
  "Explain how neural networks learn.",
  "What's the difference between supervised and unsupervised learning?",
  "Help me understand recursion with a simple example.",
  "What is Big O notation and why does it matter?",
];

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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
    setMessages([...next, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, lessonTitle: "General", lessonContent: "" }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
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

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex-none">
        <div className="flex items-center gap-2.5 mb-1">
          <Sparkles size={18} style={{ color: "var(--terracotta-deep)" }} />
          <h1
            className="text-2xl font-normal"
            style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
          >
            AI Tutor
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">Ask anything — your personal tutor is ready.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-2 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-2 pt-4">
            <p
              className="text-[10.5px] font-medium tracking-widest uppercase text-muted-foreground mb-2"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Try asking
            </p>
            {SUGGESTED.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-left px-4 py-3 rounded-xl border border-border text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                style={{ background: "var(--card)" }}
              >
                {q}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed whitespace-pre-wrap ${
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

      {/* Input */}
      <div className="px-6 pb-6 pt-3 flex-none">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex items-end gap-2 border border-border rounded-2xl px-4 py-3"
          style={{ background: "var(--card)" }}
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
            placeholder="Ask your tutor anything…"
            rows={1}
            disabled={streaming}
            className="flex-1 resize-none bg-transparent text-[13.5px] outline-none placeholder:text-muted-foreground disabled:opacity-60"
            style={{ maxHeight: 140 }}
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className="flex-none w-8 h-8 rounded-xl flex items-center justify-center text-white transition-opacity disabled:opacity-40"
            style={{ background: "var(--terracotta)" }}
          >
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
}
