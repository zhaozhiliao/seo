import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXContent } from "@/components/mdx/mdx-content";
import { Toc } from "@/components/docs/toc";
import { getApp, getAllApps } from "@/lib/apps";
import { getAppDocsSource } from "@/lib/app-docs-source";
import { DocsPageActions } from "@/components/docs/docs-page-actions";
import { buildMetadata } from "@/lib/seo";
import { docGithubUrl, docMarkdownUrl } from "@/lib/doc-markdown";
import { appBaseUrl } from "@/lib/app-url";

export function generateStaticParams() {
  return getAllApps().flatMap((a) => {
    const source = getAppDocsSource(a.slug);
    if (!source) return [];
    return source.generateParams().map((p) => ({ app: a.slug, slug: p.slug }));
  });
}

export async function generateMetadata({ params }: { params: Promise<{ app: string; slug?: string[] }> }): Promise<Metadata> {
  const { app, slug } = await params;
  const source = getAppDocsSource(app);
  const page = source?.getPage(slug);
  if (!page) return {};
  return buildMetadata({
    title: page.data.title,
    description: page.data.description,
    path: `${appBaseUrl(app)}${page.url}`,
  });
}

export default async function AppDocPage({ params }: { params: Promise<{ app: string; slug?: string[] }> }) {
  const { app: appSlug, slug } = await params;
  const app = getApp(appSlug);
  const source = getAppDocsSource(appSlug);
  if (!app || !source) notFound();

  const page = source.getPage(slug);
  if (!page) notFound();

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_200px]">
      <article className="min-w-0">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">{page.data.title}</h1>
        {page.data.description && <p className="mb-6 text-lg text-fg-muted">{page.data.description}</p>}
        <DocsPageActions
          markdownUrl={docMarkdownUrl(page.url)}
          githubUrl={docGithubUrl(page.absolutePath)}
        />
        <MDXContent body={page.data.body} />
      </article>
      <Toc items={page.data.toc} />
    </div>
  );
}
