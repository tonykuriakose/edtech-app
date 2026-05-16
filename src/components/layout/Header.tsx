"use client";

import { signOut } from "next-auth/react";
import { Search, LogOut } from "lucide-react";

type User = {
  name?: string | null;
  role: "STUDENT" | "TEACHER" | "ADMIN";
};

export default function Header({ user }: { user: User }) {
  return (
    <header
      className="h-14 flex-none border-b border-border flex items-center px-7 gap-4"
      style={{ background: "var(--surface)" }}
    >
      {/* Search bar */}
      <div
        className="flex items-center gap-2 flex-1 max-w-[380px] px-[10px] py-1.5 rounded-md border border-border text-[13px] text-muted-foreground cursor-text"
        style={{ background: "var(--background)" }}
      >
        <Search size={13} className="flex-none" />
        <span>Search lessons, courses, topics…</span>
        <kbd
          className="ml-auto text-[10.5px] border border-border px-[5px] py-px rounded font-mono text-muted-foreground"
          style={{ background: "var(--surface)", fontFamily: "var(--font-mono)" }}
        >
          ⌘K
        </kbd>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-4 text-muted-foreground">
        <span className="text-sm hidden sm:block">{user.name}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="hover:text-foreground transition-colors flex items-center gap-1.5 text-sm"
          title="Sign out"
        >
          <LogOut size={16} strokeWidth={1.6} />
        </button>
      </div>
    </header>
  );
}
