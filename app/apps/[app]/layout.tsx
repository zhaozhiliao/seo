import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { getAllApps, getApp } from "@/lib/apps";

export function generateStaticParams() {
  return getAllApps().map((a) => ({ app: a.slug }));
}

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ app: string }>;
}) {
  const { app: appSlug } = await params;
  const app = getApp(appSlug);
  if (!app) notFound();

  // Inject the App's brand color as --brand for this subtree (§3).
  const style = app.brandColor ? ({ "--brand": app.brandColor } as CSSProperties) : undefined;

  return <div style={style}>{children}</div>;
}
