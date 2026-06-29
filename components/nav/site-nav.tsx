"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const LINKS = [{ href: "/tools", label: "Tools" }];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 items-center gap-6 px-6" style={{ maxWidth: "var(--page-max)" }}>
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-80">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand text-[13px] font-bold text-white">W</span>
          <span className="text-sm">wikipie</span>
        </Link>

        {/* Desktop links */}
        <div className="ml-2 hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                isActive(l.href) ? "text-brand" : "text-fg-muted hover:text-fg"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label="菜单"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-fg-muted md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-bg px-6 py-3 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-md px-3 py-2 text-sm transition-colors",
                isActive(l.href) ? "text-brand" : "text-fg-muted hover:text-fg"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
