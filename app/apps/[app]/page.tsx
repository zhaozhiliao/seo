import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { AppHero } from "@/components/app/app-hero";
import { getApp } from "@/lib/apps";
import { buildMetadata } from "@/lib/seo";

const NAV_LABEL: Record<string, string> = { docs: "文档", blog: "博客", changelog: "更新日志" };
const NAV_DESC: Record<string, string> = {
  docs: "安装、配置与使用说明",
  blog: "版本动态与背后的想法",
  changelog: "每个版本改了什么",
};

export function generateMetadata({ params }: { params: { app: string } }): Metadata {
  const app = getApp(params.app);
  if (!app) return {};
  return buildMetadata({ title: app.name, description: app.tagline, path: `/apps/${app.slug}` });
}

export default function AppHomePage({ params }: { params: { app: string } }) {
  const app = getApp(params.app);
  if (!app) notFound();
  const base = `/apps/${app.slug}`;

  return (
    <Container width="content">
      <AppHero app={app} />

      <div className="grid gap-3 pb-16 sm:grid-cols-3">
        {app.nav.map((n) => (
          <Link
            key={n}
            href={`${base}/${n}`}
            className="group rounded-lg border border-border bg-bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold transition-colors group-hover:text-brand">{NAV_LABEL[n]}</span>
              <ArrowUpRight size={15} className="text-fg-subtle transition-colors group-hover:text-brand" />
            </div>
            <p className="mt-1 text-sm text-fg-muted">{NAV_DESC[n]}</p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
