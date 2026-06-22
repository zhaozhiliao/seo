import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs, type Crumb } from "@/components/nav/breadcrumbs";
import { toolIconBox, toolIconClass } from "@/components/tools/tool-panel";
import { cn } from "@/lib/utils";

interface ToolShellProps {
  title: string;
  nameEn: string;
  description: string;
  icon: LucideIcon;
  /** Page width — `content` for AI forms, `page` for wide data tools. */
  width?: "page" | "content";
  /** Breadcrumb trail; defaults to 首页 › 工具 › <title>. */
  crumbs?: Crumb[];
  children: React.ReactNode;
}

/** Breadcrumb + title block for a single tool. Global nav/footer come from
    the root layout — this only renders the in-page chrome. */
export default function ToolShell({
  title,
  nameEn,
  description,
  icon: Icon,
  width = "page",
  crumbs,
  children,
}: ToolShellProps) {
  const trail: Crumb[] =
    crumbs ?? [{ label: "首页", href: "/" }, { label: "工具", href: "/tools" }, { label: title }];

  return (
    <Container width={width} className="py-10">
      <Breadcrumbs items={trail} />

      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <div className={cn(toolIconBox, "h-10 w-10")}>
            <Icon size={18} className={toolIconClass} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-fg">{title}</h1>
            <p className="font-mono text-xs text-fg-muted">{nameEn}</p>
          </div>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-fg-muted">{description}</p>
      </div>

      {children}
    </Container>
  );
}
