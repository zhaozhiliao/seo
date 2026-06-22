import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Shared Geist site tokens for tool UI — use instead of shadcn defaults in tools. */
export const toolIconBox = "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bg-subtle";
export const toolIconClass = "text-fg-muted";
export const toolSegment = "flex rounded-lg bg-bg-subtle p-0.5 text-xs font-medium";
export const toolSegmentActive = "rounded-md bg-bg text-fg shadow-sm";
export const toolSegmentInactive = "text-fg-muted hover:text-fg";
export const toolChipActive = "border-brand bg-brand text-white shadow-sm";
export const toolChipInactive =
  "border-border bg-bg text-fg-muted hover:border-border-strong hover:text-fg";
export const toolInset = "rounded-xl bg-bg-subtle p-4";
export const toolListSelected = "bg-brand-soft text-brand font-medium";
export const toolListHover = "hover:bg-bg-subtle";

export function ToolPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-bg-card shadow-sm", className)}>{children}</div>
  );
}

export function ToolPanelHeader({
  icon: Icon,
  title,
  description,
  actions,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-border/60 px-6 py-4",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <div className={toolIconBox}>
            <Icon size={16} className={toolIconClass} aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold leading-tight text-fg">{title}</h2>
          {description && <p className="text-xs text-fg-muted">{description}</p>}
        </div>
      </div>
      {actions}
    </div>
  );
}

export function ToolPanelBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-6", className)}>{children}</div>;
}
