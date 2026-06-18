"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AppConfig } from "@/lib/apps";

const LABELS: Record<string, string> = { docs: "文档", blog: "博客", changelog: "更新日志" };

/** App-level sub-nav: brand chip + intro link + enabled subpages (§3). */
export function AppHeader({ app }: { app: AppConfig }) {
  const pathname = usePathname();
  const base = `/apps/${app.slug}`;

  const tabs = [
    { href: base, label: "介绍", match: (p: string) => p === base },
    ...app.nav.map((n) => ({
      href: `${base}/${n}`,
      label: LABELS[n],
      match: (p: string) => p === `${base}/${n}` || p.startsWith(`${base}/${n}/`),
    })),
  ];

  return (
    <div className="border-b border-border bg-bg-subtle/60">
      <div className="mx-auto flex h-12 items-center gap-1 overflow-x-auto px-6" style={{ maxWidth: "var(--page-max)" }}>
        <Link href={base} className="mr-2 flex items-center gap-2 font-semibold">
          <span
            className="flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold text-white"
            style={{ background: app.brandColor ?? "var(--brand)" }}
          >
            {app.name.charAt(0)}
          </span>
          <span className="text-sm">{app.name}</span>
        </Link>
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors",
              t.match(pathname) ? "text-brand" : "text-fg-muted hover:text-fg"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
