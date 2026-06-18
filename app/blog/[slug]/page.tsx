import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PostHeader } from "@/components/blog/post-header";
import { MDXContent } from "@/components/mdx/mdx-content";
import { getBlogPost, getBlogPosts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getBlogPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${params.slug}`,
    type: "article",
    date: post.date,
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  return (
    <Container width="content" className="py-12">
      <Link href="/blog" className="mb-8 inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-brand">
        <ArrowLeft size={14} /> 返回博客
      </Link>
      <article>
        <PostHeader title={post.title} description={post.description} date={post.date} tags={post.tags} />
        <MDXContent body={post.body} />
      </article>
    </Container>
  );
}
