import Link from "next/link";
import { cn } from "@/lib/utils";

export interface FooterLink {
  href: string;
  label: string;
  external?: boolean;
}

/** A titled link column for site / App footers. */
export function FooterLinkColumn({
  title,
  links,
  className,
}: {
  title: string;
  links: FooterLink[];
  className?: string;
}) {
  if (!links.length) return null;

  return (
    <div className={cn("min-w-[7rem]", className)}>
      <p className="mb-3 text-sm font-medium text-fg">{title}</p>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href + l.label}>
            {l.external ? (
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-fg-muted transition-colors hover:text-brand"
              >
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="text-sm text-fg-muted transition-colors hover:text-brand">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Shared footer shell: brand block left, link columns right. */
export function FooterShell({
  brand,
  copyright,
  columns,
}: {
  brand: React.ReactNode;
  copyright: string;
  columns: React.ReactNode;
}) {
  return (
    <footer className="mt-24 border-t border-border bg-bg-subtle">
      <div
        className="mx-auto flex flex-col gap-10 px-6 py-12 lg:flex-row lg:items-start lg:justify-between"
        style={{ maxWidth: "var(--page-max)" }}
      >
        <div className="shrink-0">
          {brand}
          <p className="mt-4 text-xs text-fg-subtle">{copyright}</p>
        </div>
        <div className="flex flex-wrap gap-10 sm:gap-12 lg:gap-16">{columns}</div>
      </div>
    </footer>
  );
}
