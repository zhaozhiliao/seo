import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { AppHero } from "@/components/app/app-hero";
import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import { getApp } from "@/lib/apps";
import { appHasDocs } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ app: string }> }): Promise<Metadata> {
  const { app: appSlug } = await params;
  const app = getApp(appSlug);
  if (!app) return {};
  return buildMetadata({ title: app.name, description: app.tagline, path: `/apps/${app.slug}` });
}

export default async function AppHomePage({ params }: { params: Promise<{ app: string }> }) {
  const { app: appSlug } = await params;
  const app = getApp(appSlug);
  if (!app) notFound();

  return (
    <Container width="content" className="pt-8">
      <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: "Apps", href: "/apps" }, { label: app.name }]} />
      <AppHero app={app} hasDocs={appHasDocs(app.slug)} />
    </Container>
  );
}
