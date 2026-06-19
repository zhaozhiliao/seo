import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { AppHero } from "@/components/app/app-hero";
import { AppLanding } from "@/components/app/app-landing";
import { getApp } from "@/lib/apps";
import { appHasDocs } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { appBaseUrl } from "@/lib/app-url";

export async function generateMetadata({ params }: { params: Promise<{ app: string }> }): Promise<Metadata> {
  const { app: appSlug } = await params;
  const app = getApp(appSlug);
  if (!app) return {};
  return {
    ...buildMetadata({
      title: app.name,
      description: app.landing?.subhead ?? app.tagline,
      path: appBaseUrl(app.slug),
    }),
    title: { absolute: app.landing?.headline?.split(" - ")[0] ?? app.name },
  };
}

export default async function AppHomePage({ params }: { params: Promise<{ app: string }> }) {
  const { app: appSlug } = await params;
  const app = getApp(appSlug);
  if (!app) notFound();

  if (app.landing) return <AppLanding app={app} landing={app.landing} />;

  return (
    <Container width="content">
      <AppHero app={app} hasDocs={appHasDocs(app.slug)} />
    </Container>
  );
}
