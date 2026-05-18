import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ChevronLeft, BookOpen, Plus } from "lucide-react";
import GenerateQuizButton from "@/components/quiz/GenerateQuizButton";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: course ? `Edit: ${course.title} — Edapt` : "Edit — Edapt" };
}

export default async function EditCoursePage({ params }: Props) {
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
            include: { quizzes: { select: { id: true, title: true, isAIGenerated: true } } },
          },
        },
      },
      category: { select: { name: true } },
    },
  });

  if (!course) notFound();
  if (session.user.role === "TEACHER" && course.creatorId !== session.user.id) {
    redirect("/teach");
  }

  /* ── Server Actions ──────────────────────────────────────── */

  async function addModule(formData: FormData) {
    "use server";
    const s = await auth();
    if (!s || s.user.role === "STUDENT") return;
    const title = (formData.get("moduleTitle") as string).trim();
    if (!title) return;

    const lastModule = await prisma.module.findFirst({
      where: { courseId: id },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    await prisma.module.create({
      data: { title, courseId: id, order: (lastModule?.order ?? 0) + 1 },
    });
    revalidatePath(`/teach/courses/${id}/edit`);
  }

  async function addLesson(formData: FormData) {
    "use server";
    const s = await auth();
    if (!s || s.user.role === "STUDENT") return;

    const moduleId = formData.get("moduleId") as string;
    const title = (formData.get("lessonTitle") as string).trim();
    const content = (formData.get("lessonContent") as string).trim();
    if (!moduleId || !title) return;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    await prisma.lesson.create({
      data: {
        title,
        slug: `${slug}-${Date.now()}`,
        content: content || `# ${title}\n\nLesson content goes here.`,
        moduleId,
        order: (lastLesson?.order ?? 0) + 1,
      },
    });
    revalidatePath(`/teach/courses/${id}/edit`);
  }

  async function togglePublish() {
    "use server";
    const s = await auth();
    if (!s || s.user.role === "STUDENT") return;
    const current = await prisma.course.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!current) return;
    const next = current.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await prisma.course.update({ where: { id }, data: { status: next } });
    revalidatePath(`/teach/courses/${id}/edit`);
    revalidatePath("/teach");
    revalidatePath("/courses");
  }

  /* ── Render ──────────────────────────────────────────────── */
  const isPublished = course.status === "PUBLISHED";

  return (
    <div className="p-8 max-w-3xl">
      {/* Back */}
      <Link
        href="/teach"
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft size={14} />
        Teaching home
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1
            className="text-2xl font-normal"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {course.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {course.category?.name ?? "No category"} ·{" "}
            {course.difficulty.charAt(0) + course.difficulty.slice(1).toLowerCase()}
          </p>
        </div>

        {/* Publish toggle */}
        <form action={togglePublish}>
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
              isPublished
                ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {isPublished ? "✓ Published" : "Publish course"}
          </button>
        </form>
      </div>

      {/* Links row */}
      <div className="flex gap-3 mb-8">
        <Link
          href={`/teach/courses/${id}`}
          className="text-[12.5px] text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Manage (quiz generator)
        </Link>
        <span className="text-muted-foreground/40">·</span>
        <Link
          href={`/teach/courses/${id}/analytics`}
          className="text-[12.5px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Analytics →
        </Link>
      </div>

      {/* ── Modules ─────────────────────────────────────────── */}
      {course.modules.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground text-sm mb-6">
          No modules yet. Add your first module below.
        </div>
      ) : (
        <div className="flex flex-col gap-6 mb-8">
          {course.modules.map((mod) => (
            <div key={mod.id}>
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.07em] text-muted-foreground mb-2">
                Module {mod.order} · {mod.title}
              </h2>

              {/* Lesson list */}
              {mod.lessons.length > 0 && (
                <div className="flex flex-col gap-1.5 mb-3">
                  {mod.lessons.map((lesson) => {
                    const quiz = lesson.quizzes[0];
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 px-4 py-3 border border-border rounded-xl"
                        style={{ background: "var(--surface-2)" }}
                      >
                        <BookOpen size={13} className="flex-none text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <span className="text-[13.5px] font-medium">{lesson.title}</span>
                          {quiz ? (
                            <span className="ml-2 text-[11px] px-1.5 rounded font-medium bg-violet-100 text-violet-700">
                              {quiz.isAIGenerated ? "AI quiz" : "Quiz"}
                            </span>
                          ) : (
                            <span className="ml-2 text-[11px] text-muted-foreground">no quiz</span>
                          )}
                        </div>
                        {!quiz && <GenerateQuizButton lessonId={lesson.id} />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add lesson form */}
              <details className="group">
                <summary className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors list-none">
                  <Plus size={13} />
                  Add lesson to this module
                </summary>
                <form action={addLesson} className="mt-3 flex flex-col gap-3 pl-5 border-l-2 border-border">
                  <input type="hidden" name="moduleId" value={mod.id} />
                  <input
                    name="lessonTitle"
                    required
                    placeholder="Lesson title"
                    className="px-3.5 py-2 border border-border rounded-lg text-[13.5px] bg-transparent outline-none focus:ring-1 placeholder:text-muted-foreground"
                  />
                  <textarea
                    name="lessonContent"
                    rows={4}
                    placeholder="Lesson content (Markdown). Leave blank for a placeholder."
                    className="px-3.5 py-2 border border-border rounded-lg text-[13px] bg-transparent outline-none focus:ring-1 placeholder:text-muted-foreground resize-none font-mono"
                  />
                  <button
                    type="submit"
                    className="self-start px-4 py-2 rounded-lg text-[13px] font-medium text-white"
                    style={{ background: "var(--terracotta)" }}
                  >
                    Add lesson
                  </button>
                </form>
              </details>
            </div>
          ))}
        </div>
      )}

      {/* ── Add module form ──────────────────────────────────── */}
      <div
        className="border border-border rounded-xl p-5"
        style={{ background: "var(--surface-2)" }}
      >
        <h3 className="text-[13.5px] font-semibold mb-3">Add a module</h3>
        <form action={addModule} className="flex gap-3">
          <input
            name="moduleTitle"
            required
            placeholder="Module title, e.g. Getting Started"
            className="flex-1 px-3.5 py-2 border border-border rounded-lg text-[13.5px] bg-transparent outline-none focus:ring-1 placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="flex-none px-4 py-2 rounded-lg text-[13px] font-medium text-white"
            style={{ background: "var(--ink)" }}
          >
            Add module
          </button>
        </form>
      </div>
    </div>
  );
}
