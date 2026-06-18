import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs, type Crumb } from "@/components/nav/breadcrumbs";

interface ToolShellProps {
  title: string;
  nameEn: string;
  description: string;
  icon: LucideIcon;
  /** Breadcrumb trail; defaults to 首页 › 工具 › <title>. */
  crumbs?: Crumb[];
  children: React.ReactNode;
}

/** Breadcrumb + title block for a single tool. Global nav/footer come from
    the root layout — this only renders the in-page chrome. */
export default function ToolShell({ title, nameEn, description, icon: Icon, crumbs, children }: ToolShellProps) {
  const trail: Crumb[] =
    crumbs ?? [{ label: "首页", href: "/" }, { label: "工具", href: "/tools" }, { label: title }];

  return (
    <Container className="py-10">
      <Breadcrumbs items={trail} />

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
