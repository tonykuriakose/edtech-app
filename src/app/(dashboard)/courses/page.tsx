import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { BookOpen, Users, Clock, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Browse courses — Edapt" };

export default async function CoursesPage() {
  const session = await auth();

  const [courses, enrollments] = await Promise.all([
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      include: {
        category: true,
        creator: { select: { name: true } },
        _count: { select: { enrollments: true, modules: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    session
      ? prisma.enrollment.findMany({
          where: { userId: session.user.id },
          select: { courseId: true },
        })
      : [],
  ]);

  const enrolledIds = new Set(enrollments.map((e) => e.courseId));

  return (
    <div className="px-9 py-7 max-w-6xl">
      {/* Page header */}
      <div className="mb-7">
        <p
          className="text-[11.5px] font-medium tracking-widest uppercase mb-2"
          style={{ color: "var(--terracotta-deep)" }}
        >
          Course catalog
        </p>
        <h1
          className="text-[34px] font-normal leading-[1.05] mb-2"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.025em" }}
        >
          Find your next thing to learn.
        </h1>
        <p className="text-muted-foreground text-sm">
          {courses.length} course{courses.length !== 1 ? "s" : ""} — all include adaptive quizzes and an AI tutor.
        </p>
      </div>

      {/* Empty state */}
      {courses.length === 0 && (
        <div
          className="rounded-xl border border-dashed border-border p-16 text-center"
          style={{ background: "var(--surface)" }}
        >
          <BookOpen size={32} className="mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground text-sm">No published courses yet.</p>
          <p className="text-muted-foreground text-xs mt-1">
            Teachers can create courses from the Teaching dashboard.
          </p>
        </div>
      )}

      {/* Course grid */}
      {courses.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((course) => {
            const enrolled = enrolledIds.has(course.id);
            return (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <CourseThumbnail title={course.title} difficulty={course.difficulty} />

                {/* Card body */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[11px] font-medium tracking-wider uppercase"
                      style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}
                    >
                      {course.category?.name ?? "Uncategorized"}
                    </span>
                    <DifficultyChip difficulty={course.difficulty} />
                  </div>

                  <h2
                    className="text-[18px] font-normal leading-snug mb-1.5 group-hover:text-primary transition-colors"
                    style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.015em" }}
                  >
                    {course.title}
                  </h2>

                  <p className="text-[12px] text-muted-foreground mb-3 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-3 text-[12px] text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen size={12} />
                      {course._count.modules} modules
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {course._count.enrollments} learners
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground">
                      by {course.creator?.name ?? "Unknown"}
                    </span>
                    {enrolled ? (
                      <span className="flex items-center gap-1 text-[12px] font-medium" style={{ color: "var(--ok)" }}>
                        <CheckCircle2 size={13} />
                        Enrolled
                      </span>
                    ) : (
                      <span
                        className="text-[12px] font-medium px-3 py-1 rounded-md text-white"
                        style={{ background: "var(--terracotta)" }}
                      >
                        View course
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Helper components ────────────────────────────────────── */

function CourseThumbnail({
  title,
  difficulty,
}: {
  title: string;
  difficulty: string;
}) {
  // Generate a warm color from the first char of the title
  const colors: Record<string, string> = {
    A: "#e8d5c4", B: "#c4d5e8", C: "#c4e8d5", D: "#e8c4d5",
    E: "#d5e8c4", F: "#d5c4e8", G: "#e8e4c4", H: "#c4e8e4",
    I: "#e4c4e8", J: "#e8d5c4", K: "#c4d5e8", L: "#c4e8d5",
    M: "#d5e4c4", N: "#e8c4c4", O: "#c4c4e8", P: "#e8e8c4",
    default: "var(--terracotta-soft)",
  };
  const bg = colors[title[0]?.toUpperCase() ?? ""] ?? colors.default;

  return (
    <div
      className="h-[120px] flex items-center justify-center"
      style={{ background: bg }}
    >
      <span
        className="text-4xl font-normal opacity-40"
        style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
      >
        {title[0]?.toUpperCase()}
      </span>
    </div>
  );
}

function DifficultyChip({ difficulty }: { difficulty: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    BEGINNER:     { bg: "var(--ok-soft)",   color: "var(--ok)",   label: "Beginner" },
    INTERMEDIATE: { bg: "var(--warn-soft)", color: "var(--warn)", label: "Intermediate" },
    ADVANCED:     { bg: "var(--bad-soft)",  color: "var(--bad)",  label: "Advanced" },
  };
  const s = styles[difficulty] ?? styles.BEGINNER;
  return (
    <span
      className="text-[11px] px-2 py-0.5 rounded-full font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}
