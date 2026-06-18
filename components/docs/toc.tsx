import type { TableOfContents } from "fumadocs-core/toc";

/** Right-rail table of contents. Hidden below lg (§5.5). */
export function Toc({ items }: { items: TableOfContents }) {
  if (!items?.length) return null;
  return (
    <nav className="sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-auto text-sm lg:block">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-fg-subtle">本页目录</p>
      <ul className="space-y-2 border-l border-border">
        {items.map((item) => (
          <li key={item.url} style={{ paddingLeft: `${(item.depth - 1) * 12}px` }}>
            <a
              href={item.url}
              className="-ml-px block border-l border-transparent pl-3 text-fg-muted transition-colors hover:border-brand hover:text-brand"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
