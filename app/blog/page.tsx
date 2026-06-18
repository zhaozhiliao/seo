import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { BlogList } from "@/components/blog/blog-list";
import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import { getBlogPosts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "博客",
  description: "随笔、记录与想法。",
  path: "/blog",
});

export default function BlogIndexPage() {
  const posts = getBlogPosts();
  return (
    <Container className="py-12">
      <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: "博客" }]} />
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">博客</h1>
        <p className="mt-2 text-fg-muted">随笔、记录与想法。</p>
      </header>
      <BlogList posts={posts} base="/blog" />
    </Container>
  );
}
