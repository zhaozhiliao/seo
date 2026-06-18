import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import { TOOLS, getTool } from "@/app/tools/registry";
import { ToolBody } from "./tool-body";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  return buildMetadata({ title: tool.name, description: tool.description, path: `/tools/${tool.slug}` });
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  return (
    <ToolShell title={tool.name} nameEn={tool.nameEn} description={tool.description} icon={tool.icon}>
      <ToolBody slug={tool.slug} />
    </ToolShell>
  );
}
