import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

type OptionRow = { text: string; isCorrect: boolean };

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const answers: Record<string, number> = body.answers ?? {};
  const timeTaken: number = body.timeTaken ?? 0;

  // Fetch quiz with correct answers — server-side only, never sent to client
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz) return Response.json({ error: "Quiz not found" }, { status: 404 });

  // Grade each question
  let correct = 0;
  const gradedQuestions = quiz.questions.map((q) => {
    const options = q.options as OptionRow[];
    const correctIndex = options.findIndex((o) => o.isCorrect);
    const yourAnswer = answers[q.id] ?? -1;
    const isCorrect = yourAnswer === correctIndex;
    if (isCorrect) correct++;

    return {
      id: q.id,
      text: q.text,
      explanation: q.explanation,
      yourAnswer,
      correctAnswer: correctIndex,
      isCorrect,
      // Safe to send: isCorrect revealed only after submission
      options: options.map((o) => ({ text: o.text })),
    };
  });

  const total = quiz.questions.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = score >= quiz.passingScore;

  // Persist quiz attempt
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: session.user.id,
      quizId: quiz.id,
      status: "COMPLETED",
      score,
      timeTaken,
      completedAt: new Date(),
    },
  });

  // Persist individual answers (skip unanswered questions)
  const answerRows = gradedQuestions
    .filter((q) => q.yourAnswer >= 0)
    .map((q) => ({
      attemptId: attempt.id,
      questionId: q.id,
      selectedOption: q.yourAnswer,
      isCorrect: q.isCorrect,
    }));

  if (answerRows.length > 0) {
    await prisma.answer.createMany({ data: answerRows });
  }

  // Update LearningProfile — track weak topics (score < 70%)
  const profile = await prisma.learningProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (profile && score < 70) {
    const quizTitle = quiz.title;
    const weakTopics = profile.weakTopics as string[];
    if (!weakTopics.includes(quizTitle)) {
      await prisma.learningProfile.update({
        where: { userId: session.user.id },
        data: { weakTopics: [...weakTopics, quizTitle] },
      });
    }
  } else if (profile && score >= 85) {
    // Remove from weak topics if mastered
    const weakTopics = profile.weakTopics as string[];
    await prisma.learningProfile.update({
      where: { userId: session.user.id },
      data: { weakTopics: weakTopics.filter((t) => t !== quiz.title) },
    });
  }

  return Response.json({
    score,
    passed,
    correct,
    total,
    timeTaken,
    attemptId: attempt.id,
    passingScore: quiz.passingScore,
    questions: gradedQuestions,
  });
}
