import { cn } from "@/lib/utils";

/** Page container. `width` picks the reading vs. landing max-width (§5.2). */
export function Container({
  children,
  className,
  width = "page",
}: {
  children: React.ReactNode;
  className?: string;
  width?: "page" | "content";
}) {
  return (
    <div
      className={cn("mx-auto w-full px-6", className)}
      style={{ maxWidth: width === "content" ? "var(--content-max)" : "var(--page-max)" }}
    >
      {children}
    </div>
  );
}
