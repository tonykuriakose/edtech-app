# Session 02 — Database Schema with Prisma

**Status:** ✅ Complete

---

## What we did

Designed and validated the full database schema for Edapt — every table the app will ever need.

---

## What is Prisma?

Prisma is an **ORM (Object Relational Mapper)**. Instead of writing raw SQL like:
```sql
SELECT * FROM users WHERE email = 'lena@example.com';
```
You write TypeScript like:
```ts
await prisma.user.findUnique({ where: { email: 'lena@example.com' } });
```
Prisma translates your TypeScript into SQL and gives you full type safety.

---

## Files created / changed

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Defines all database tables and relationships |
| `prisma/seed.ts` | Populates the DB with starter data |
| `prisma.config.ts` | Database connection URLs (Prisma v7 style) |
| `src/lib/prisma.ts` | Singleton PrismaClient — one connection shared across the app |

---

## Database tables overview

### Users & Auth
| Table | What it stores |
|---|---|
| `User` | Every person — student, teacher, or admin |
| `Account` | OAuth connections (e.g. Google login) |
| `Session` | Active login sessions |
| `VerificationToken` | Email verification tokens |

### Courses
| Table | What it stores |
|---|---|
| `Category` | Course categories (Web Dev, Data Science…) |
| `Course` | A course with title, description, difficulty |
| `Module` | A chapter inside a course (e.g. "Getting Started") |
| `Lesson` | A single study page inside a module |

### Quizzes
| Table | What it stores |
|---|---|
| `Quiz` | A quiz attached to a lesson |
| `Question` | One MCQ — options stored as JSON |
| `QuizAttempt` | A student's quiz session |
| `Answer` | The student's choice for each question |

### Progress & AI
| Table | What it stores |
|---|---|
| `Enrollment` | Links a student to a course with their progress % |
| `LessonProgress` | Tracks completion + time spent per lesson |
| `LearningProfile` | Student's weak/strong topics — used for adaptive difficulty |
| `ChatSession` | An AI tutor conversation |
| `ChatMessage` | Individual messages in a chat |
| `Notification` | In-app alerts |

---

## Key concepts explained

### Enums
Fixed lists of allowed values. Example:
```prisma
enum Role {
  STUDENT
  TEACHER
  ADMIN
}
```
This means a user's role can ONLY be one of those three — no typos possible.

### Relations
How tables link to each other:
```prisma
// A Course belongs to one User (the creator)
creatorId String
creator   User @relation(fields: [creatorId], references: [id])
```
`creatorId` is the foreign key (like a reference number), and `creator` is how you access the full User object.

### Cascade delete
```prisma
module Course @relation(..., onDelete: Cascade)
```
If a course is deleted, all its modules are automatically deleted too. Same for lessons, quizzes, etc.

### Why `options` is JSON?
```prisma
options Json  // [{ text: "...", isCorrect: true }, ...]
```
Each question has 4 options. Instead of making a whole separate `Option` table, we store them as a JSON array — simpler and works great with AI-generated questions.

---

## Prisma v7 changes (important!)

Prisma 7 moved the database URL out of `schema.prisma` into `prisma.config.ts`:

```ts
// prisma.config.ts
export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
```

The schema.prisma datasource now only needs the `provider`:
```prisma
datasource db {
  provider = "postgresql"
}
```

---

## How to run migrations (when you have a database)

```bash
# 1. Copy .env.example → .env.local and fill in DATABASE_URL
# 2. Run the migration
npm run db:migrate

# 3. Seed starter data
npm run db:seed

# 4. View data in a visual UI
npm run db:studio
```

---

## Seed accounts (after running db:seed)

| Email | Password | Role |
|---|---|---|
| admin@cognify.dev | password123 | Admin |
| teacher@cognify.dev | password123 | Teacher |
| student@cognify.dev | password123 | Student |

---

## Next session

**Session 03 — Authentication**
We'll build the login and register pages, connect NextAuth.js, add Google OAuth, and protect routes with middleware.
