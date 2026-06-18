import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXContent } from "@/components/mdx/mdx-content";
import { Toc } from "@/components/docs/toc";
import { getApp, appHasNav, getAllApps } from "@/lib/apps";
import { getAppDoc, getAppDocsNav } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getAllApps()
    .filter((a) => a.nav.includes("docs"))
    .flatMap((a) => getAppDocsNav(a.slug).map((n) => ({ app: a.slug, slug: n.slugs })));
}

export function generateMetadata({ params }: { params: { app: string; slug?: string[] } }): Metadata {
  const doc = getAppDoc(params.app, params.slug ?? []);
  if (!doc) return {};
  return buildMetadata({
    title: doc.title,
    description: doc.description,
    path: `/apps/${params.app}/docs${params.slug?.length ? "/" + params.slug.join("/") : ""}`,
  });
}

export default function AppDocPage({ params }: { params: { app: string; slug?: string[] } }) {
  const app = getApp(params.app);
  if (!app || !appHasNav(app, "docs")) notFound();

  const doc = getAppDoc(params.app, params.slug ?? []);
  if (!doc) notFound();

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_200px]">
      <article className="min-w-0">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">{doc.title}</h1>
        {doc.description && <p className="mb-6 text-lg text-fg-muted">{doc.description}</p>}
        <MDXContent body={doc.body} />
      </article>
      <Toc items={doc.toc} />
    </div>
  );
}
