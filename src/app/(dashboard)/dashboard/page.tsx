import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Flame, Trophy, CheckCircle } from "lucide-react";
import ProgressRing from "@/components/course/ProgressRing";

export const metadata = { title: "Dashboard — Edapt" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Teachers and admins have their own homes
  if (session.user.role === "TEACHER") redirect("/teach");
  if (session.user.role === "ADMIN") redirect("/admin");

  const userId = session.user.id;

  // Fetch everything in parallel
  const [enrollments, recentAttempts, profile] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: { _count: { select: { lessons: true } } },
            },
          },
        },
        lessonProgress: { where: { completed: true }, select: { lessonId: true } },
      },
      orderBy: { enrolledAt: "desc" },
    }),
    prisma.quizAttempt.findMany({
      where: { userId, status: "COMPLETED" },
      include: { quiz: { select: { title: true } } },
      orderBy: { completedAt: "desc" },
      take: 5,
    }),
    prisma.learningProfile.findUnique({ where: { userId } }),
  ]);

  // Aggregate stats
  const totalLessonsCompleted = enrollments.reduce(
    (s, e) => s + e.lessonProgress.length,
    0
  );
  const avgScore =
    recentAttempts.length > 0
      ? Math.round(
          recentAttempts.reduce((s, a) => s + (a.score ?? 0), 0) /
            recentAttempts.length
        )
      : null;

  const weakTopics = (profile?.weakTopics as string[]) ?? [];
  const streak = profile?.streakDays ?? 0;

  return (
    <div className="p-8 max-w-4xl">
      {/* Greeting */}
      <h1
        className="text-3xl font-normal mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Welcome back, {session.user.name?.split(" ")[0]}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Here&apos;s where you left off.
      </p>

      {/* ── Stats row ──────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3 mb-10">
        <StatCard
          icon={<BookOpen size={16} />}
          label="Courses"
          value={enrollments.length}
        />
        <StatCard
          icon={<CheckCircle size={16} />}
          label="Lessons done"
          value={totalLessonsCompleted}
        />
        <StatCard
          icon={<Trophy size={16} />}
          label="Avg quiz score"
          value={avgScore !== null ? `${avgScore}%` : "—"}
        />
        <StatCard
          icon={<Flame size={16} />}
          label="Day streak"
          value={streak}
          highlight={streak >= 7}
        />
      </div>

      {/* ── Enrolled courses ───────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">Your courses</h2>
        <Link
          href="/my-courses"
          className="text-[12.5px] text-muted-foreground hover:text-foreground transition-colors"
        >
          View all →
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center text-muted-foreground text-sm mb-8">
          You haven&apos;t enrolled in any courses yet.{" "}
          <Link href="/courses" className="underline text-foreground">
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2 mb-10">
          {enrollments.slice(0, 3).map((e) => {
            const totalLessons = e.course.modules.reduce(
              (s, m) => s + m._count.lessons,
              0
            );
            const done = e.lessonProgress.length;
            return (
              <Link
                key={e.id}
                href={`/courses/${e.course.slug}`}
                className="flex items-center gap-4 p-4 border border-border rounded-xl hover:bg-black/2 transition-colors"
              >
                <ProgressRing progress={e.progress} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium truncate">
                    {e.course.title}
                  </div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">
                    {done} of {totalLessons} lessons · {Math.round(e.progress)}%
                  </div>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full border flex-none ${
                    e.progress === 100
                      ? "border-green-300 text-green-700 bg-green-50"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {e.progress === 100 ? "Complete" : "In progress"}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Bottom row ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent quiz results */}
        <div>
          <h2 className="text-base font-semibold mb-3">Recent quizzes</h2>
          {recentAttempts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No quizzes taken yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentAttempts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between px-4 py-3 border border-border rounded-xl"
                  style={{ background: "var(--surface-2)" }}
                >
                  <div className="text-[13px] truncate pr-3">
                    {a.quiz.title}
                  </div>
                  <span
                    className={`text-[12px] font-semibold px-2.5 py-0.5 rounded-full flex-none ${
                      (a.score ?? 0) >= 70
                        ? "bg-green-100 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {a.score ?? 0}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weak topics */}
        <div>
          <h2 className="text-base font-semibold mb-3">Needs review</h2>
          {weakTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No weak topics yet — keep taking quizzes!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {weakTopics.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 rounded-lg text-[12.5px] font-medium border"
                  style={{
                    background: "var(--terracotta-tint)",
                    color: "var(--terracotta-deep)",
                    borderColor: "var(--terracotta-tint)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <Link
            href="/progress"
            className="inline-block mt-4 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors"
          >
            View full progress →
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className="border border-border rounded-xl p-4 flex flex-col gap-2"
      style={{ background: "var(--surface-2)" }}
    >
      <div
        className="text-muted-foreground"
        style={highlight ? { color: "var(--terracotta)" } : {}}
      >
        {icon}
      </div>
      <div
        className="text-2xl font-semibold"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {value}
      </div>
      <div className="text-[12px] text-muted-foreground">{label}</div>
    </div>
  );
}
