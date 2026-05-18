import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navbar ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Brand />

          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <Link href="/courses" className="hover:text-foreground transition-colors">Courses</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Sign in
            </Link>
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "sm" }), "bg-primary hover:bg-terracotta-deep text-white")}
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        {/* Eyebrow pill */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8"
          style={{ background: "var(--terracotta-tint)", color: "var(--terracotta-deep)" }}
        >
          <SparkIcon />
          <span>AI-Powered Adaptive Learning</span>
        </div>

        <h1
          className="text-5xl md:text-6xl font-normal text-foreground mb-6 max-w-3xl mx-auto leading-[1.08]"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.025em" }}
        >
          Learn smarter.<br />Not harder.
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
          Cognify adapts to how you learn. AI-generated quizzes find your gaps,
          a context-aware tutor answers your questions, and every lesson moves you forward.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/register"
            className={cn(buttonVariants({ size: "lg" }), "bg-primary hover:bg-terracotta-deep text-white px-8 h-11")}
          >
            Start learning free
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-border h-11 px-8")}
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-card border border-border rounded-2xl p-8 grid grid-cols-3 divide-x divide-border">
          <Stat num="2,400+" label="Active learners" />
          <Stat num="48" label="Courses published" />
          <Stat num="87%" label="Completion rate" />
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <Eyebrow>FEATURES</Eyebrow>
        <h2
          className="text-4xl font-normal mt-3 mb-12 max-w-xl leading-tight"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
        >
          Everything you need to actually learn
        </h2>

        <div className="grid md:grid-cols-3 gap-5">
          <FeatureCard
            icon={<BoltIcon />}
            title="AI Quiz Generation"
            desc="Teachers trigger AI to generate context-aware multiple-choice questions from lesson content. No more manual quiz writing."
            accent
          />
          <FeatureCard
            icon={<ChatIcon />}
            title="Context-Aware AI Tutor"
            desc="Ask questions while you study. The tutor knows the lesson you're on and gives relevant, accurate answers in real time."
          />
          <FeatureCard
            icon={<TargetIcon />}
            title="Adaptive Difficulty"
            desc="Your quiz performance shapes what comes next. Struggling? You'll see more of it. Nailing it? The platform moves you forward."
          />
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section
        id="how"
        className="border-y border-border py-16"
        style={{ background: "var(--surface-2)" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <Eyebrow>HOW IT WORKS</Eyebrow>
          <h2
            className="text-4xl font-normal mt-3 mb-14"
            style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
          >
            Four steps to mastery
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10">
            {[
              { step: "01", title: "Enroll", desc: "Browse courses by topic or difficulty and join in one click. No commitment required." },
              { step: "02", title: "Study", desc: "Read structured lessons at your own pace. Clear explanations, real code examples." },
              { step: "03", title: "Quiz", desc: "Take AI-generated quizzes. Get instant explanations for every right and wrong answer." },
              { step: "04", title: "Adapt", desc: "Your learning profile updates after each quiz. The platform gets smarter about what you need." },
            ].map((s) => (
              <div key={s.step}>
                <div
                  className="text-xs mb-3 font-medium"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--terracotta)" }}
                >
                  {s.step}
                </div>
                <div
                  className="text-xl mb-2"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {s.title}
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role callouts ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <Eyebrow>BUILT FOR EVERYONE</Eyebrow>
        <h2
          className="text-4xl font-normal mt-3 mb-12"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
        >
          One platform, three roles
        </h2>

        <div className="grid md:grid-cols-3 gap-5">
          <RoleCard
            emoji="🎓"
            role="Students"
            desc="Enroll in courses, track your progress, quiz yourself, and get instant help from an AI tutor that knows exactly what you're studying."
          />
          <RoleCard
            emoji="✏️"
            role="Teachers"
            desc="Build courses with a guided wizard, let AI generate quiz questions from your lesson content, and see detailed analytics per student."
          />
          <RoleCard
            emoji="⚙️"
            role="Admins"
            desc="Approve courses before they go live, manage users and roles, and monitor platform-wide health from a dedicated control panel."
          />
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div
          className="rounded-2xl p-14 text-center"
          style={{ background: "var(--terracotta-tint)", border: "1px solid var(--terracotta-soft)" }}
        >
          <h2
            className="text-4xl font-normal mb-4"
            style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
          >
            Ready to start?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Create a free account and take your first lesson today. No credit card needed.
          </p>
          <Link
            href="/register"
            className={cn(buttonVariants({ size: "lg" }), "bg-primary hover:bg-terracotta-deep text-white px-10 h-11")}
          >
            Create free account
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <Brand />
          <div className="flex items-center gap-4">
            <span>Built by Tony Kuriakose</span>
            <span className="text-border">·</span>
            <a
              href="https://github.com/tonykuriakose"
              className="hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <span className="text-border">·</span>
            <a
              href="https://www.linkedin.com/in/tony-fullstackdev/"
              className="hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Reusable sub-components ──────────────────────────────── */

function Brand() {
  return (
    <div className="flex items-center gap-2.5 flex-none">
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center text-white text-sm"
        style={{ background: "var(--ink)", fontFamily: "var(--font-serif)" }}
      >
        c
      </div>
      <span
        className="text-foreground"
        style={{ fontFamily: "var(--font-serif)", fontSize: 18, letterSpacing: "-0.02em" }}
      >
        Cognify
      </span>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-medium tracking-widest uppercase"
      style={{ color: "var(--terracotta-deep)" }}
    >
      {children}
    </p>
  );
}

function Stat({ num, label }: { num: string; label: string }) {
  return (
    <div className="text-center px-6">
      <div
        className="text-4xl font-normal text-foreground"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {num}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-7 border"
      style={
        accent
          ? { background: "var(--terracotta-tint)", borderColor: "var(--terracotta-soft)" }
          : { background: "var(--card)", borderColor: "var(--border)" }
      }
    >
      <div className="mb-5" style={{ color: "var(--terracotta)" }}>
        {icon}
      </div>
      <h3
        className="text-xl font-normal mb-2"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function RoleCard({
  emoji,
  role,
  desc,
}: {
  emoji: string;
  role: string;
  desc: string;
}) {
  return (
    <div
      className="rounded-2xl p-7 border"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="text-2xl mb-4">{emoji}</div>
      <h3
        className="text-xl font-normal mb-2"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {role}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

/* ── Icons ────────────────────────────────────────────────── */

function SparkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 3L4 14h6l-1 7 9-11h-6l1-7z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
