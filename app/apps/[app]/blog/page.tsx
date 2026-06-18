import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { BlogList } from "@/components/blog/blog-list";
import { getApp, appHasNav } from "@/lib/apps";
import { getAppBlogPosts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata({ params }: { params: { app: string } }): Metadata {
  const app = getApp(params.app);
  if (!app) return {};
  return buildMetadata({ title: `${app.name} 博客`, description: `${app.name} 的动态与文章。`, path: `/apps/${app.slug}/blog` });
}

export default function AppBlogPage({ params }: { params: { app: string } }) {
  const app = getApp(params.app);
  if (!app || !appHasNav(app, "blog")) notFound();

  const posts = getAppBlogPosts(app.slug);
  return (
    <Container className="py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{app.name} 博客</h1>
        <p className="mt-2 text-fg-muted">{app.name} 的动态与文章。</p>
      </header>
      <BlogList posts={posts} base={`/apps/${app.slug}/blog`} />
    </Container>
  );
}
