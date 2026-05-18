import { generateObject } from "ai";
import { z } from "zod";
import { NextRequest } from "next/server";
import { geminiFlash } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const QuizSchema = z.object({
  title: z.string().describe("A concise quiz title, e.g. 'React Hooks Quiz'"),
  questions: z
    .array(
      z.object({
        text: z.string().describe("The question text"),
        explanation: z
          .string()
          .describe("Why the correct answer is right — shown after submission"),
        options: z
          .array(
            z.object({
              text: z.string(),
              isCorrect: z.boolean(),
            })
          )
          .length(4)
          .describe("Exactly 4 options, exactly 1 must have isCorrect: true"),
      })
    )
    .min(4)
    .max(6),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !["TEACHER", "ADMIN"].includes(session.user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const lessonId: string = body.lessonId;
  if (!lessonId) {
    return Response.json({ error: "lessonId is required" }, { status: 400 });
  }

  // Fetch lesson with course ownership info
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: { select: { creatorId: true, title: true, slug: true } },
        },
      },
      quizzes: { select: { id: true } },
    },
  });

  if (!lesson) {
    return Response.json({ error: "Lesson not found" }, { status: 404 });
  }

  // Teachers can only generate quizzes for their own courses
  if (
    session.user.role === "TEACHER" &&
    lesson.module.course.creatorId !== session.user.id
  ) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Prevent duplicate quiz generation
  if (lesson.quizzes.length > 0) {
    return Response.json(
      { error: "This lesson already has a quiz" },
      { status: 409 }
    );
  }

  // Call Gemini with a structured schema — no JSON parsing needed
  const contentPreview = lesson.content.slice(0, 3500);

  const { object } = await generateObject({
    model: geminiFlash,
    schema: QuizSchema,
    prompt: `You are an expert educator creating a quiz for an online learning platform called Edapt.

Course: "${lesson.module.course.title}"
Lesson: "${lesson.title}"

Lesson content:
${contentPreview}

Create a multiple-choice quiz with 5 questions that test understanding of the key concepts in this lesson.

Requirements for each question:
- Ask about something specifically covered in the lesson content above
- Provide exactly 4 answer options
- Mark exactly 1 option as isCorrect: true
- Write a clear explanation of why the correct answer is right (2-3 sentences)
- Make incorrect options plausible but clearly wrong to someone who understood the lesson

The quiz title should follow the pattern: "[Topic] Quiz"`,
  });

  // Save the generated quiz + questions to the database
  const quiz = await prisma.quiz.create({
    data: {
      title: object.title,
      lessonId: lesson.id,
      difficulty: "BEGINNER",
      passingScore: 70,
      timeLimit: 300,
      isAIGenerated: true,
      questions: {
        create: object.questions.map((q, i) => ({
          text: q.text,
          explanation: q.explanation,
          options: q.options,
          order: i + 1,
        })),
      },
    },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  return Response.json({ quiz }, { status: 201 });
}
