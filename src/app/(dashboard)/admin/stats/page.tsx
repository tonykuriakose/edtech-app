import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Platform Stats — Admin — Cognify" };

export default async function AdminStatsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [
    usersByRole,
    coursesByStatus,
    totalEnrollments,
    totalLessonsCompleted,
    totalAttempts,
    passedAttempts,
    avgScoreResult,
    topCourses,
  ] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
    prisma.course.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.enrollment.count(),
    prisma.lessonProgress.count({ where: { completed: true } }),
    prisma.quizAttempt.count({ where: { status: "COMPLETED" } }),
    prisma.quizAttempt.count({
      where: {
        status: "COMPLETED",
        score: { gte: 70 },
      },
    }),
    prisma.quizAttempt.aggregate({
      where: { status: "COMPLETED" },
      _avg: { score: true },
    }),
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      include: { _count: { select: { enrollments: true } } },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
    }),
  ]);

  const avgScore = avgScoreResult._avg.score
    ? Math.round(avgScoreResult._avg.score)
    : null;

  const passRate =
    totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : null;

  function roleCount(role: string) {
    return usersByRole.find((r) => r.role === role)?._count.id ?? 0;
  }
  function courseStatusCount(status: string) {
    return coursesByStatus.find((s) => s.status === status)?._count.id ?? 0;
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1
        className="text-3xl font-normal mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Platform stats
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Aggregated data across all users, courses, and quizzes.
      </p>

      {/* ── Users ─────────────────────────────────────────── */}
      <Section title="Users">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Students", value: roleCount("STUDENT") },
            { label: "Teachers", value: roleCount("TEACHER") },
            { label: "Admins", value: roleCount("ADMIN") },
          ].map((s) => (
            <StatBox key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      </Section>

      {/* ── Courses ───────────────────────────────────────── */}
      <Section title="Courses">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Published", value: courseStatusCount("PUBLISHED") },
            { label: "Draft", value: courseStatusCount("DRAFT") },
            { label: "Archived", value: courseStatusCount("ARCHIVED") },
          ].map((s) => (
            <StatBox key={s.label} label={s.label} value={s.value} />
          ))}
        </div>

        <div className="mt-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.07em] text-muted-foreground mb-2"
            style={{ fontFamily: "var(--font-mono)" }}>
            Most enrolled
          </p>
          <div className="flex flex-col gap-1.5">
            {topCourses.map((c, i) => (
              <div
                key={c.id}
                className="flex items-center justify-between px-4 py-3 border border-border rounded-lg"
                style={{ background: "var(--surface-2)" }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-[11px] font-medium w-5 text-muted-foreground"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    #{i + 1}
                  </span>
                  <span className="text-[13.5px] font-medium">{c.title}</span>
                </div>
                <span className="text-[12px] text-muted-foreground">
                  {c._count.enrollments} enrolled
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Learning ──────────────────────────────────────── */}
      <Section title="Learning activity">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatBox label="Total enrollments" value={totalEnrollments} />
          <StatBox label="Lessons completed" value={totalLessonsCompleted} />
        </div>
      </Section>

      {/* ── Quizzes ───────────────────────────────────────── */}
      <Section title="Quizzes">
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="Attempts" value={totalAttempts} />
          <StatBox
            label="Avg score"
            value={avgScore !== null ? `${avgScore}%` : "—"}
          />
          <StatBox
            label="Pass rate"
            value={passRate !== null ? `${passRate}%` : "—"}
          />
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h2
        className="text-[12px] font-semibold uppercase tracking-[0.07em] text-muted-foreground mb-3"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="border border-border rounded-xl p-4"
      style={{ background: "var(--surface-2)" }}
    >
      <div
        className="text-2xl font-semibold"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {value}
      </div>
      <div className="text-[12px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
