import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Categories ────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "web-development" },
      update: {},
      create: { name: "Web Development", slug: "web-development" },
    }),
    prisma.category.upsert({
      where: { slug: "data-science" },
      update: {},
      create: { name: "Data Science", slug: "data-science" },
    }),
    prisma.category.upsert({
      where: { slug: "design" },
      update: {},
      create: { name: "Design", slug: "design" },
    }),
  ]);

  // ── Users ─────────────────────────────────────────────────
  const password = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@cognify.dev" },
    update: {},
    create: {
      email: "admin@cognify.dev",
      name: "Admin User",
      hashedPassword: password,
      role: "ADMIN",
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@cognify.dev" },
    update: {},
    create: {
      email: "teacher@cognify.dev",
      name: "Naomi Okafor",
      hashedPassword: password,
      role: "TEACHER",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@cognify.dev" },
    update: {},
    create: {
      email: "student@cognify.dev",
      name: "Lena Park",
      hashedPassword: password,
      role: "STUDENT",
      learningProfile: {
        create: {
          weakTopics: [],
          strongTopics: [],
          preferredDifficulty: "BEGINNER",
          streakDays: 12,
        },
      },
    },
  });

  // ── Course ────────────────────────────────────────────────
  const course = await prisma.course.upsert({
    where: { slug: "intro-to-react" },
    update: {},
    create: {
      title: "Introduction to React",
      slug: "intro-to-react",
      description:
        "Learn the fundamentals of React — components, state, hooks, and how to build modern UIs.",
      status: "PUBLISHED",
      difficulty: "BEGINNER",
      tags: ["react", "javascript", "frontend"],
      creatorId: teacher.id,
      categoryId: categories[0].id,
      modules: {
        create: [
          {
            title: "Getting Started",
            order: 1,
            lessons: {
              create: [
                {
                  title: "What is React?",
                  slug: "what-is-react",
                  order: 1,
                  content: `# What is React?

React is a JavaScript library for building user interfaces. It was created by Facebook in 2013 and has become one of the most popular tools for building web apps.

## Why React?

- **Component-based** — you break your UI into small, reusable pieces
- **Declarative** — you describe *what* the UI should look like, React handles the *how*
- **Fast** — React only updates the parts of the page that changed

## Your first component

\`\`\`jsx
function Hello() {
  return <h1>Hello, world!</h1>;
}
\`\`\`

That's it — a React component is just a function that returns HTML-like code (called JSX).`,
                  duration: 600,
                  quizzes: {
                    create: {
                      title: "React Basics Quiz",
                      difficulty: "BEGINNER",
                      passingScore: 70,
                      timeLimit: 300,
                      isAIGenerated: false,
                      questions: {
                        create: [
                          {
                            text: "Who created React?",
                            order: 1,
                            explanation: "React was created by Facebook (now Meta) in 2013.",
                            options: [
                              { text: "Google", isCorrect: false },
                              { text: "Facebook", isCorrect: true },
                              { text: "Microsoft", isCorrect: false },
                              { text: "Twitter", isCorrect: false },
                            ],
                          },
                          {
                            text: "What does a React component return?",
                            order: 2,
                            explanation: "A React component is a function that returns JSX — HTML-like syntax.",
                            options: [
                              { text: "A CSS file", isCorrect: false },
                              { text: "A database query", isCorrect: false },
                              { text: "JSX (HTML-like code)", isCorrect: true },
                              { text: "A plain string", isCorrect: false },
                            ],
                          },
                          {
                            text: "React is best described as a:",
                            order: 3,
                            explanation: "React is a library — not a full framework. It focuses only on the UI layer.",
                            options: [
                              { text: "Full-stack framework", isCorrect: false },
                              { text: "Database tool", isCorrect: false },
                              { text: "UI library", isCorrect: true },
                              { text: "CSS framework", isCorrect: false },
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
                {
                  title: "Components & Props",
                  slug: "components-and-props",
                  order: 2,
                  content: `# Components & Props

Components are the building blocks of React. Props are how you pass data *into* a component — like arguments to a function.

## Example

\`\`\`jsx
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Usage
<Greeting name="Lena" />
\`\`\`

Props flow **down** — from parent to child. You can pass any value: strings, numbers, arrays, even functions.`,
                  duration: 480,
                },
              ],
            },
          },
          {
            title: "State & Hooks",
            order: 2,
            lessons: {
              create: [
                {
                  title: "useState Hook",
                  slug: "use-state-hook",
                  order: 1,
                  content: `# The useState Hook

State is data that can change over time. When state changes, React re-renders your component automatically.

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
\`\`\`

- \`useState(0)\` — initial value is 0
- \`count\` — the current value
- \`setCount\` — the function to update it`,
                  duration: 540,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // ── Enrollment ────────────────────────────────────────────
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
    update: {},
    create: {
      userId: student.id,
      courseId: course.id,
      status: "ACTIVE",
      progress: 33,
    },
  });

  console.log("✅ Seed complete!");
  console.log("   Admin:   admin@cognify.dev / password123");
  console.log("   Teacher: teacher@cognify.dev / password123");
  console.log("   Student: student@cognify.dev / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
