import { apps, type AppConfig, type AppNav } from "@/content/apps/apps.config";

export type { AppConfig, AppNav };

export function getAllApps(): AppConfig[] {
  return apps;
}

export function getApp(slug: string): AppConfig | undefined {
  return apps.find((a) => a.slug === slug);
}

export function appHasNav(app: AppConfig, nav: AppNav): boolean {
  return app.nav.includes(nav);
}
