import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import ProgressRing from "@/components/course/ProgressRing";

export const metadata = { title: "My Courses — Edapt" };

export default async function MyCoursesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: { select: { id: true } },
            },
          },
          creator: { select: { name: true } },
        },
      },
      lessonProgress: {
        where: { completed: true },
        select: { lessonId: true },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return (
    <div className="p-8 max-w-3xl">
      <h1
        className="text-3xl font-normal mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        My courses
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        {enrollments.length} course{enrollments.length !== 1 ? "s" : ""} enrolled
      </p>

      {enrollments.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center">
          <BookOpen size={28} className="mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground text-sm mb-4">
            You haven&apos;t enrolled in any courses yet.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-medium"
            style={{ color: "var(--terracotta)" }}
          >
            Browse courses
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {enrollments.map((e) => {
            const allLessons = e.course.modules.flatMap((m) => m.lessons);
            const totalLessons = allLessons.length;
            const done = e.lessonProgress.length;
            const isComplete = e.progress >= 100;

            // Find the first incomplete lesson for the "Continue" link
            const completedIds = new Set(e.lessonProgress.map((p) => p.lessonId));
            const nextLesson = allLessons.find((l) => !completedIds.has(l.id));
            const firstLesson = allLessons[0];

            return (
              <div
                key={e.id}
                className="border border-border rounded-xl overflow-hidden"
              >
                {/* Progress bar at top */}
                <div
                  className="h-1"
                  style={{ background: "var(--surface-3)" }}
                >
                  <div
                    className="h-full"
                    style={{
                      width: `${e.progress}%`,
                      background: isComplete
                        ? "var(--ok)"
                        : "var(--terracotta)",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>

                <div className="p-5 flex items-center gap-5">
                  {/* Progress ring */}
                  <div className="relative flex-none">
                    <ProgressRing
                      progress={e.progress}
                      size={52}
                      stroke={4}
                      color={isComplete ? "var(--ok)" : "var(--terracotta)"}
                    />
                    <span
                      className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold"
                      style={{ color: isComplete ? "var(--ok)" : "var(--terracotta)" }}
                    >
                      {Math.round(e.progress)}%
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-medium truncate">
                      {e.course.title}
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">
                      by {e.course.creator.name} ·{" "}
                      {e.course.modules.length} module
                      {e.course.modules.length !== 1 ? "s" : ""} · {totalLessons} lesson
                      {totalLessons !== 1 ? "s" : ""}
                    </div>
                    <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-3)", maxWidth: 240 }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${e.progress}%`,
                          background: isComplete ? "var(--ok)" : "var(--terracotta)",
                        }}
                      />
                    </div>
                    <p className="text-[11.5px] text-muted-foreground mt-1">
                      {done} of {totalLessons} lessons complete
                    </p>
                  </div>

                  {/* Action button */}
                  {isComplete ? (
                    <Link
                      href={`/courses/${e.course.slug}`}
                      className="flex-none text-[13px] font-medium px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Review
                    </Link>
                  ) : (
                    <Link
                      href={
                        nextLesson
                          ? `/courses/${e.course.slug}/${nextLesson.id}`
                          : firstLesson
                          ? `/courses/${e.course.slug}/${firstLesson.id}`
                          : `/courses/${e.course.slug}`
                      }
                      className="flex-none flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-lg text-white"
                      style={{ background: "var(--terracotta)" }}
                    >
                      Continue
                      <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
