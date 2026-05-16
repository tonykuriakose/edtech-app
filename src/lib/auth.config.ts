import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

// Thin config — no Prisma, safe for Edge middleware
// The full auth.ts adds the Prisma adapter on top of this
export const authConfig: NextAuthConfig = {
  providers: [
    // Only enable Google OAuth if both credentials are configured
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    // Credentials provider listed here so NextAuth knows the strategy exists
    // Actual authorize() logic lives in auth.ts
    Credentials({}),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const publicRoutes = ["/", "/login", "/register"];
      if (publicRoutes.includes(pathname)) return true;

      if (!isLoggedIn) return false;

      // Role-based route protection
      if (pathname.startsWith("/teach")) {
        return auth.user.role === "TEACHER" || auth.user.role === "ADMIN";
      }
      if (pathname.startsWith("/admin")) {
        return auth.user.role === "ADMIN";
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "STUDENT" | "TEACHER" | "ADMIN";
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
};
