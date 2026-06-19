import type { MetadataRoute } from "next";
import { docsSource } from "@/lib/source";
import { TOOLS } from "@/app/(site)/tools/registry";
import { getAllApps } from "@/lib/apps";
import { getBlogPosts, appHasChangelog } from "@/lib/content";
import { getAppDocsSource } from "@/lib/app-docs-source";
import { appBaseUrl } from "@/lib/app-url";

const BASE = "https://wikipie.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];
  const add = (url: string) => entries.push({ url, lastModified: now });

  // Personal site (wikipie.com)
  const personal = new Set<string>(["/", "/blog", "/docs", "/tools", "/apps"]);
  getBlogPosts().forEach((p) => personal.add(`/blog/${p.slug}`));
  docsSource.getPages().forEach((pg) => personal.add(pg.url));
  TOOLS.forEach((t) => personal.add(`/tools/${t.slug}`));
  personal.forEach((p) => add(`${BASE}${p}`));

  // Each App is its own site on its subdomain
  for (const app of getAllApps()) {
    const base = appBaseUrl(app.slug);
    add(base);
    const source = getAppDocsSource(app.slug);
    if (source) {
      add(`${base}/docs`);
      source.getPages().forEach((pg) => add(`${base}${pg.url}`));
    }
    if (appHasChangelog(app.slug)) add(`${base}/changelog`);
  }

  return entries;
}
