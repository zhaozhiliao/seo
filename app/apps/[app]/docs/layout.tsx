import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import { getApp } from "@/lib/apps";
import { getAppDocsNav } from "@/lib/content";

export default async function AppDocsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ app: string }>;
}) {
  const { app: appSlug } = await params;
  const app = getApp(appSlug);
  const items = getAppDocsNav(appSlug).map((n) => ({ title: n.title, href: n.href }));
  if (!app || items.length === 0) notFound();

  return (
    <Container className="py-10">
      <Breadcrumbs
        items={[
          { label: "首页", href: "/" },
          { label: "Apps", href: "/apps" },
          { label: app.name, href: `/apps/${app.slug}` },
          { label: "文档" },
        ]}
      />
      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <DocsSidebar items={items} title={`${app.name} 文档`} />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
