"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  title: string;
  href: string;
}

/** Left docs sidebar. Sticky on desktop, scrolls into a strip on mobile (§5.5). */
export function DocsSidebar({ items, title = "文档" }: { items: SidebarItem[]; title?: string }) {
  const pathname = usePathname();
  return (
    <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-fg-subtle">{title}</p>
      <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                className={cn(
                  "block whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors lg:whitespace-normal",
                  active
                    ? "bg-brand-soft font-medium text-brand"
                    : "text-fg-muted hover:bg-bg-subtle hover:text-fg"
                )}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
