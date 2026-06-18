import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { AppCard } from "@/components/app/app-card";
import { getAllApps } from "@/lib/apps";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Apps",
  description: "我做的几个 App，及其文档与更新日志。",
  path: "/apps",
});

export default function AppsPage() {
  const apps = getAllApps();
  return (
    <Container className="py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Apps</h1>
        <p className="mt-2 text-fg-muted">我做的几个 App，点进去看介绍、文档与更新日志。</p>
      </header>
      {apps.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((a) => (
            <AppCard key={a.slug} app={a} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-fg-muted">还没有上架的 App。</p>
      )}
    </Container>
  );
}
