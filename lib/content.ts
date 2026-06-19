/**
 * Content access layer. Wraps the Fumadocs-generated collections so routes
 * never import `.source` directly. App content lives in one flat collection
 * each and is filtered by app slug here (see ARCHITECTURE.md §4).
 */
import { blog, appChangelog } from "@/.source/server";
import type { ComponentType } from "react";
import type { TableOfContents } from "fumadocs-core/toc";

export interface DocEntry {
  title: string;
  description?: string;
  date?: string | Date;
  tags?: string[];
  order?: number;
  version?: string;
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

export { appHasDocs } from "@/lib/app-docs-source";

/* ══════════════ App changelog (parallel to docs) ══════════════ */
const appChangelogOf = (app: string) =>
  (appChangelog as unknown as DocEntry[]).filter((p) => p.info.path.startsWith(`${app}/changelog/`));

/** Version entries for an App, newest first. */
export function getAppChangelog(app: string): DocEntry[] {
  return appChangelogOf(app).sort(byDateDesc);
}

export function appHasChangelog(app: string): boolean {
  return appChangelogOf(app).length > 0;
}
