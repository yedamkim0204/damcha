"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, BookOpen, Palette, LayoutDashboard, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/movies", label: "영화", icon: Film },
  { href: "/books", label: "책", icon: BookOpen },
  { href: "/exhibitions", label: "전시", icon: Palette },
  { href: "/search", label: "검색", icon: Search },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 h-14 overflow-x-auto">
        <Link
          href="/"
          className="text-2xl font-black mr-6 whitespace-nowrap text-[var(--accent)]"
          style={{
            letterSpacing: "-0.04em",
            fontFamily: "var(--font-pretendard), sans-serif",
          }}
        >
          DAMCHA
        </Link>
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{ fontFamily: "var(--font-display), sans-serif" }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-base transition-colors whitespace-nowrap",
                active
                  ? "bg-[var(--muted-bg)] text-[var(--foreground)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
