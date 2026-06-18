import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app/app-header";
import { getAllApps, getApp } from "@/lib/apps";

export function generateStaticParams() {
  return getAllApps().map((a) => ({ app: a.slug }));
}

export default function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { app: string };
}) {
  const app = getApp(params.app);
  if (!app) notFound();

  // Inject the App's brand color as --brand for this subtree (§3).
  const style = app.brandColor ? ({ "--brand": app.brandColor } as CSSProperties) : undefined;

  return (
    <div style={style}>
      <AppHeader app={app} />
      {children}
    </div>
  );
}
