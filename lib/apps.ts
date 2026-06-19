import { apps } from "@/content/apps/apps.config";
import type { AppConfig } from "@/content/apps/app-types";

export type { AppConfig };

export function getAllApps(): AppConfig[] {
  return apps;
}

export function getApp(slug: string): AppConfig | undefined {
  return apps.find((a) => a.slug === slug);
}
