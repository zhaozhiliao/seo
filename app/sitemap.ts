import type { MetadataRoute } from "next";
import { docsSource } from "@/lib/source";
import { TOOLS } from "@/app/tools/registry";
import { getAllApps } from "@/lib/apps";
import { getBlogPosts, getAppDocsNav, getAppBlogPosts } from "@/lib/content";

const BASE = "https://wikipie.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = new Set<string>(["/", "/blog", "/docs", "/tools", "/apps"]);

  getBlogPosts().forEach((p) => paths.add(`/blog/${p.slug}`));
  docsSource.getPages().forEach((pg) => paths.add(pg.url));
  TOOLS.forEach((t) => paths.add(`/tools/${t.slug}`));

  for (const app of getAllApps()) {
    paths.add(`/apps/${app.slug}`);
    if (app.nav.includes("docs")) {
      paths.add(`/apps/${app.slug}/docs`);
      getAppDocsNav(app.slug).forEach((n) => paths.add(n.href));
    }
    if (app.nav.includes("blog")) {
      paths.add(`/apps/${app.slug}/blog`);
      getAppBlogPosts(app.slug).forEach((p) => paths.add(`/apps/${app.slug}/blog/${p.slug}`));
    }
    if (app.nav.includes("changelog")) paths.add(`/apps/${app.slug}/changelog`);
  }

  const now = new Date();
  return Array.from(paths).map((p) => ({ url: `${BASE}${p}`, lastModified: now }));
}
