import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ToolShell from "@/app/components/ToolShell";
import { TOOLS, getTool } from "@/app/tools/registry";
import { ToolBody } from "./tool-body";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tool = getTool(params.slug);
  if (!tool) return {};
  return buildMetadata({ title: tool.name, description: tool.description, path: `/tools/${tool.slug}` });
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = getTool(params.slug);
  if (!tool) notFound();

  return (
    <ToolShell title={tool.name} nameEn={tool.nameEn} description={tool.description} icon={tool.icon}>
      <ToolBody slug={tool.slug} />
    </ToolShell>
  );
}
