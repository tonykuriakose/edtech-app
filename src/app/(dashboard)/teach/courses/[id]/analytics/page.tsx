import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    select: { title: true },
  });
  return {
    title: course ? `Analytics: ${course.title} — Cognify` : "Analytics — Cognify",
  };
}

export default async function CourseAnalyticsPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/dashboard");

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: {
          user: { select: { name: true, email: true } },
          lessonProgress: { where: { completed: true }, select: { lessonId: true } },
        },
        orderBy: { enrolledAt: "desc" },
      },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              quizzes: {
                include: {
                  attempts: {
                    where: { status: "COMPLETED" },
                    select: { score: true, userId: true },
                  },
                },
              },
              progress: { where: { completed: true }, select: { enrollmentId: true } },
            },
          },
        },
      },
    },
  });

  if (!course) notFound();
  if (session.user.role === "TEACHER" && course.creatorId !== session.user.id) {
    redirect("/teach");
  }

  const totalStudents = course.enrollments.length;
  const totalLessons = course.modules.reduce(
    (s, m) => s + m.lessons.length,
    0
  );

  // Average quiz score across all attempts in this course
  const allAttempts = course.modules.flatMap((m) =>
    m.lessons.flatMap((l) =>
      l.quizzes.flatMap((q) => q.attempts.map((a) => a.score ?? 0))
    )
  );
  const avgScore =
    allAttempts.length > 0
      ? Math.round(allAttempts.reduce((s, v) => s + v, 0) / allAttempts.length)
      : null;

  return (
    <div className="p-8 max-w-3xl">
      {/* Back */}
      <Link
        href={`/teach/courses/${id}/edit`}
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft size={14} />
        Back to editor
      </Link>

      <h1
        className="text-2xl font-normal mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Analytics
      </h1>
      <p className="text-sm text-muted-foreground mb-8">{course.title}</p>

      {/* ── Summary stats ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: "Students enrolled", value: totalStudents },
          { label: "Avg quiz score", value: avgScore !== null ? `${avgScore}%` : "—" },
          { label: "Total lessons", value: totalLessons },
        ].map((s) => (
          <div
            key={s.label}
            className="border border-border rounded-xl p-5"
            style={{ background: "var(--surface-2)" }}
          >
            <div
              className="text-3xl font-semibold"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {s.value}
            </div>
            <div className="text-[12px] text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Lesson completion rates ──────────────────────── */}
      <h2 className="text-[14px] font-semibold mb-3">Lesson completion</h2>
      {totalStudents === 0 ? (
        <p className="text-sm text-muted-foreground mb-8">No students enrolled yet.</p>
      ) : (
        <div className="flex flex-col gap-2 mb-10">
          {course.modules.flatMap((mod) =>
            mod.lessons.map((lesson) => {
              const completedCount = lesson.progress.length;
              const pct =
                totalStudents > 0
                  ? Math.round((completedCount / totalStudents) * 100)
                  : 0;
              const quizAttempts = lesson.quizzes[0]?.attempts ?? [];
              const lessonAvg =
                quizAttempts.length > 0
                  ? Math.round(
                      quizAttempts.reduce((s, a) => s + (a.score ?? 0), 0) /
                        quizAttempts.length
                    )
                  : null;

              return (
                <div
                  key={lesson.id}
                  className="border border-border rounded-xl overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0">
                      <span className="text-[13.5px] font-medium">{lesson.title}</span>
                      <span className="ml-2 text-[11px] text-muted-foreground">
                        M{mod.order}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[12px] flex-none">
                      <span className="text-muted-foreground">
                        {completedCount}/{totalStudents} done
                      </span>
                      {lessonAvg !== null && (
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full text-[11.5px] ${
                            lessonAvg >= 70
                              ? "bg-green-100 text-green-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          quiz avg {lessonAvg}%
                        </span>
                      )}
                      <span className="font-semibold w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ background: "var(--surface-3)" }}>
                    <div
                      className="h-1"
                      style={{
                        width: `${pct}%`,
                        background: pct === 100 ? "var(--ok)" : "var(--terracotta)",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Student list ────────────────────────────────── */}
      <h2 className="text-[14px] font-semibold mb-3 flex items-center gap-2">
        <Users size={14} />
        Students
      </h2>
      {course.enrollments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          {course.enrollments.map((enrollment, i) => {
            const done = enrollment.lessonProgress.length;
            const pct =
              totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0;
            return (
              <div
                key={enrollment.id}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  i < course.enrollments.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div>
                  <div className="text-[13.5px] font-medium">
                    {enrollment.user.name}
                  </div>
                  <div className="text-[11.5px] text-muted-foreground">
                    {enrollment.user.email}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[12px]">
                  <span className="text-muted-foreground">
                    {done}/{totalLessons} lessons
                  </span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full text-[11.5px] ${
                      pct === 100
                        ? "bg-green-100 text-green-700"
                        : "bg-transparent text-muted-foreground border border-border"
                    }`}
                  >
                    {pct}%
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
