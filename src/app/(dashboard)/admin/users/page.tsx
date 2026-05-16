import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const metadata = { title: "Users — Admin — Cognify" };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true, coursesCreated: true } },
    },
  });

  async function changeRole(formData: FormData) {
    "use server";
    const s = await auth();
    if (!s || s.user.role !== "ADMIN") return;

    const userId = formData.get("userId") as string;
    const newRole = formData.get("newRole") as "STUDENT" | "TEACHER" | "ADMIN";
    if (!userId || !newRole) return;

    // Prevent admins from demoting themselves
    if (userId === s.user.id) return;

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });
    revalidatePath("/admin/users");
  }

  const roleColor = {
    ADMIN: "bg-violet-100 text-violet-700",
    TEACHER: "bg-blue-100 text-blue-700",
    STUDENT: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1
        className="text-3xl font-normal mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Users
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        {users.length} account{users.length !== 1 ? "s" : ""} on the platform
      </p>

      <div className="border border-border rounded-xl overflow-hidden">
        {/* Table header */}
        <div
          className="grid px-5 py-3 text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground border-b border-border"
          style={{
            gridTemplateColumns: "1fr 180px 100px 80px 120px",
            background: "var(--surface-2)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>User</span>
          <span>Email</span>
          <span>Role</span>
          <span>Courses</span>
          <span>Change role</span>
        </div>

        {users.map((user, i) => {
          const isSelf = user.id === session.user.id;
          return (
            <div
              key={user.id}
              className={`grid items-center px-5 py-3.5 ${
                i < users.length - 1 ? "border-b border-border" : ""
              }`}
              style={{ gridTemplateColumns: "1fr 180px 100px 80px 120px" }}
            >
              {/* Name */}
              <div>
                <div className="text-[13.5px] font-medium">{user.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Email */}
              <div className="text-[12.5px] text-muted-foreground truncate pr-4">
                {user.email}
              </div>

              {/* Role badge */}
              <div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${roleColor[user.role]}`}
                >
                  {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                </span>
              </div>

              {/* Course count */}
              <div className="text-[13px] text-muted-foreground">
                {user.role === "TEACHER" || user.role === "ADMIN"
                  ? `${user._count.coursesCreated} created`
                  : `${user._count.enrollments} enrolled`}
              </div>

              {/* Role change */}
              {isSelf ? (
                <span className="text-[11.5px] text-muted-foreground italic">you</span>
              ) : (
                <form action={changeRole} className="flex gap-1.5">
                  <input type="hidden" name="userId" value={user.id} />
                  {user.role !== "STUDENT" && (
                    <button
                      type="submit"
                      name="newRole"
                      value="STUDENT"
                      className="text-[11px] px-2.5 py-1 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                    >
                      → Student
                    </button>
                  )}
                  {user.role !== "TEACHER" && (
                    <button
                      type="submit"
                      name="newRole"
                      value="TEACHER"
                      className="text-[11px] px-2.5 py-1 rounded-md border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      → Teacher
                    </button>
                  )}
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
