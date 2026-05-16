import { z } from "zod";

export const CreateCourseSchema = z.object({
  title: z.string().min(3, "Title needs at least 3 characters").max(100),
  description: z.string().min(10, "Description needs at least 10 characters").max(1000),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  category: z.string().min(1, "Category is required"),
});

export const SubmitQuizSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedOption: z.number().int().min(0).max(3),
      })
    )
    .min(1, "At least one answer is required"),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name needs at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password needs at least 6 characters"),
});
