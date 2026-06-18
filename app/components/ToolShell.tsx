import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/container";

interface ToolShellProps {
  title: string;
  nameEn: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

/** Breadcrumb + title block for a single tool. Global nav/footer come from
    the root layout — this only renders the in-page chrome. */
export default function ToolShell({ title, nameEn, description, icon: Icon, children }: ToolShellProps) {
  return (
    <Container className="py-10">
      <nav className="mb-5 flex items-center gap-1.5 text-xs">
        <Link href="/tools" className="text-fg-muted transition-colors hover:text-brand">
          工具
        </Link>
        <ChevronRight size={13} className="text-fg-subtle" aria-hidden="true" />
        <span className="font-medium text-fg">{title}</span>
      </nav>

      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-card">
            <Icon size={18} className="text-fg-muted" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="font-mono text-xs text-fg-muted">{nameEn}</p>
          </div>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-fg-muted">{description}</p>
      </div>

      {children}
    </Container>
  );
}
