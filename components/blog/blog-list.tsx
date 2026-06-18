import { BlogCard, type BlogCardData } from "@/components/blog/blog-card";

export function BlogList({ posts, base }: { posts: BlogCardData[]; base: string }) {
  if (!posts.length) {
    return <p className="text-sm text-fg-muted">还没有文章。</p>;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {posts.map((p) => (
        <BlogCard key={p.slug} post={p} base={base} />
      ))}
    </div>
  );
}
