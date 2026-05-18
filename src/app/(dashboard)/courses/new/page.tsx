import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "New Course — Edapt" };

export default async function NewCoursePage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/dashboard");

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  async function createCourse(formData: FormData) {
    "use server";
    const s = await auth();
    if (!s || s.user.role === "STUDENT") return;

    const title = (formData.get("title") as string).trim();
    const description = (formData.get("description") as string).trim();
    const difficulty = formData.get("difficulty") as string;
    const categoryId = (formData.get("categoryId") as string) || null;

    if (!title || !description) return;

    // Generate a URL-safe slug from the title + timestamp for uniqueness
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = `${base}-${Date.now()}`;

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        difficulty: difficulty as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
        categoryId,
        creatorId: s.user.id,
        status: "DRAFT",
        tags: [],
      },
    });

    redirect(`/teach/courses/${course.id}/edit`);
  }

  return (
    <div className="p-8 max-w-xl">
      <Link
        href="/teach"
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft size={14} />
        Teaching home
      </Link>

      <h1
        className="text-3xl font-normal mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        New course
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Fill in the basics — you can add modules and lessons on the next screen.
      </p>

      <form action={createCourse} className="flex flex-col gap-5">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium">Course title</label>
          <input
            name="title"
            required
            placeholder="e.g. Introduction to React"
            className="px-3.5 py-2.5 border border-border rounded-xl text-[14px] bg-transparent outline-none focus:ring-1 placeholder:text-muted-foreground"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium">Description</label>
          <textarea
            name="description"
            required
            rows={3}
            placeholder="What will students learn in this course?"
            className="px-3.5 py-2.5 border border-border rounded-xl text-[14px] bg-transparent outline-none focus:ring-1 placeholder:text-muted-foreground resize-none"
          />
        </div>

        {/* Difficulty + Category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium">Difficulty</label>
            <select
              name="difficulty"
              defaultValue="BEGINNER"
              className="px-3.5 py-2.5 border border-border rounded-xl text-[14px] bg-transparent outline-none focus:ring-1"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium">Category</label>
            <select
              name="categoryId"
              className="px-3.5 py-2.5 border border-border rounded-xl text-[14px] bg-transparent outline-none focus:ring-1"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="mt-2 px-5 py-3 rounded-xl text-[14px] font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--terracotta)" }}
        >
          Create course →
        </button>
      </form>
    </div>
  );
}
