import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  /** omit for the current (last) page */
  href?: string;
}

/** Hierarchical breadcrumb trail (layer by layer). The last item renders as
    the current page (no link). */
export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  return (
    <nav className={`mb-5 flex flex-wrap items-center gap-1.5 text-xs ${className}`} aria-label="面包屑">
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <span key={`${c.label}-${i}`} className="flex items-center gap-1.5">
            {c.href && !last ? (
              <Link href={c.href} className="text-fg-muted transition-colors hover:text-brand">
                {c.label}
              </Link>
            ) : (
              <span className={last ? "font-medium text-fg" : "text-fg-muted"}>{c.label}</span>
            )}
            {!last && <ChevronRight size={13} className="text-fg-subtle" aria-hidden="true" />}
          </span>
        );
      })}
    </nav>
  );
}
