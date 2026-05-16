import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Flame, TrendingUp, AlertCircle } from "lucide-react";

export const metadata = { title: "Progress — Cognify" };

export default async function ProgressPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;

  const [profile, attempts, lessonsDone] = await Promise.all([
    prisma.learningProfile.findUnique({ where: { userId } }),
    prisma.quizAttempt.findMany({
      where: { userId, status: "COMPLETED" },
      include: { quiz: { select: { title: true, passingScore: true } } },
      orderBy: { completedAt: "desc" },
    }),
    prisma.lessonProgress.count({
      where: {
        enrollment: { userId },
        completed: true,
      },
    }),
  ]);

  const weakTopics = (profile?.weakTopics as string[]) ?? [];
  const strongTopics = (profile?.strongTopics as string[]) ?? [];
  const streak = profile?.streakDays ?? 0;

  const avgScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((s, a) => s + (a.score ?? 0), 0) / attempts.length
        )
      : null;

  const passCount = attempts.filter((a) => (a.score ?? 0) >= a.quiz.passingScore).length;

  return (
    <div className="p-8 max-w-3xl">
      <h1
        className="text-3xl font-normal mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Your progress
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        A full view of your learning journey.
      </p>

      {/* ── Summary cards ──────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        <div
          className="border border-border rounded-xl p-5"
          style={{ background: "var(--surface-2)" }}
        >
          <div
            className="flex items-center gap-2 mb-3"
            style={{ color: "var(--terracotta)" }}
          >
            <Flame size={18} />
            <span className="text-[13px] font-medium">Streak</span>
          </div>
          <div
            className="text-4xl font-semibold"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {streak}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1">
            day{streak !== 1 ? "s" : ""} in a row
          </div>
        </div>

        <div
          className="border border-border rounded-xl p-5"
          style={{ background: "var(--surface-2)" }}
        >
          <div className="flex items-center gap-2 mb-3 text-muted-foreground">
            <TrendingUp size={18} />
            <span className="text-[13px] font-medium">Avg score</span>
          </div>
          <div
            className="text-4xl font-semibold"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {avgScore !== null ? `${avgScore}%` : "—"}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1">
            {passCount} of {attempts.length} passed
          </div>
        </div>

        <div
          className="border border-border rounded-xl p-5"
          style={{ background: "var(--surface-2)" }}
        >
          <div className="flex items-center gap-2 mb-3 text-muted-foreground">
            <span className="text-[18px]">📖</span>
            <span className="text-[13px] font-medium">Lessons</span>
          </div>
          <div
            className="text-4xl font-semibold"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {lessonsDone}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1">
            completed
          </div>
        </div>
      </div>

      {/* ── Weak / Strong topics ─────────────────────────── */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={15} style={{ color: "var(--terracotta)" }} />
            <h2 className="text-[14px] font-semibold">Needs review</h2>
          </div>
          {weakTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No weak topics yet. Keep taking quizzes!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {weakTopics.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 rounded-lg text-[12.5px] font-medium"
                  style={{
                    background: "var(--terracotta-tint)",
                    color: "var(--terracotta-deep)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[15px]">✓</span>
            <h2 className="text-[14px] font-semibold">Strong topics</h2>
          </div>
          {strongTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Score ≥ 85% on quizzes to build your strengths.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {strongTopics.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 rounded-lg text-[12.5px] font-medium bg-green-100 text-green-700"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quiz history ────────────────────────────────── */}
      <h2 className="text-[14px] font-semibold mb-3">Quiz history</h2>
      {attempts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No quizzes taken yet.</p>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          {attempts.map((a, i) => {
            const passed = (a.score ?? 0) >= a.quiz.passingScore;
            return (
              <div
                key={a.id}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  i < attempts.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div>
                  <div className="text-[13.5px] font-medium">
                    {a.quiz.title}
                  </div>
                  <div className="text-[11.5px] text-muted-foreground mt-0.5">
                    {a.completedAt
                      ? new Date(a.completedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                    {a.timeTaken ? ` · ${Math.round(a.timeTaken / 60)}m` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${
                      passed
                        ? "bg-green-100 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {a.score ?? 0}%
                  </span>
                  <span
                    className={`text-[11px] ${
                      passed ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {passed ? "Passed" : "Failed"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
