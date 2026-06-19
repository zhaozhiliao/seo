"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type SidebarTreeNode = {
  type: string;
  name?: React.ReactNode;
  url?: string;
  children?: SidebarTreeNode[];
};

function NodeList({ nodes, pathname }: { nodes: SidebarTreeNode[]; pathname: string }) {
  return (
    <ul className="flex flex-col gap-0.5">
      {nodes.map((node, i) => (
        <SidebarNode key={i} node={node} pathname={pathname} />
      ))}
    </ul>
  );
}

function SidebarNode({ node, pathname }: { node: SidebarTreeNode; pathname: string }) {
  if (node.type === "separator") {
    return (
      <li className="mt-4 first:mt-0">
        <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-widest text-fg-subtle">
          {node.name}
        </p>
      </li>
    );
  }

  if (node.type === "folder" && node.children?.length) {
    return (
      <li>
        <p className="mb-1 px-3 text-xs font-semibold text-fg-muted">{node.name}</p>
        <NodeList nodes={node.children} pathname={pathname} />
      </li>
    );
  }

  if (node.type === "page" && node.url) {
    const active = pathname === node.url;
    return (
      <li>
        <Link
          href={node.url}
          className={cn(
            "block rounded-md px-3 py-1.5 text-sm transition-colors",
            active
              ? "bg-brand-soft font-medium text-brand"
              : "text-fg-muted hover:bg-bg-subtle hover:text-fg"
          )}
        >
          {node.name}
        </Link>
      </li>
    );
  }

  return null;
}

/** Fumadocs page-tree sidebar (groups, folders, separators). */
export function DocsSidebarTree({ tree, title = "文档" }: { tree: SidebarTreeNode[]; title?: string }) {
  const pathname = usePathname();
  return (
    <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-fg-subtle">{title}</p>
      <div className="flex gap-1 overflow-x-auto pb-2 lg:block lg:overflow-visible lg:pb-0">
        <NodeList nodes={tree} pathname={pathname} />
      </div>
    </aside>
  );
}
