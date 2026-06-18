import { Container } from "@/components/ui/container";
import { DocsSidebar, type SidebarItem } from "@/components/docs/docs-sidebar";
import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import { docsSource } from "@/lib/source";

/** Flatten the Fumadocs page tree into a flat sidebar (docs here are shallow). */
function sidebarItems(): SidebarItem[] {
  const out: SidebarItem[] = [];
  type Node = { type: string; name?: React.ReactNode; url?: string; children?: Node[] };
  const walk = (nodes: Node[]) => {
    for (const n of nodes) {
      if (n.type === "page" && n.url) out.push({ title: String(n.name), href: n.url });
      if (n.children) walk(n.children);
    }
  };
  walk((docsSource.pageTree.children ?? []) as Node[]);
  return out;
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: "文档" }]} />
      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <DocsSidebar items={sidebarItems()} title="文档" />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
