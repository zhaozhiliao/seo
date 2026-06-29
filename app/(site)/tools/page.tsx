import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, KeyRound } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { TOOLS, type ToolMeta } from "@/app/(site)/tools/registry";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "工具",
  description: "几个顺手的 SEO 工具：关键词探索、E-E-A-T 评估、Slug、Schema、UI 文案翻译。",
  path: "/tools",
});

export default function ToolsPage() {
  return (
    <PageLayout crumbs={[{ label: "首页", href: "/" }, { label: "工具" }]} pagePath="/tools">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">工具</h1>
          <p className="mt-2 text-fg-muted">{TOOLS.length} 个 SEO 工具可用。</p>
        </div>
        <Button variant="outline" render={<Link href="/tools/settings" />} className="shrink-0 gap-2">
          <KeyRound size={16} aria-hidden="true" />
          API 设置
        </Button>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>
    </PageLayout>
  );
}

function ToolCard({ tool }: { tool: ToolMeta }) {
  const Icon = tool.icon;
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col rounded-lg border border-border bg-bg-card p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-bg-inset">
          <Icon size={16} className="text-fg-muted" />
        </span>
        <ArrowUpRight
          size={16}
          className="text-fg-subtle transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
        />
      </div>
      <h3 className="text-base font-semibold tracking-tight transition-colors group-hover:text-brand">{tool.name}</h3>
      <p className="mt-0.5 font-mono text-[11px] text-fg-subtle">{tool.nameEn}</p>
      <p className="mt-2 line-clamp-2 flex-1 text-sm text-fg-muted">{tool.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tool.tags.map((tag) => (
          <span key={tag} className="rounded-sm bg-bg-inset px-1.5 py-0.5 text-[11px] text-fg-subtle">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
