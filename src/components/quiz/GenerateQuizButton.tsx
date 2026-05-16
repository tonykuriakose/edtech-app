"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, CheckCircle } from "lucide-react";

type Props = {
  lessonId: string;
};

type Status = "idle" | "loading" | "done" | "error";

export default function GenerateQuizButton({ lessonId }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function handleGenerate() {
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/ai/quiz-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Generation failed");
      }

      setStatus("done");
      // Refresh the server component so the new quiz shows up
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "done") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12.5px] text-green-700 font-medium">
        <CheckCircle size={13} />
        Quiz generated
      </span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleGenerate}
        disabled={status === "loading"}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors disabled:opacity-60"
        style={{
          background: "var(--terracotta)",
          color: "#fff",
        }}
      >
        {status === "loading" ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Sparkles size={13} />
        )}
        {status === "loading" ? "Generating…" : "Generate quiz with AI"}
      </button>
      {status === "error" && (
        <p className="text-[11.5px] text-red-600">{errorMsg}</p>
      )}
    </div>
  );
}
