"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  startQuiz, setAnswer, nextQuestion, prevQuestion, tick, resetQuiz,
} from "@/store/quizSlice";
import type { RootState } from "@/store";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Clock, CheckCircle2, XCircle,
  BookOpen, Trophy, RotateCcw, ChevronDown, ChevronUp,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────────── */

export type SafeQuestion = {
  id: string;
  text: string;
  order: number;
  explanation: string | null;
  options: { text: string }[];
};

type QuizMeta = {
  id: string;
  title: string;
  timeLimit: number | null;
  passingScore: number;
  difficulty: string;
};

type GradedQuestion = SafeQuestion & {
  yourAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
};

type QuizResult = {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
  timeTaken: number;
  attemptId: string;
  passingScore: number;
  questions: GradedQuestion[];
};

type Props = {
  quiz: QuizMeta;
  questions: SafeQuestion[];
  courseSlug: string;
  lessonSlug: string;
  lessonTitle: string;
};

const LETTERS = ["A", "B", "C", "D"];

/* ── Main component ─────────────────────────────────────────── */

export default function QuizContainer({
  quiz, questions, courseSlug, lessonSlug, lessonTitle,
}: Props) {
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const submitLockRef = useRef(false);

  const dispatch = useDispatch();
  const { currentQuestion: qIdx, answers, timeRemaining } = useSelector(
    (s: RootState) => s.quiz
  );

  // Clean up Redux state when user leaves the page
  useEffect(() => {
    return () => { dispatch(resetQuiz()); };
  }, [dispatch]);

  // Countdown timer — only runs while quiz is active
  useEffect(() => {
    if (!started || result || quiz.timeLimit === null) return;
    const timer = setInterval(() => dispatch(tick()), 1000);
    return () => clearInterval(timer);
  }, [started, result, quiz.timeLimit, dispatch]);

  // Auto-submit when timer reaches zero
  useEffect(() => {
    if (started && !result && quiz.timeLimit !== null && timeRemaining <= 0) {
      handleSubmit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining]);

  async function handleSubmit() {
    if (submitLockRef.current || submitting || result) return;
    submitLockRef.current = true;
    setSubmitting(true);

    const timeTaken =
      quiz.timeLimit !== null ? quiz.timeLimit - timeRemaining : 0;

    try {
      const res = await fetch(`/api/quizzes/${quiz.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, timeTaken }),
      });
      if (!res.ok) throw new Error("Submission failed");
      const data: QuizResult = await res.json();
      setResult(data);
    } catch {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  }

  function handleStart() {
    dispatch(startQuiz({ timeLimit: quiz.timeLimit ?? 0 }));
    setStarted(true);
  }

  /* ── Phase: Results ───────────────────────────────────────── */
  if (result) {
    return (
      <QuizResults
        result={result}
        quiz={quiz}
        courseSlug={courseSlug}
        lessonSlug={lessonSlug}
        lessonTitle={lessonTitle}
      />
    );
  }

  /* ── Phase: Ready screen ──────────────────────────────────── */
  if (!started) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)] px-6">
        <div className="max-w-md w-full">
          <div
            className="text-[11px] font-medium tracking-widest uppercase mb-3"
            style={{ fontFamily: "var(--font-mono)", color: "var(--terracotta-deep)" }}
          >
            Quiz
          </div>
          <h1
            className="text-[36px] font-normal mb-3"
            style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.025em" }}
          >
            {quiz.title}
          </h1>
          <p className="text-muted-foreground text-sm mb-2">
            for <em>{lessonTitle}</em>
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-[13px] text-muted-foreground mb-8 mt-4">
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} />
              {questions.length} questions
            </span>
            {quiz.timeLimit && (
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {Math.ceil(quiz.timeLimit / 60)} min limit
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Trophy size={14} />
              Pass at {quiz.passingScore}%
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleStart}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer"
              style={{ background: "var(--terracotta)" }}
            >
              Start quiz
            </button>
            <Link
              href={`/courses/${courseSlug}/${lessonSlug}`}
              className="px-5 py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors"
            >
              Back to lesson
            </Link>
          </div>

          <p className="text-[12px] text-muted-foreground mt-5">
            Choose one answer per question. You can change your answer before submitting.
          </p>
        </div>
      </div>
    );
  }

  /* ── Phase: Active quiz ───────────────────────────────────── */
  const question = questions[qIdx];
  const selectedOption = answers[question.id] ?? -1;
  const answeredCount = Object.keys(answers).length;
  const isLast = qIdx === questions.length - 1;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* ── Quiz topbar ─────────────────────────────────────── */}
      <div
        className="h-14 flex-none flex items-center px-7 gap-4 border-b border-border"
        style={{ background: "var(--surface)" }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-[11px] font-medium tracking-widest uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
          >
            Quiz
          </span>
          <span className="text-[13.5px] font-medium">{quiz.title}</span>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: "var(--terracotta-tint)", color: "var(--terracotta-deep)" }}
          >
            {quiz.difficulty.charAt(0) + quiz.difficulty.slice(1).toLowerCase()}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {quiz.timeLimit !== null && (
            <span
              className="flex items-center gap-1.5 text-[13px] font-medium px-3 py-1 rounded-full"
              style={{
                background: timeRemaining < 60 ? "var(--bad-soft)" : "var(--warn-soft)",
                color: timeRemaining < 60 ? "var(--bad)" : "var(--warn)",
              }}
            >
              <Clock size={13} />
              {formatTime(timeRemaining)}
            </span>
          )}
          <Link
            href={`/courses/${courseSlug}/${lessonSlug}`}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Exit
          </Link>
        </div>
      </div>

      {/* ── Quiz body ───────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[760px] mx-auto px-6 py-8">
          {/* Progress dots */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-1">
              {questions.map((q, i) => {
                const isDone = answers[q.id] !== undefined;
                const isCurrent = i === qIdx;
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      const diff = i - qIdx;
                      if (diff > 0) for (let d = 0; d < diff; d++) dispatch(nextQuestion());
                      else for (let d = 0; d < Math.abs(diff); d++) dispatch(prevQuestion());
                    }}
                    className="rounded-full transition-all"
                    style={{
                      width: isCurrent ? 32 : 22,
                      height: 6,
                      background: isDone
                        ? "var(--ok)"
                        : isCurrent
                        ? "var(--terracotta)"
                        : "var(--surface-3)",
                    }}
                    aria-label={`Question ${i + 1}`}
                  />
                );
              })}
            </div>
            <span
              className="text-[12px] text-muted-foreground"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Question {qIdx + 1} of {questions.length}
            </span>
          </div>

          {/* Question */}
          <h2
            className="text-[28px] font-normal mb-2 leading-[1.25]"
            style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
          >
            {question.text}
          </h2>
          <p className="text-[13px] text-muted-foreground mb-7">
            Choose one. You can change your answer before submitting.
          </p>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {question.options.map((opt, i) => {
              const isSelected = selectedOption === i;
              return (
                <button
                  key={i}
                  onClick={() =>
                    dispatch(setAnswer({ questionId: question.id, optionIndex: i }))
                  }
                  className="w-full text-left grid gap-4 px-5 py-4 rounded-xl border transition-all cursor-pointer"
                  style={{
                    gridTemplateColumns: "32px 1fr",
                    alignItems: "center",
                    borderColor: isSelected ? "var(--terracotta)" : "var(--border)",
                    background: isSelected ? "var(--terracotta-tint)" : "var(--card)",
                    boxShadow: isSelected ? "inset 0 0 0 1px var(--terracotta)" : "none",
                  }}
                >
                  {/* Letter badge */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{
                      background: isSelected ? "var(--terracotta)" : "var(--surface-2)",
                      color: isSelected ? "#fff" : "var(--ink-2)",
                    }}
                  >
                    {LETTERS[i]}
                  </div>
                  <span className="text-[15px]">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => dispatch(prevQuestion())}
              disabled={qIdx === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted"
            >
              <ArrowLeft size={14} />
              Previous
            </button>

            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              {answeredCount} of {questions.length} answered
            </div>

            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer disabled:opacity-60"
                style={{ background: "var(--terracotta)" }}
              >
                {submitting ? "Grading…" : "Submit quiz"}
              </button>
            ) : (
              <button
                onClick={() => dispatch(nextQuestion())}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-border transition-colors hover:bg-muted"
              >
                Next
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Quiz Results component ─────────────────────────────────── */

function QuizResults({
  result, quiz, courseSlug, lessonSlug, lessonTitle,
}: {
  result: QuizResult;
  quiz: QuizMeta;
  courseSlug: string;
  lessonSlug: string;
  lessonTitle: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="px-9 py-7 max-w-4xl">
      {/* Page header */}
      <div className="mb-7">
        <p
          className="text-[11.5px] font-medium tracking-widest uppercase mb-2"
          style={{ color: "var(--terracotta-deep)" }}
        >
          Quiz result · {quiz.title}
        </p>
        <h1
          className="text-[34px] font-normal leading-[1.05] mb-2"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.025em" }}
        >
          You scored {result.score}%
          {result.passed ? " — passing." : " — not passing."}
        </h1>
        <p className="text-muted-foreground text-sm">
          {result.passed
            ? "Great work! Keep going."
            : `You need ${result.passingScore}% to pass. Review the explanations below and try again.`}
        </p>
      </div>

      {/* CTA buttons */}
      <div className="flex gap-3 mb-8">
        <Link
          href={`/courses/${courseSlug}/${lessonSlug}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--terracotta)" }}
        >
          <ArrowLeft size={14} />
          Back to lesson
        </Link>
        <Link
          href={`/courses/${courseSlug}/${lessonSlug}/quiz`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors"
        >
          <RotateCcw size={14} />
          Retake quiz
        </Link>
      </div>

      {/* Score card + breakdown */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Score ring */}
        <div
          className="bg-card border border-border rounded-xl p-6 flex items-center gap-6"
        >
          <ScoreRing score={result.score} passed={result.passed} />
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <StatItem label="Correct" value={`${result.correct} / ${result.total}`} />
            <StatItem label="Time" value={formatTime(result.timeTaken)} />
            <StatItem label="Pass mark" value={`${result.passingScore}%`} />
            <StatItem
              label="Result"
              value={result.passed ? "Passed" : "Failed"}
              color={result.passed ? "var(--ok)" : "var(--bad)"}
            />
          </div>
        </div>

        {/* Quick summary */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="text-[14px] font-medium mb-1">What happened</div>
          <div className="text-[13px] text-muted-foreground mb-4">
            {result.correct} of {result.total} questions correct
          </div>
          <div className="space-y-2">
            {result.questions.map((q, i) => (
              <div key={q.id} className="flex items-center gap-2.5 text-[13px]">
                {q.isCorrect ? (
                  <CheckCircle2 size={14} style={{ color: "var(--ok)", flexShrink: 0 }} />
                ) : (
                  <XCircle size={14} style={{ color: "var(--bad)", flexShrink: 0 }} />
                )}
                <span className="text-muted-foreground truncate">Q{i + 1}. {q.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question review */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <div className="text-[14px] font-medium">Question review</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">
              {result.total - result.correct} missed — tap to see explanations
            </div>
          </div>
          <span
            className="text-[11.5px] px-2.5 py-0.5 rounded-full"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            {result.total} questions
          </span>
        </div>

        {result.questions.map((q, i) => {
          const isOpen = expanded === q.id;
          return (
            <div key={q.id} className="border-b border-border last:border-b-0">
              {/* Row */}
              <button
                onClick={() => setExpanded(isOpen ? null : q.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div
                  className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[12px] flex-none"
                  style={{
                    background: q.isCorrect ? "var(--ok-soft)" : "var(--bad-soft)",
                    color: q.isCorrect ? "var(--ok)" : "var(--bad)",
                  }}
                >
                  {q.isCorrect ? "✓" : "✗"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] truncate">{q.text}</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">
                    {q.isCorrect
                      ? "Correct"
                      : `You chose: ${q.yourAnswer >= 0 ? LETTERS[q.yourAnswer] : "—"} · Answer: ${LETTERS[q.correctAnswer]}`}
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp size={14} className="text-muted-foreground flex-none" />
                ) : (
                  <ChevronDown size={14} className="text-muted-foreground flex-none" />
                )}
              </button>

              {/* Expanded explanation */}
              {isOpen && (
                <div
                  className="px-5 pb-5 pt-1 space-y-3"
                  style={{ background: "var(--surface)" }}
                >
                  {/* Options with correct/wrong markers */}
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isCorrect = oi === q.correctAnswer;
                      const isYours = oi === q.yourAnswer;
                      return (
                        <div
                          key={oi}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px]"
                          style={{
                            background: isCorrect
                              ? "var(--ok-soft)"
                              : isYours && !isCorrect
                              ? "var(--bad-soft)"
                              : "var(--surface-2)",
                            border: `1px solid ${isCorrect ? "transparent" : isYours ? "transparent" : "var(--border)"}`,
                          }}
                        >
                          <span
                            className="font-medium text-[12px] w-5 text-center"
                            style={{
                              color: isCorrect
                                ? "var(--ok)"
                                : isYours && !isCorrect
                                ? "var(--bad)"
                                : "var(--muted-foreground)",
                            }}
                          >
                            {LETTERS[oi]}
                          </span>
                          <span>{opt.text}</span>
                          {isCorrect && (
                            <span
                              className="ml-auto text-[11px] font-medium"
                              style={{ color: "var(--ok)" }}
                            >
                              Correct
                            </span>
                          )}
                          {isYours && !isCorrect && (
                            <span
                              className="ml-auto text-[11px] font-medium"
                              style={{ color: "var(--bad)" }}
                            >
                              Your answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div
                      className="rounded-lg px-4 py-3 text-[13px] leading-relaxed"
                      style={{ background: "var(--terracotta-tint)", color: "var(--ink-2)" }}
                    >
                      <span
                        className="font-medium"
                        style={{ color: "var(--terracotta-deep)" }}
                      >
                        Explanation:{" "}
                      </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function ScoreRing({ score, passed }: { score: number; passed: boolean }) {
  const size = 120;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = passed ? "var(--ok)" : score >= 50 ? "var(--warn)" : "var(--bad)";

  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="var(--surface-3)" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-[26px] font-normal leading-none"
          style={{ fontFamily: "var(--font-serif)", color }}
        >
          {score}%
        </span>
      </div>
    </div>
  );
}

function StatItem({
  label, value, color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <div className="text-[11.5px] text-muted-foreground mb-0.5">{label}</div>
      <div
        className="text-[22px] font-normal"
        style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em", color }}
      >
        {value}
      </div>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────── */

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
