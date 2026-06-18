import Link from "next/link";
import { formatDate } from "@/lib/format";

export interface BlogCardData {
  slug: string;
  title: string;
  description?: string;
  date?: string | Date;
  tags?: string[];
}

/** Blog list item. `base` is the href prefix (e.g. /blog or /apps/app1/blog). */
export function BlogCard({ post, base }: { post: BlogCardData; base: string }) {
  return (
    <Link
      href={`${base}/${post.slug}`}
      className="group block rounded-lg border border-border bg-bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-2 flex items-center gap-3 text-xs text-fg-subtle">
        {post.date && <time dateTime={new Date(post.date).toISOString()}>{formatDate(post.date)}</time>}
        {post.tags?.slice(0, 2).map((t) => (
          <span key={t} className="rounded-sm bg-brand-soft px-1.5 py-0.5 text-brand">
            {t}
          </span>
        ))}
      </div>
      <h3 className="text-base font-semibold tracking-tight transition-colors group-hover:text-brand">
        {post.title}
      </h3>
      {post.description && <p className="mt-1.5 line-clamp-2 text-sm text-fg-muted">{post.description}</p>}
    </Link>
  );
}
