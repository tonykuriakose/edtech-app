import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import {
  BookOpen, Clock, Users, Check, ChevronRight, Play, ArrowLeft,
} from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: { title: true, description: true },
  });
  if (!course) return { title: "Course not found — Edapt" };
  return { title: `${course.title} — Edapt`, description: course.description };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const [course, enrollment] = await Promise.all([
    prisma.course.findUnique({
      where: { slug, status: "PUBLISHED" },
      include: {
        category: true,
        creator: { select: { name: true } },
        modules: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: { id: true, title: true, slug: true, order: true, duration: true },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: { select: { enrollments: true } },
      },
    }),
    session
      ? prisma.enrollment.findFirst({
          where: { userId: session.user.id, course: { slug } },
        })
      : null,
  ]);

  if (!course) notFound();

  const isEnrolled = !!enrollment;
  const totalLessons = course.modules.reduce((n, m) => n + m.lessons.length, 0);
  const firstLesson = course.modules[0]?.lessons[0];

  /* ── Server Action: enroll ─────────────────────────────── */
  async function enroll() {
    "use server";
    const s = await auth();
    if (!s) redirect("/login");

    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: s.user.id, courseId: course!.id } },
      create: { userId: s.user.id, courseId: course!.id, status: "ACTIVE", progress: 0 },
      update: {},
    });
    revalidatePath(`/courses/${slug}`);
  }

  return (
    <div className="px-9 py-7 max-w-6xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-5">
        <Link href="/courses" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft size={12} />
          Course catalog
        </Link>
        <ChevronRight size={12} />
        <span className="text-foreground">{course.title}</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        {/* ── Left column ─────────────────────────────────── */}
        <div>
          {/* Meta chips */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {course.category && (
              <span
                className="text-[11.5px] px-2.5 py-0.5 rounded-full border border-border"
                style={{ background: "var(--surface-2)" }}
              >
                {course.category.name}
              </span>
            )}
            <DifficultyChip difficulty={course.difficulty} />
            <span
              className="text-[11.5px] px-2.5 py-0.5 rounded-full border border-border"
              style={{ background: "var(--surface-2)" }}
            >
              {totalLessons} lessons
            </span>
            <span
              className="text-[11.5px] px-2.5 py-0.5 rounded-full border border-border"
              style={{ background: "var(--surface-2)" }}
            >
              {course.modules.length} modules
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-[42px] font-normal leading-[1.05] mb-4"
            style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.025em" }}
          >
            {course.title}
          </h1>

          {/* Description */}
          <p className="text-muted-foreground text-[15px] leading-relaxed mb-5 max-w-2xl">
            {course.description}
          </p>

          {/* Creator + stats */}
          <div className="flex items-center gap-5 text-[13px] text-muted-foreground mb-7">
            <div className="flex items-center gap-2">
              <div
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-white text-[10px] font-medium"
                style={{ background: "var(--terracotta)" }}
              >
                {(course.creator?.name ?? "?")[0].toUpperCase()}
              </div>
              <span>{course.creator?.name ?? "Unknown"}</span>
            </div>
            <span className="flex items-center gap-1">
              <Users size={13} />
              {course._count.enrollments} learners
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={13} />
              {totalLessons} lessons
            </span>
          </div>

          {/* CTA buttons */}
          <div className="flex items-center gap-3 mb-10">
            {isEnrolled ? (
              <>
                {firstLesson && (
                  <Link
                    href={`/courses/${slug}/${firstLesson.slug}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
                    style={{ background: "var(--terracotta)" }}
                  >
                    <Play size={14} />
                    Continue learning
                  </Link>
                )}
                <span
                  className="flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: "var(--ok)" }}
                >
                  <Check size={14} />
                  Enrolled
                </span>
              </>
            ) : (
              <form action={enroll}>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer"
                  style={{ background: "var(--terracotta)" }}
                >
                  Enroll for free
                </button>
              </form>
            )}
          </div>

          {/* What you'll learn */}
          {course.tags && course.tags.length > 0 && (
            <div className="mb-8">
              <h2
                className="text-[22px] font-normal mb-4"
                style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
              >
                Topics covered
              </h2>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[12px] px-3 py-1 rounded-full border border-border"
                    style={{ background: "var(--surface-2)", fontFamily: "var(--font-mono)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum */}
          <h2
            className="text-[22px] font-normal mb-4"
            style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
          >
            Curriculum
          </h2>
          <div className="border border-border rounded-xl overflow-hidden">
            {course.modules.map((mod, modIdx) => (
              <div key={mod.id}>
                {/* Module header */}
                <div
                  className="flex items-center justify-between px-5 py-4 border-b border-border"
                  style={{
                    background: modIdx % 2 === 0 ? "var(--surface)" : "var(--surface-2)",
                    borderTop: modIdx > 0 ? "1px solid var(--border)" : undefined,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="text-[22px] font-normal opacity-30 w-8"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {String(modIdx + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="font-medium text-[14px]">{mod.title}</div>
                      <div className="text-[12px] text-muted-foreground mt-0.5">
                        {mod.lessons.length} lessons
                        {mod.lessons.length > 0 && (
                          <> · {formatDuration(mod.lessons.reduce((t, l) => t + (l.duration ?? 0), 0))}</>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lessons */}
                {mod.lessons.map((lesson, lessonIdx) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-4 px-5 py-3 border-b border-border last:border-b-0"
                    style={{ background: "var(--card)" }}
                  >
                    <div className="w-8 flex justify-center">
                      {isEnrolled ? (
                        <Link href={`/courses/${slug}/${lesson.slug}`}>
                          <div
                            className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-white"
                            style={{ background: "var(--surface-3)" }}
                          >
                            <Play size={10} />
                          </div>
                        </Link>
                      ) : (
                        <div
                          className="w-[28px] h-[28px] rounded-full flex items-center justify-center"
                          style={{ background: "var(--surface-3)", color: "var(--muted-foreground)" }}
                        >
                          <span className="text-[10px]">{lessonIdx + 1}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-[13.5px]">{lesson.title}</div>
                    {lesson.duration && (
                      <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                        <Clock size={11} />
                        {formatDuration(lesson.duration)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right sidebar ───────────────────────────────── */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {/* Thumbnail */}
          <div
            className="rounded-xl h-[180px] flex items-center justify-center"
            style={{ background: "var(--terracotta-soft)" }}
          >
            <span
              className="text-7xl font-normal opacity-30"
              style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
            >
              {course.title[0].toUpperCase()}
            </span>
          </div>

          {/* Stats card */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <div className="text-muted-foreground text-[11.5px] mb-1">Modules</div>
                <div className="font-medium">{course.modules.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-[11.5px] mb-1">Lessons</div>
                <div className="font-medium">{totalLessons}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-[11.5px] mb-1">Difficulty</div>
                <div className="font-medium capitalize">{course.difficulty.toLowerCase()}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-[11.5px] mb-1">Learners</div>
                <div className="font-medium">{course._count.enrollments}</div>
              </div>
            </div>

            {!isEnrolled && (
              <>
                <div className="border-t border-border my-4" />
                <form action={enroll} className="w-full">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer"
                    style={{ background: "var(--terracotta)" }}
                  >
                    Enroll for free
                  </button>
                </form>
                <p className="text-center text-[11.5px] text-muted-foreground mt-2">
                  No credit card required
                </p>
              </>
            )}

            {isEnrolled && firstLesson && (
              <>
                <div className="border-t border-border my-4" />
                <Link
                  href={`/courses/${slug}/${firstLesson.slug}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ background: "var(--terracotta)" }}
                >
                  <Play size={14} />
                  Continue learning
                </Link>
              </>
            )}
          </div>

          {/* Progress card — only when enrolled */}
          {isEnrolled && enrollment && (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="text-[13px] font-medium mb-3">Your progress</div>
              <div className="flex items-center justify-between text-[12px] text-muted-foreground mb-2">
                <span>Overall completion</span>
                <span className="font-medium text-foreground">{Math.round(enrollment.progress)}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${enrollment.progress}%`, background: "var(--terracotta)" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────── */

function DifficultyChip({ difficulty }: { difficulty: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    BEGINNER:     { bg: "var(--ok-soft)",   color: "var(--ok)" },
    INTERMEDIATE: { bg: "var(--warn-soft)", color: "var(--warn)" },
    ADVANCED:     { bg: "var(--bad-soft)",  color: "var(--bad)" },
  };
  const s = map[difficulty] ?? map.BEGINNER;
  return (
    <span
      className="text-[11.5px] px-2.5 py-0.5 rounded-full font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
    </span>
  );
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}
