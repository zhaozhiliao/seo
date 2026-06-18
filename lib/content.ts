/**
 * Content access layer. Wraps the Fumadocs-generated collections so routes
 * never import `.source` directly. App content lives in one flat collection
 * each and is filtered by app slug here (see ARCHITECTURE.md §4).
 */
import { blog, appDocs } from "@/.source/server";
import type { ComponentType } from "react";
import type { TableOfContents } from "fumadocs-core/toc";

export interface DocEntry {
  title: string;
  description?: string;
  date?: string | Date;
  tags?: string[];
  order?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: ComponentType<any>;
  toc: TableOfContents;
  info: { path: string };
}

export interface BlogMeta {
  slug: string;
  title: string;
  description?: string;
  date?: string | Date;
  tags?: string[];
}

/* ── helpers ── */
const stripExt = (p: string) => p.replace(/\.mdx$/, "");
const ts = (d?: string | Date) => (d ? new Date(d).getTime() : 0);
const byDateDesc = (a: { date?: string | Date }, b: { date?: string | Date }) => ts(b.date) - ts(a.date);

/** segments after `<app>/<section>/`, with `index` collapsed to []. */
function tailSlugs(path: string, section: string): string[] {
  const parts = stripExt(path).split("/"); // [app, section, ...rest]
  const idx = parts.indexOf(section);
  const rest = parts.slice(idx + 1);
  if (rest.length === 1 && rest[0] === "index") return [];
  return rest;
}

/* ══════════════ Personal blog ══════════════ */
export function getBlogPosts(): BlogMeta[] {
  return (blog as unknown as DocEntry[])
    .map((p) => ({
      slug: stripExt(p.info.path),
      title: p.title,
      description: p.description,
      date: p.date,
      tags: p.tags,
    }))
    .sort(byDateDesc);
}

export function getBlogPost(slug: string): DocEntry | undefined {
  return (blog as unknown as DocEntry[]).find((p) => stripExt(p.info.path) === slug);
}

/* ══════════════ App docs ══════════════ */
const appDocsOf = (app: string) =>
  (appDocs as unknown as DocEntry[]).filter((p) => p.info.path.startsWith(`${app}/docs/`));

export function getAppDocs(app: string): DocEntry[] {
  return appDocsOf(app).sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99)
  );
}

/** Sidebar items for an app's docs. */
export function getAppDocsNav(app: string) {
  return getAppDocs(app).map((p) => {
    const slugs = tailSlugs(p.info.path, "docs");
    return { title: p.title, slugs, href: `/apps/${app}/docs${slugs.length ? "/" + slugs.join("/") : ""}` };
  });
}

export function getAppDoc(app: string, slugs: string[] = []): DocEntry | undefined {
  return appDocsOf(app).find((p) => {
    const t = tailSlugs(p.info.path, "docs");
    return t.length === slugs.length && t.every((s, i) => s === slugs[i]);
  });
}

/** Whether an App has any docs content (drives the intro CTA + docs route). */
export function appHasDocs(app: string): boolean {
  return appDocsOf(app).length > 0;
}
