import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXContent } from "@/components/mdx/mdx-content";
import { Toc } from "@/components/docs/toc";
import { getApp, getAllApps } from "@/lib/apps";
import { getAppDoc, getAppDocsNav } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getAllApps().flatMap((a) =>
    getAppDocsNav(a.slug).map((n) => ({ app: a.slug, slug: n.slugs }))
  );
}

export async function generateMetadata({ params }: { params: Promise<{ app: string; slug?: string[] }> }): Promise<Metadata> {
  const { app, slug } = await params;
  const doc = getAppDoc(app, slug ?? []);
  if (!doc) return {};
  return buildMetadata({
    title: doc.title,
    description: doc.description,
    path: `/apps/${app}/docs${slug?.length ? "/" + slug.join("/") : ""}`,
  });
}

export default async function AppDocPage({ params }: { params: Promise<{ app: string; slug?: string[] }> }) {
  const { app: appSlug, slug } = await params;
  const app = getApp(appSlug);
  if (!app) notFound();

  const doc = getAppDoc(appSlug, slug ?? []);
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
