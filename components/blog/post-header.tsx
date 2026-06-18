import { formatDate } from "@/lib/format";

export function PostHeader({
  title,
  description,
  date,
  tags,
}: {
  title: string;
  description?: string;
  date?: string | Date;
  tags?: string[];
}) {
  return (
    <header className="mb-8 border-b border-border pb-8">
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-fg-subtle">
        {date && <time dateTime={new Date(date).toISOString()}>{formatDate(date)}</time>}
        {tags?.map((t) => (
          <span key={t} className="rounded-sm bg-brand-soft px-1.5 py-0.5 text-brand">
            {t}
          </span>
        ))}
      </div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {description && <p className="mt-3 text-lg text-fg-muted">{description}</p>}
    </header>
  );
}
