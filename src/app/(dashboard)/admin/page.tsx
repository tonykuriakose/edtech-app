import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, BookOpen, GraduationCap, BarChart2 } from "lucide-react";

export const metadata = { title: "Admin — Cognify" };

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [userCount, courseCount, enrollmentCount, attemptCount, draftCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.enrollment.count(),
      prisma.quizAttempt.count({ where: { status: "COMPLETED" } }),
      prisma.course.count({ where: { status: "DRAFT" } }),
    ]);

  const cards = [
    { label: "Total users", value: userCount, icon: <Users size={16} />, href: "/admin/users" },
    { label: "Published courses", value: courseCount, icon: <BookOpen size={16} />, href: "/admin/approvals" },
    { label: "Enrollments", value: enrollmentCount, icon: <GraduationCap size={16} />, href: "/admin/stats" },
    { label: "Quiz attempts", value: attemptCount, icon: <BarChart2 size={16} />, href: "/admin/stats" },
  ];

  return (
    <div className="p-8 max-w-3xl">
      <h1
        className="text-3xl font-normal mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Admin overview
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Platform-wide at a glance.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-10">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="border border-border rounded-xl p-5 hover:bg-black/2 transition-colors"
            style={{ background: "var(--surface-2)" }}
          >
            <div className="text-muted-foreground mb-3">{c.icon}</div>
            <div
              className="text-3xl font-semibold"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {c.value}
            </div>
            <div className="text-[12px] text-muted-foreground mt-1">
              {c.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="text-[14px] font-semibold mb-3">Quick actions</h2>
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/approvals"
          className="flex items-center justify-between px-5 py-4 border border-border rounded-xl hover:bg-black/2 transition-colors"
        >
          <div>
            <div className="text-[14px] font-medium">Course approvals</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">
              {draftCount} course{draftCount !== 1 ? "s" : ""} awaiting review
            </div>
          </div>
          <span
            className={`text-[11.5px] px-2.5 py-1 rounded-full font-medium ${
              draftCount > 0
                ? "bg-amber-100 text-amber-700"
                : "text-muted-foreground border border-border"
            }`}
          >
            {draftCount > 0 ? `${draftCount} pending` : "All clear"}
          </span>
        </Link>

        <Link
          href="/admin/users"
          className="flex items-center justify-between px-5 py-4 border border-border rounded-xl hover:bg-black/2 transition-colors"
        >
          <div>
            <div className="text-[14px] font-medium">Manage users</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">
              View all accounts and change roles
            </div>
          </div>
          <span className="text-[11.5px] text-muted-foreground">
            {userCount} users →
          </span>
        </Link>

        <Link
          href="/admin/stats"
          className="flex items-center justify-between px-5 py-4 border border-border rounded-xl hover:bg-black/2 transition-colors"
        >
          <div>
            <div className="text-[14px] font-medium">Platform stats</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">
              Detailed breakdowns across users, courses, and quizzes
            </div>
          </div>
          <span className="text-[11.5px] text-muted-foreground">→</span>
        </Link>
      </div>
    </div>
  );
}
