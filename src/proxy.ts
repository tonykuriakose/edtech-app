import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Use only the thin config (no Prisma) — safe for Edge runtime
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const publicRoutes = ["/", "/login", "/register"];
  if (publicRoutes.includes(pathname)) return;

  if (!session) {
    return Response.redirect(new URL("/login", req.url));
  }

  if (
    pathname.startsWith("/teach") &&
    session.user.role !== "TEACHER" &&
    session.user.role !== "ADMIN"
  ) {
    return Response.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/admin") && session.user.role !== "ADMIN") {
    return Response.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
