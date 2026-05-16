import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import QuizContainer, { type SafeQuestion } from "@/components/quiz/QuizContainer";

type Props = {
  params: Promise<{ slug: string; lessonSlug: string }>;
};

type OptionRow = { text: string; isCorrect: boolean };

export async function generateMetadata({ params }: Props) {
  const { lessonSlug } = await params;
  const lesson = await prisma.lesson.findFirst({
    where: { slug: lessonSlug },
    select: { title: true },
  });
  return { title: lesson ? `Quiz: ${lesson.title} — Cognify` : "Quiz — Cognify" };
}

export default async function QuizPage({ params }: Props) {
  const { slug, lessonSlug } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  /* ── Load lesson + quiz ─────────────────────────────────── */
  const lesson = await prisma.lesson.findFirst({
    where: { slug: lessonSlug },
    include: {
      quizzes: {
        include: {
          questions: { orderBy: { order: "asc" } },
        },
      },
      module: { select: { courseId: true } },
    },
  });

  if (!lesson) notFound();

  // No quiz for this lesson → send back to lesson
  if (lesson.quizzes.length === 0) {
    redirect(`/courses/${slug}/${lessonSlug}`);
  }

  /* ── Check enrollment ───────────────────────────────────── */
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: session.user.id,
      courseId: lesson.module.courseId,
    },
  });
  if (!enrollment) redirect(`/courses/${slug}`);

  /* ── Sanitize questions — strip isCorrect before sending ── */
  const quiz = lesson.quizzes[0];

  const safeQuestions: SafeQuestion[] = quiz.questions.map((q) => ({
    id: q.id,
    text: q.text,
    order: q.order,
    explanation: q.explanation,
    // isCorrect is intentionally removed here
    options: (q.options as OptionRow[]).map((o) => ({ text: o.text })),
  }));

  return (
    <QuizContainer
      quiz={{
        id: quiz.id,
        title: quiz.title,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        difficulty: quiz.difficulty,
      }}
      questions={safeQuestions}
      courseSlug={slug}
      lessonSlug={lessonSlug}
      lessonTitle={lesson.title}
    />
  );
}
