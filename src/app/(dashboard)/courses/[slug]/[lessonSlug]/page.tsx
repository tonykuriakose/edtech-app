import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2,
  Clock,
} from "lucide-react";
import AIChatPanel from "@/components/ai/AIChatPanel";

type Props = {
  params: Promise<{ slug: string; lessonSlug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { lessonSlug } = await params;
  const lesson = await prisma.lesson.findFirst({
    where: { slug: lessonSlug },
    select: { title: true },
  });
  return { title: lesson ? `${lesson.title} — Edapt` : "Lesson — Edapt" };
}

export default async function LessonPage({ params }: Props) {
  const { slug, lessonSlug } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  /* ── Data fetching ──────────────────────────────────────── */
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        include: {
          lessons: { orderBy: { order: "asc" } },
          _count: { select: { lessons: true } },
        },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!course) notFound();

  const lesson = await prisma.lesson.findFirst({
    where: { slug: lessonSlug },
    include: { module: true },
  });
  if (!lesson) notFound();

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: session.user.id, courseId: course.id },
    include: {
      lessonProgress: {
        where: { completed: true },
        select: { lessonId: true },
      },
    },
  });

  // Must be enrolled to view a lesson
  if (!enrollment) redirect(`/courses/${slug}`);

  const completedIds = new Set(enrollment.lessonProgress.map((p) => p.lessonId));

  // Compute flat lesson list for prev/next navigation
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const lessonIndex = allLessons.findIndex((l) => l.slug === lessonSlug);
  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : null;

  const isCompleted = completedIds.has(lesson.id);
  const readMinutes = lesson.duration ? Math.ceil(lesson.duration / 60) : null;

  /* ── Server Actions ─────────────────────────────────────── */
  async function markComplete() {
    "use server";
    const s = await auth();
    if (!s) return;

    const enroll = await prisma.enrollment.findFirst({
      where: { userId: s.user.id, courseId: course!.id },
    });
    if (!enroll) return;

    await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: { enrollmentId: enroll.id, lessonId: lesson!.id },
      },
      create: {
        enrollmentId: enroll.id,
        lessonId: lesson!.id,
        completed: true,
        completedAt: new Date(),
      },
      update: { completed: true, completedAt: new Date() },
    });

    // Recalculate enrollment progress %
    const total = allLessons.length;
    const done = await prisma.lessonProgress.count({
      where: { enrollmentId: enroll.id, completed: true },
    });
    await prisma.enrollment.update({
      where: { id: enroll.id },
      data: { progress: total > 0 ? (done / total) * 100 : 0 },
    });

    revalidatePath(`/courses/${slug}/${lessonSlug}`);

    if (nextLesson) {
      redirect(`/courses/${slug}/${nextLesson.slug}`);
    } else {
      redirect(`/courses/${slug}`);
    }
  }

  /* ── Render ─────────────────────────────────────────────── */
  return (
    // 3-column layout, fills the viewport below the header (56px)
    <div
      className="grid overflow-hidden"
      style={{
        gridTemplateColumns: "260px 1fr 280px",
        height: "calc(100vh - 56px)",
      }}
    >
      {/* ── Left: lesson navigation ────────────────────────── */}
      <aside
        className="flex flex-col border-r border-border overflow-y-auto"
        style={{ background: "var(--surface)" }}
      >
        {/* Back to course */}
        <div className="p-4 border-b border-border">
          <Link
            href={`/courses/${slug}`}
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={12} />
            Back to course
          </Link>
          <div
            className="mt-2 text-[17px] font-normal leading-snug"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {course.title}
          </div>

          {/* Overall progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
              <span>{completedIds.size} of {allLessons.length} lessons</span>
              <span>{Math.round(enrollment.progress)}%</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${enrollment.progress}%`, background: "var(--terracotta)" }}
              />
            </div>
          </div>
        </div>

        {/* Module + lesson list */}
        <div className="flex-1 overflow-y-auto p-3">
          {course.modules.map((mod, modIdx) => (
            <div key={mod.id} className="mb-4">
              {/* Module header */}
              <div className="px-2 py-1.5 mb-1">
                <div
                  className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground"
                >
                  Module {modIdx + 1}
                </div>
                <div className="text-[13px] font-medium mt-0.5">{mod.title}</div>
              </div>

              {/* Lessons */}
              {mod.lessons.map((l, lIdx) => {
                const active = l.slug === lessonSlug;
                const done = completedIds.has(l.id);
                return (
                  <Link
                    key={l.id}
                    href={`/courses/${slug}/${l.slug}`}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-md mb-0.5 transition-colors"
                    style={{
                      background: active ? "var(--terracotta-tint)" : "transparent",
                      color: active ? "var(--terracotta-deep)" : "var(--ink-2)",
                    }}
                  >
                    {/* Status dot */}
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-none text-white text-[9px]"
                      style={{
                        background: done
                          ? "var(--ok)"
                          : active
                          ? "var(--terracotta)"
                          : "transparent",
                        border: done || active ? "none" : "1px solid var(--border)",
                      }}
                    >
                      {done && <Check size={8} strokeWidth={3} />}
                    </div>
                    <span
                      className="text-[11px] flex-none font-medium"
                      style={{ fontFamily: "var(--font-mono)", color: "inherit", opacity: 0.7 }}
                    >
                      {modIdx + 1}.{lIdx + 1}
                    </span>
                    <span className="text-[13px] leading-snug">{l.title}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Center: lesson content ──────────────────────────── */}
      <div className="overflow-y-auto">
        <div className="px-14 py-9 max-w-[720px]">
          {/* Label */}
          <div className="flex items-center gap-3 mb-4">
            <p
              className="text-[11px] font-medium tracking-widest uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}
            >
              Lesson {lessonIndex + 1} of {allLessons.length}
            </p>
            {readMinutes && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock size={11} />
                {readMinutes} min read
              </span>
            )}
            {isCompleted && (
              <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: "var(--ok)" }}>
                <CheckCircle2 size={11} />
                Completed
              </span>
            )}
          </div>

          {/* Lesson title */}
          <h1
            className="text-[40px] font-normal leading-[1.05] mb-4"
            style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.025em" }}
          >
            {lesson.title}
          </h1>

          {/* Lesson content — rendered from Markdown */}
          {lesson.content ? (
            <div className="prose">
              <MDXRemote source={lesson.content} />
            </div>
          ) : (
            <p className="text-muted-foreground">No content for this lesson yet.</p>
          )}

          {/* ── Bottom navigation ───────────────────────────── */}
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-border">
            {prevLesson ? (
              <Link
                href={`/courses/${slug}/${prevLesson.slug}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={14} />
                {prevLesson.title}
              </Link>
            ) : (
              <div />
            )}

            {isCompleted ? (
              nextLesson ? (
                <Link
                  href={`/courses/${slug}/${nextLesson.slug}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ background: "var(--terracotta)" }}
                >
                  Next lesson
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <Link
                  href={`/courses/${slug}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ background: "var(--ok)" }}
                >
                  <CheckCircle2 size={14} />
                  Course complete!
                </Link>
              )
            ) : (
              <form action={markComplete}>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer transition-colors"
                  style={{ background: "var(--terracotta)" }}
                >
                  {nextLesson ? (
                    <>
                      Mark complete & next
                      <ArrowRight size={14} />
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Mark complete
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Right: AI Tutor panel ───────────────────────────── */}
      <aside className="flex flex-col border-l border-border overflow-hidden">
        <AIChatPanel
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          lessonContent={lesson.content.slice(0, 2000)}
          courseTitle={course.title}
        />
      </aside>
    </div>
  );
}
