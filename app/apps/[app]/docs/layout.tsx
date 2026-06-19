import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { DocsSidebarTree } from "@/components/docs/docs-sidebar-tree";
import { getApp } from "@/lib/apps";
import { appHasDocs, getAppDocsSource } from "@/lib/app-docs-source";

export default async function AppDocsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ app: string }>;
}) {
  const { app: appSlug } = await params;
  const app = getApp(appSlug);
  const source = getAppDocsSource(appSlug);
  if (!app || !source || !appHasDocs(appSlug)) notFound();

  const tree = (source.pageTree.children ?? []) as Parameters<typeof DocsSidebarTree>[0]["tree"];

  return (
    <Container className="py-10">
      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <DocsSidebarTree tree={tree} title="文档" />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
