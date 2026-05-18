import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { BookOpen } from "lucide-react";

export const metadata = { title: "Approvals — Admin — Edapt" };

export default async function AdminApprovalsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  // Show all courses — grouped by status for moderation
  const [draftCourses, publishedCourses, archivedCourses] = await Promise.all([
    prisma.course.findMany({
      where: { status: "DRAFT" },
      include: {
        creator: { select: { name: true, email: true } },
        _count: { select: { enrollments: true, modules: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      include: {
        creator: { select: { name: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.course.findMany({
      where: { status: "ARCHIVED" },
      include: { creator: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  async function setCourseStatus(formData: FormData) {
    "use server";
    const s = await auth();
    if (!s || s.user.role !== "ADMIN") return;

    const courseId = formData.get("courseId") as string;
    const status = formData.get("status") as "PUBLISHED" | "ARCHIVED" | "DRAFT";
    if (!courseId || !status) return;

    await prisma.course.update({ where: { id: courseId }, data: { status } });
    revalidatePath("/admin/approvals");
    revalidatePath("/courses");
    revalidatePath("/admin");
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1
        className="text-3xl font-normal mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Course approvals
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Review submitted courses and manage their visibility.
      </p>

      {/* ── Pending (DRAFT) ───────────────────────────────── */}
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.07em] text-muted-foreground mb-3"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Pending review — {draftCourses.length}
      </h2>

      {draftCourses.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground text-sm mb-8">
          No courses awaiting review. ✓
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-8">
          {draftCourses.map((course) => (
            <div
              key={course.id}
              className="border border-border rounded-xl p-5"
              style={{ background: "var(--surface-2)" }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="text-[14.5px] font-medium">{course.title}</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">
                    by {course.creator.name} · {course.creator.email}
                  </div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full border border-amber-300 text-amber-700 bg-amber-50 flex-none">
                  Draft
                </span>
              </div>

              <p className="text-[13px] text-muted-foreground mb-4 line-clamp-2">
                {course.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex gap-3 text-[12px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen size={11} />
                    {course._count.modules} module{course._count.modules !== 1 ? "s" : ""}
                  </span>
                  <span>{course.difficulty.toLowerCase()}</span>
                </div>

                <div className="flex gap-2">
                  <form action={setCourseStatus}>
                    <input type="hidden" name="courseId" value={course.id} />
                    <input type="hidden" name="status" value="ARCHIVED" />
                    <button
                      type="submit"
                      className="text-[12px] px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Archive
                    </button>
                  </form>
                  <form action={setCourseStatus}>
                    <input type="hidden" name="courseId" value={course.id} />
                    <input type="hidden" name="status" value="PUBLISHED" />
                    <button
                      type="submit"
                      className="text-[12px] px-3 py-1.5 rounded-lg text-white font-medium"
                      style={{ background: "var(--ok)" }}
                    >
                      ✓ Approve & publish
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Published ────────────────────────────────────── */}
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.07em] text-muted-foreground mb-3"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Published — {publishedCourses.length}
      </h2>
      <div className="flex flex-col gap-2 mb-8">
        {publishedCourses.map((course) => (
          <div
            key={course.id}
            className="flex items-center justify-between px-5 py-3.5 border border-border rounded-xl"
          >
            <div>
              <div className="text-[13.5px] font-medium">{course.title}</div>
              <div className="text-[11.5px] text-muted-foreground">
                by {course.creator.name} · {course._count.enrollments} enrolled
              </div>
            </div>
            <form action={setCourseStatus} className="flex gap-2">
              <input type="hidden" name="courseId" value={course.id} />
              <button
                type="submit"
                name="status"
                value="DRAFT"
                className="text-[11.5px] px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                Unpublish
              </button>
              <button
                type="submit"
                name="status"
                value="ARCHIVED"
                className="text-[11.5px] px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              >
                Archive
              </button>
            </form>
          </div>
        ))}
      </div>

      {/* ── Archived ─────────────────────────────────────── */}
      {archivedCourses.length > 0 && (
        <>
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.07em] text-muted-foreground mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Archived — {archivedCourses.length}
          </h2>
          <div className="flex flex-col gap-2">
            {archivedCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between px-5 py-3.5 border border-border rounded-xl opacity-60"
              >
                <div>
                  <div className="text-[13.5px] font-medium">{course.title}</div>
                  <div className="text-[11.5px] text-muted-foreground">
                    by {course.creator.name}
                  </div>
                </div>
                <form action={setCourseStatus}>
                  <input type="hidden" name="courseId" value={course.id} />
                  <button
                    type="submit"
                    name="status"
                    value="DRAFT"
                    className="text-[11.5px] px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Restore to draft
                  </button>
                </form>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
