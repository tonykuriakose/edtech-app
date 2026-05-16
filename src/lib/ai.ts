import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY ?? "",
});

export const geminiFlash = google("gemini-2.0-flash");
export const geminiPro = google("gemini-1.5-pro");
