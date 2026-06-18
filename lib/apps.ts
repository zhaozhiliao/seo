import { apps, type AppConfig } from "@/content/apps/apps.config";

export type { AppConfig };

export function getAllApps(): AppConfig[] {
  return apps;
}

export function getApp(slug: string): AppConfig | undefined {
  return apps.find((a) => a.slug === slug);
}
