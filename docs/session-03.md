# Session 03 — Authentication

**Status:** ✅ Complete

---

## What we built

Full authentication system — login with email/password, Google OAuth, registration, and route protection.

---

## Files created

| File | What it does |
|---|---|
| `src/types/next-auth.d.ts` | Extends NextAuth types to include `id` and `role` on `session.user` |
| `src/lib/auth.config.ts` | Thin auth config (no Prisma) — safe for Edge middleware |
| `src/lib/auth.ts` | Full auth config with Prisma adapter and Credentials authorize logic |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth route handler — handles all /api/auth/* requests |
| `src/app/api/auth/register/route.ts` | Custom registration endpoint |
| `src/proxy.ts` | Route protection middleware (renamed from middleware.ts in Next.js 16) |
| `src/store/uiSlice.ts` | Redux: sidebar + modal state |
| `src/store/quizSlice.ts` | Redux: active quiz state (question index, answers, timer) |
| `src/store/chatSlice.ts` | Redux: AI chat panel open/closed state |
| `src/store/index.ts` | Redux store combining all slices |
| `src/components/providers.tsx` | Wraps the whole app with Redux + TanStack Query providers |
| `src/app/(auth)/layout.tsx` | Centered layout for login/register pages |
| `src/app/(auth)/login/page.tsx` | Login page — email/password + Google |
| `src/app/(auth)/register/page.tsx` | Register page — creates account then auto-signs in |

---

## Key concepts explained

### Why two auth config files?

The middleware runs on **Edge runtime** — a lightweight environment used by CDNs. Prisma (our database tool) can't run there because it needs Node.js. So we split auth into two layers:

```
auth.config.ts  ← only JWT logic, no Prisma → used by middleware (Edge safe)
auth.ts         ← adds Prisma adapter → used in API routes and server pages
```

### How login works (step by step)

1. User types email + password on `/login`
2. `signIn("credentials", { email, password })` is called
3. NextAuth calls our `authorize()` function in `auth.ts`
4. `authorize()` finds the user in the database, checks the password with bcrypt
5. If valid, it returns the user object
6. NextAuth creates a **JWT token** with `id` and `role` baked in
7. On every request, the `jwt` callback puts `id` and `role` into the token
8. The `session` callback puts them on `session.user` so pages can read them

### How route protection works

```
Request → proxy.ts → checks JWT token → 
  ✅ logged in → pass through
  ❌ not logged in → redirect to /login
  ❌ wrong role → redirect to /dashboard
```

### What bcrypt does

Plain passwords should NEVER be stored. bcrypt turns `"password123"` into something like `"$2a$12$Kg8..."` — a scrambled hash that can be verified but never reversed.

```ts
// When registering
const hashedPassword = await bcrypt.hash(password, 12);

// When logging in
const isValid = await bcrypt.compare(password, user.hashedPassword);
```

### Redux slices

| Slice | Stores |
|---|---|
| `uiSlice` | sidebarOpen, activeModal |
| `quizSlice` | currentQuestion, answers, timeRemaining, isSubmitting |
| `chatSlice` | isOpen, activeSessionId, lessonContext |

### Prisma v5 vs v7

We downgraded from Prisma v7 (automatically installed) to v5 because:
- Prisma v7 requires a "Driver Adapter" and has breaking API changes
- v5 is the stable, widely-supported version
- All documentation and packages (like `@auth/prisma-adapter`) target v5

---

## What to add to .env.local (when testing)

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."        # same as DATABASE_URL for Neon
AUTH_SECRET="run: npx auth secret"   # generates a random secret
AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."               # from Google Cloud Console
GOOGLE_CLIENT_SECRET="..."
```

To generate AUTH_SECRET:
```bash
npx auth secret
```

---

## Next session

**Session 04 — Landing Page UI**
We'll build the public-facing marketing page that visitors see before they log in. Uses the design tokens we set up in Session 1.
