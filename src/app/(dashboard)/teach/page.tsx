import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Users, ChevronRight } from "lucide-react";

export const metadata = { title: "Teaching — Edapt" };

export default async function TeachPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/dashboard");

  const courses = await prisma.course.findMany({
    where: { creatorId: session.user.id },
    include: {
      _count: { select: { enrollments: true, modules: true } },
      modules: {
        include: {
          lessons: {
            include: { quizzes: { select: { id: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalEnrollments = courses.reduce(
    (sum, c) => sum + c._count.enrollments,
    0
  );

  const totalLessons = courses.reduce(
    (sum, c) =>
      sum + c.modules.reduce((ms, m) => ms + m.lessons.length, 0),
    0
  );

  const totalQuizzes = courses.reduce(
    (sum, c) =>
      sum +
      c.modules.reduce(
        (ms, m) =>
          ms + m.lessons.reduce((ls, l) => ls + l.quizzes.length, 0),
        0
      ),
    0
  );

  return (
    <div className="p-8 max-w-4xl">
      <h1
        className="text-3xl font-normal mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Teaching home
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Welcome back, {session.user.name}
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Courses", value: courses.length },
          { label: "Students enrolled", value: totalEnrollments },
          { label: "Quizzes created", value: totalQuizzes },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-border rounded-xl p-5"
            style={{ background: "var(--surface-2)" }}
          >
            <div
              className="text-3xl font-semibold"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {stat.value}
            </div>
            <div className="text-muted-foreground text-[13px] mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Course list */}
      <h2 className="text-base font-semibold mb-3">Your courses</h2>

      {courses.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center text-muted-foreground text-sm">
          No courses yet.{" "}
          <Link href="/courses/new" className="underline text-foreground">
            Create your first course
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {courses.map((course) => {
            const lessonCount = course.modules.reduce(
              (s, m) => s + m.lessons.length,
              0
            );
            const quizCount = course.modules.reduce(
              (s, m) =>
                s + m.lessons.reduce((ls, l) => ls + l.quizzes.length, 0),
              0
            );
            const lessonsWithoutQuiz = course.modules.reduce(
              (s, m) =>
                s +
                m.lessons.filter((l) => l.quizzes.length === 0).length,
              0
            );

            return (
              <Link
                key={course.id}
                href={`/teach/courses/${course.id}`}
                className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-black/[0.02] transition-colors"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[14px] font-medium truncate">
                    {course.title}
                  </span>
                  <div className="flex gap-3 text-[12px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen size={11} />
                      {lessonCount} lesson{lessonCount !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      {course._count.enrollments} student
                      {course._count.enrollments !== 1 ? "s" : ""}
                    </span>
                    {lessonsWithoutQuiz > 0 && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[10.5px] font-medium"
                        style={{
                          background: "var(--terracotta)",
                          color: "#fff",
                          opacity: 0.85,
                        }}
                      >
                        {lessonsWithoutQuiz} lesson
                        {lessonsWithoutQuiz !== 1 ? "s" : ""} missing quiz
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full border ${
                      course.status === "PUBLISHED"
                        ? "border-green-300 text-green-700 bg-green-50"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {course.status.toLowerCase()}
                  </span>
                  <ChevronRight size={15} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
