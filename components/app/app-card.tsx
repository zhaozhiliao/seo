import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { AppConfig } from "@/lib/apps";

/** App overview card (/apps). Uses the App's brandColor as a local accent dot. */
export function AppCard({ app }: { app: AppConfig }) {
  return (
    <Link
      href={`/apps/${app.slug}`}
      className="group flex flex-col rounded-lg border border-border bg-bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-bold text-white"
          style={{ background: app.brandColor ?? "var(--brand)" }}
        >
          {app.name.charAt(0)}
        </span>
        <ArrowUpRight
          size={16}
          className="text-fg-subtle transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
        />
      </div>
      <h3 className="text-base font-semibold tracking-tight transition-colors group-hover:text-brand">{app.name}</h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-fg-muted">{app.tagline}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {app.nav.map((n) => (
          <span key={n} className="rounded-sm bg-bg-subtle px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-fg-subtle">
            {n}
          </span>
        ))}
      </div>
    </Link>
  );
}
