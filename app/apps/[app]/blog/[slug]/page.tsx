import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PostHeader } from "@/components/blog/post-header";
import { MDXContent } from "@/components/mdx/mdx-content";
import { getApp, appHasNav, getAllApps } from "@/lib/apps";
import { getAppBlogPost, getAppBlogPosts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getAllApps()
    .filter((a) => a.nav.includes("blog"))
    .flatMap((a) => getAppBlogPosts(a.slug).map((p) => ({ app: a.slug, slug: p.slug })));
}

export function generateMetadata({ params }: { params: { app: string; slug: string } }): Metadata {
  const post = getAppBlogPost(params.app, params.slug);
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/apps/${params.app}/blog/${params.slug}`,
    type: "article",
    date: post.date,
  });
}

export default function AppBlogPostPage({ params }: { params: { app: string; slug: string } }) {
  const app = getApp(params.app);
  if (!app || !appHasNav(app, "blog")) notFound();

  const post = getAppBlogPost(params.app, params.slug);
  if (!post) notFound();

  return (
    <Container width="content" className="py-12">
      <Link
        href={`/apps/${app.slug}/blog`}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-brand"
      >
        <ArrowLeft size={14} /> 返回 {app.name} 博客
      </Link>
      <article>
        <PostHeader title={post.title} description={post.description} date={post.date} tags={post.tags} />
        <MDXContent body={post.body} />
      </article>
    </Container>
  );
}
