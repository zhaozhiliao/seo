import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { getApp, appHasNav } from "@/lib/apps";
import { getAppDocsNav } from "@/lib/content";

export default function AppDocsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { app: string };
}) {
  const app = getApp(params.app);
  if (!app || !appHasNav(app, "docs")) notFound();

  const items = getAppDocsNav(app.slug).map((n) => ({ title: n.title, href: n.href }));

  return (
    <Container className="py-10">
      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <DocsSidebar items={items} title={`${app.name} 文档`} />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
