import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXContent } from "@/components/mdx/mdx-content";
import { Toc } from "@/components/docs/toc";
import { docsSource } from "@/lib/source";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return docsSource.generateParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = docsSource.getPage(slug);
  if (!page) return {};
  return buildMetadata({
    title: page.data.title,
    description: page.data.description,
    path: page.url,
  });
}

export default async function DocsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const page = docsSource.getPage(slug);
  if (!page) notFound();

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_200px]">
      <article className="min-w-0">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">{page.data.title}</h1>
        {page.data.description && <p className="mb-6 text-lg text-fg-muted">{page.data.description}</p>}
        <MDXContent body={page.data.body} />
      </article>
      <Toc items={page.data.toc} />
    </div>
  );
}
