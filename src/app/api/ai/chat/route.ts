import { streamText } from "ai";
import { auth } from "@/lib/auth";
import { geminiFlash } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { messages, lessonTitle, lessonContent } = await req.json();

  const result = streamText({
    model: geminiFlash,
    system: `You are a helpful AI tutor for Edapt, an online learning platform.

The student is currently studying this lesson: "${lessonTitle}"

Lesson content (for context):
${lessonContent ?? ""}

Your role:
- Answer questions clearly and concisely — this student is learning, not an expert
- When relevant, reference specific concepts from the lesson above
- Use bullet points or short paragraphs — avoid walls of text
- If asked about something outside this lesson, give a brief helpful answer and gently link it back to the lesson
- Be encouraging but honest`,
    messages,
  });

  return result.toTextStreamResponse();
}
