import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle, BookOpen } from "lucide-react";
import GenerateQuizButton from "@/components/quiz/GenerateQuizButton";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    select: { title: true },
  });
  return {
    title: course ? `Manage: ${course.title} — Cognify` : "Manage — Cognify",
  };
}

export default async function ManageCoursePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/dashboard");

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              quizzes: {
                select: {
                  id: true,
                  title: true,
                  isAIGenerated: true,
                  _count: { select: { questions: true } },
                },
              },
            },
          },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) notFound();

  // Only the creator (or admin) can manage a course
  if (
    session.user.role === "TEACHER" &&
    course.creatorId !== session.user.id
  ) {
    redirect("/teach");
  }

  const totalLessons = course.modules.reduce(
    (s, m) => s + m.lessons.length,
    0
  );
  const lessonsWithQuiz = course.modules.reduce(
    (s, m) => s + m.lessons.filter((l) => l.quizzes.length > 0).length,
    0
  );

  return (
    <div className="p-8 max-w-3xl">
      {/* Back link */}
      <Link
        href="/teach"
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft size={14} />
        Teaching home
      </Link>

      {/* Quick links to editor + analytics */}
      <div className="flex gap-3 mb-6">
        <Link
          href={`/teach/courses/${id}/edit`}
          className="text-[12.5px] px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          Edit course / add lessons
        </Link>
        <Link
          href={`/teach/courses/${id}/analytics`}
          className="text-[12.5px] px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          Analytics
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h1
          className="text-2xl font-normal"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {course.title}
        </h1>
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full border mt-1 ${
            course.status === "PUBLISHED"
              ? "border-green-300 text-green-700 bg-green-50"
              : "border-border text-muted-foreground"
          }`}
        >
          {course.status.toLowerCase()}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        {course._count.enrollments} student
        {course._count.enrollments !== 1 ? "s" : ""} enrolled · {totalLessons}{" "}
        lesson{totalLessons !== 1 ? "s" : ""} · {lessonsWithQuiz} with quiz
      </p>

      {/* Modules + Lessons */}
      {course.modules.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No modules yet. Add modules and lessons to this course first.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {course.modules.map((mod) => (
            <div key={mod.id}>
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-2">
                Module {mod.order} · {mod.title}
              </h2>

              {mod.lessons.length === 0 ? (
                <p className="text-[13px] text-muted-foreground pl-3">
                  No lessons in this module.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {mod.lessons.map((lesson) => {
                    const quiz = lesson.quizzes[0];
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 border border-border rounded-xl"
                        style={{ background: "var(--surface-2)" }}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <BookOpen
                            size={14}
                            className="mt-0.5 flex-none text-muted-foreground"
                          />
                          <div className="min-w-0">
                            <p className="text-[13.5px] font-medium truncate">
                              {lesson.title}
                            </p>
                            {quiz ? (
                              <p className="text-[11.5px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <CheckCircle
                                  size={11}
                                  className="text-green-600"
                                />
                                {quiz.title} · {quiz._count.questions} questions
                                {quiz.isAIGenerated && (
                                  <span className="ml-1 px-1.5 rounded text-[10px] font-medium bg-violet-100 text-violet-700">
                                    AI
                                  </span>
                                )}
                              </p>
                            ) : (
                              <p className="text-[11.5px] text-muted-foreground mt-0.5">
                                No quiz
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Generate button — only shows if no quiz yet */}
                        {!quiz && (
                          <GenerateQuizButton lessonId={lesson.id} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
