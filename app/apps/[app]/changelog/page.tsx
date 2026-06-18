import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ChangelogList } from "@/components/app/changelog-list";
import { getApp, appHasNav } from "@/lib/apps";
import { getAppChangelog } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata({ params }: { params: { app: string } }): Metadata {
  const app = getApp(params.app);
  if (!app) return {};
  return buildMetadata({ title: `${app.name} 更新日志`, description: `${app.name} 的版本更新记录。`, path: `/apps/${app.slug}/changelog` });
}

export default function AppChangelogPage({ params }: { params: { app: string } }) {
  const app = getApp(params.app);
  if (!app || !appHasNav(app, "changelog")) notFound();

  const changelog = getAppChangelog(app.slug);

  return (
    <Container width="content" className="py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">更新日志</h1>
        <p className="mt-2 text-fg-muted">{app.name} 的版本更新记录。</p>
      </header>
      {changelog ? <ChangelogList body={changelog.body} /> : <p className="text-sm text-fg-muted">还没有更新记录。</p>}
    </Container>
  );
}
