"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home, Globe, BookOpen, BarChart2, Sparkles,
  Plus, Bell, Settings, Users, Inbox,
} from "lucide-react";

type User = {
  name?: string | null;
  email?: string | null;
  role: "STUDENT" | "TEACHER" | "ADMIN";
};

type NavItem = { href: string; label: string; icon: React.ElementType };

const studentNav: NavItem[] = [
  { href: "/dashboard",   label: "Home",           icon: Home },
  { href: "/courses",     label: "Browse courses",  icon: Globe },
  { href: "/my-courses",  label: "My courses",      icon: BookOpen },
  { href: "/progress",    label: "Progress",        icon: BarChart2 },
  { href: "/ai-tutor",   label: "AI Tutor",         icon: Sparkles },
];

const teacherNav: NavItem[] = [
  { href: "/teach",          label: "Teaching home", icon: Home },
  { href: "/teach/courses",  label: "My courses",    icon: BookOpen },
  { href: "/courses/new",    label: "New course",    icon: Plus },
  { href: "/teach/analytics",label: "Analytics",     icon: BarChart2 },
  { href: "/ai-tutor",       label: "AI Tutor",      icon: Sparkles },
];

const adminNav: NavItem[] = [
  { href: "/admin",           label: "Overview",       icon: Home },
  { href: "/admin/approvals", label: "Approvals",      icon: Inbox },
  { href: "/admin/users",     label: "Users",          icon: Users },
  { href: "/admin/stats",     label: "Platform stats", icon: BarChart2 },
];

const HOME_ROUTES = new Set(["/dashboard", "/teach", "/admin"]);

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();

  const navItems =
    user.role === "TEACHER" ? teacherNav
    : user.role === "ADMIN" ? adminNav
    : studentNav;

  const sectionLabel =
    user.role === "TEACHER" ? "Teach"
    : user.role === "ADMIN" ? "Admin"
    : "Learn";

  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function isActive(href: string) {
    if (HOME_ROUTES.has(href)) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside
      className="w-[232px] flex-none flex flex-col gap-0.5 py-[18px] px-[14px] border-r border-border overflow-y-auto"
      style={{ background: "var(--surface-2)" }}
    >
      {/* Brand */}
      <Link href="/dashboard" className="flex items-center gap-[9px] px-2 pb-[18px]">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center text-white text-sm flex-none"
          style={{ background: "var(--ink)", fontFamily: "var(--font-serif)" }}
        >
          e
        </div>
        <span
          className="text-foreground"
          style={{ fontFamily: "var(--font-serif)", fontSize: 18, letterSpacing: "-0.02em" }}
        >
          Edapt
        </span>
      </Link>

      {/* Main nav */}
      <p className="text-[10.5px] font-medium tracking-[0.08em] uppercase text-muted-foreground px-2 pt-3 pb-1.5">
        {sectionLabel}
      </p>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-[10px] px-[10px] py-[7px] rounded-md text-[13.5px] transition-colors ${
              active
                ? "bg-foreground text-background"
                : "text-foreground/70 hover:bg-black/[0.04]"
            }`}
          >
            <Icon size={15} strokeWidth={1.6} className="flex-none" />
            {item.label}
          </Link>
        );
      })}

      {/* Account nav */}
      <p className="text-[10.5px] font-medium tracking-[0.08em] uppercase text-muted-foreground px-2 pt-5 pb-1.5">
        Account
      </p>
      <Link
        href="/notifications"
        className="flex items-center gap-[10px] px-[10px] py-[7px] rounded-md text-[13.5px] text-foreground/70 hover:bg-black/[0.04] transition-colors"
      >
        <Bell size={15} strokeWidth={1.6} className="flex-none" />
        Notifications
      </Link>
      <Link
        href="/settings"
        className="flex items-center gap-[10px] px-[10px] py-[7px] rounded-md text-[13.5px] text-foreground/70 hover:bg-black/[0.04] transition-colors"
      >
        <Settings size={15} strokeWidth={1.6} className="flex-none" />
        Settings
      </Link>

      {/* User card */}
      <div
        className="mt-auto flex gap-[10px] items-center p-[10px] border border-border rounded-[10px]"
        style={{ background: "var(--surface)" }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium flex-none"
          style={{ background: "var(--terracotta)" }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium truncate">{user.name ?? user.email}</div>
          <div className="text-[11.5px] text-muted-foreground capitalize">
            {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
          </div>
        </div>
      </div>
    </aside>
  );
}
